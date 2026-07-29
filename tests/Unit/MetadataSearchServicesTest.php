<?php

namespace Tests\Unit;

use App\Enums\ArticleTempStatus;
use App\Jobs\FetchPubMedJob;
use App\Jobs\FetchScopusJob;
use App\Models\ArticleMetadataTemp;
use App\Models\FilteredArticle;
use App\Models\Keyword;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use App\Models\ResearchPlanKeyword;
use App\Models\ScimagoJournal;
use App\Services\MetadataSearchServices;
use App\Services\PubMedApiService;
use App\Services\ScopusApiService;
use Illuminate\Bus\Batch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Mockery;
use ReflectionClass;
use Tests\TestCase;

class MetadataSearchServicesTest extends TestCase
{
    use RefreshDatabase;

    protected $scopusApiMock;
    protected $pubmedApiMock;
    protected MetadataSearchServices $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->scopusApiMock = Mockery::mock(ScopusApiService::class);
        $this->pubmedApiMock = Mockery::mock(PubMedApiService::class);

        $this->service = new MetadataSearchServices(
            $this->scopusApiMock,
            $this->pubmedApiMock
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Helper to call a private/protected method via reflection.
     */
    protected function callPrivateMethod(object $object, string $methodName, array $args = [])
    {
        $reflection = new ReflectionClass($object);
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);

        return $method->invokeArgs($object, $args);
    }

    /**
     * Same as callPrivateMethod, but suppresses PHP warnings/notices raised
     * during the call (e.g. simplexml_load_string() on malformed XML).
     * Laravel's testing error handler converts such warnings into
     * ErrorException, but the service under test intentionally relies on
     * simplexml_load_string() returning false rather than throwing, so we
     * suppress here to exercise that intended behavior without editing
     * application code.
     */
    protected function callPrivateMethodSuppressed(object $object, string $methodName, array $args = [])
    {
        return @$this->callPrivateMethod($object, $methodName, $args);
    }

    // =========================================================================
    // getPreviewResults()
    // =========================================================================

    public function test_get_preview_results_returns_scopus_data_and_caches_it(): void
    {
        $keyword = Keyword::factory()->create(['keyword' => 'machine learning']);
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);

        $this->scopusApiMock->shouldReceive('searchPreviewWithTotal')
            ->once()
            ->with('machine learning', 2020, 2023, 25)
            ->andReturn([
                'total' => 150,
                'entries' => [
                    [
                        'dc:title' => 'A Study on ML',
                        'prism:coverDate' => '2022-05-01',
                        'dc:creator' => 'Doe J.',
                        'citedby-count' => '10',
                        'prism:issn' => '1234-5678',
                    ],
                ],
            ]);

        $result = $this->service->getPreviewResults([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2023,
        ], $plan->research_plan_id);

        $this->assertEquals('scopus', $result['source']);
        $this->assertEquals(150, $result['total_count']);
        $this->assertTrue($result['is_recommended']);
        $this->assertCount(1, $result['samples']);
        $this->assertEquals('A Study on ML', $result['samples'][0]['title']);
    }

    public function test_get_preview_results_returns_pubmed_data(): void
    {
        $keyword = Keyword::factory()->create(['keyword' => 'covid vaccine']);
        $plan = ResearchPlan::factory()->create(['source_database' => 'pubmed']);

        $this->pubmedApiMock->shouldReceive('searchIdsPreviewWithTotal')
            ->once()
            ->andReturn(['total' => 300, 'ids' => ['111']]);

        $this->pubmedApiMock->shouldReceive('fetchDetails')
            ->once()
            ->with(['111'])
            ->andReturn($this->samplePubMedArticleXml('111', 'Vaccine Efficacy', '2021'));

        $this->pubmedApiMock->shouldReceive('fetchCitations')
            ->once()
            ->with(['111'])
            ->andReturn($this->samplePubMedCitationXml('111', 5));

        $result = $this->service->getPreviewResults([
            'keyword_id' => $keyword->id,
            'start_year' => 2019,
            'end_year'   => 2023,
        ], $plan->research_plan_id);

        $this->assertEquals('pubmed', $result['source']);
        $this->assertEquals(300, $result['total_count']);
        $this->assertCount(1, $result['samples']);
        $this->assertEquals('Vaccine Efficacy', $result['samples'][0]['title']);
        $this->assertEquals(5, $result['samples'][0]['citation_count']);
    }

    public function test_get_preview_results_uses_cached_value_on_second_call(): void
    {
        $keyword = Keyword::factory()->create(['keyword' => 'ai ethics']);
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);

        // API should only be hit once even though we call the service twice.
        $this->scopusApiMock->shouldReceive('searchPreviewWithTotal')
            ->once()
            ->andReturn(['total' => 42, 'entries' => []]);

        $params = [
            'keyword_id' => $keyword->id,
            'start_year' => 2018,
            'end_year'   => 2020,
        ];

        $first = $this->service->getPreviewResults($params, $plan->research_plan_id);
        $second = $this->service->getPreviewResults($params, $plan->research_plan_id);

        $this->assertEquals($first, $second);
    }

    public function test_get_preview_results_is_recommended_flag_false_when_below_threshold(): void
    {
        $keyword = Keyword::factory()->create(['keyword' => 'niche topic']);
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);

        $this->scopusApiMock->shouldReceive('searchPreviewWithTotal')
            ->once()
            ->andReturn(['total' => 5, 'entries' => []]);

        $result = $this->service->getPreviewResults([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], $plan->research_plan_id);

        $this->assertFalse($result['is_recommended']);
    }

    public function test_get_preview_results_is_recommended_flag_false_when_above_threshold(): void
    {
        $keyword = Keyword::factory()->create(['keyword' => 'broad topic']);
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);

        $this->scopusApiMock->shouldReceive('searchPreviewWithTotal')
            ->once()
            ->andReturn(['total' => 10000, 'entries' => []]);

        $result = $this->service->getPreviewResults([
            'keyword_id' => $keyword->id,
            'start_year' => 2000,
            'end_year'   => 2023,
        ], $plan->research_plan_id);

        $this->assertFalse($result['is_recommended']);
    }

    public function test_get_preview_results_returns_empty_for_unknown_source(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create(['source_database' => 'unknown_source']);

        $result = $this->service->getPreviewResults([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], $plan->research_plan_id);

        $this->assertEquals(0, $result['total_count']);
        $this->assertEquals([], $result['samples']);
        $this->assertFalse($result['is_recommended']);
    }

    public function test_get_preview_results_throws_when_keyword_not_found(): void
    {
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);

        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->service->getPreviewResults([
            'keyword_id' => 999999,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], $plan->research_plan_id);
    }

    // =========================================================================
    // formatScopusSamples() [private, via reflection]
    // =========================================================================

    public function test_format_scopus_samples_maps_basic_fields_correctly(): void
    {
        $raw = [[
            'dc:title' => 'Deep Learning Review',
            'prism:coverDate' => '2020-03-15',
            'dc:creator' => 'Smith A.',
            'citedby-count' => '25',
        ]];

        $result = $this->callPrivateMethod($this->service, 'formatScopusSamples', [$raw]);

        $this->assertEquals('Deep Learning Review', $result[0]['title']);
        $this->assertEquals('2020', $result[0]['year']);
        $this->assertEquals('Smith A.', $result[0]['authors']);
        $this->assertEquals(25, $result[0]['citation_count']);
    }

    public function test_format_scopus_samples_defaults_missing_title_year_author_and_citation(): void
    {
        $raw = [[]];

        $result = $this->callPrivateMethod($this->service, 'formatScopusSamples', [$raw]);

        $this->assertEquals('No Title', $result[0]['title']);
        $this->assertNull($result[0]['year']);
        $this->assertEquals('Unknown Author', $result[0]['authors']);
        $this->assertEquals(0, $result[0]['citation_count']);
        $this->assertEquals('Unranked', $result[0]['tier']);
    }

    public function test_format_scopus_samples_assigns_tier_from_scimago_by_print_issn(): void
    {
        ScimagoJournal::create([
            'source_id' => 'scimago-src-1',
            'title' => 'Journal One',
            'issn_print' => '1111-2222',
            'issn_e' => '3333-4444',
            'best_quartile' => 'Q1',
        ]);

        $raw = [[
            'dc:title' => 'Journal Article',
            'prism:issn' => '1111-2222',
        ]];

        $result = $this->callPrivateMethod($this->service, 'formatScopusSamples', [$raw]);

        $this->assertEquals('Q1', $result[0]['tier']);
    }

    public function test_format_scopus_samples_assigns_tier_from_scimago_by_eissn_when_print_missing(): void
    {
        ScimagoJournal::create([
            'source_id' => 'scimago-src-2',
            'title' => 'Journal Two',
            'issn_print' => '9999-0000',
            'issn_e' => '5555-6666',
            'best_quartile' => 'Q2',
        ]);

        $raw = [[
            'dc:title' => 'Journal Article',
            'prism:eIssn' => '5555-6666',
        ]];

        $result = $this->callPrivateMethod($this->service, 'formatScopusSamples', [$raw]);

        $this->assertEquals('Q2', $result[0]['tier']);
    }

    public function test_format_scopus_samples_returns_unranked_when_no_issn_match_found(): void
    {
        ScimagoJournal::create([
            'source_id' => 'scimago-src-3',
            'title' => 'Journal Three',
            'issn_print' => '0000-1111',
            'issn_e' => '0000-2222',
            'best_quartile' => 'Q1',
        ]);

        $raw = [[
            'dc:title' => 'Unmatched Journal',
            'prism:issn' => '7777-8888',
        ]];

        $result = $this->callPrivateMethod($this->service, 'formatScopusSamples', [$raw]);

        $this->assertEquals('Unranked', $result[0]['tier']);
    }

    public function test_format_scopus_samples_handles_multiple_entries_independently(): void
    {
        ScimagoJournal::create([
            'source_id' => 'scimago-src-4',
            'title' => 'Journal Four',
            'issn_print' => '1111-1111',
            'issn_e' => null,
            'best_quartile' => 'Q3',
        ]);

        $raw = [
            ['dc:title' => 'Article One', 'prism:issn' => '1111-1111'],
            ['dc:title' => 'Article Two', 'prism:issn' => '2222-2222'],
        ];

        $result = $this->callPrivateMethod($this->service, 'formatScopusSamples', [$raw]);

        $this->assertEquals('Q3', $result[0]['tier']);
        $this->assertEquals('Unranked', $result[1]['tier']);
    }

    public function test_format_scopus_samples_returns_empty_array_for_empty_input(): void
    {
        $result = $this->callPrivateMethod($this->service, 'formatScopusSamples', [[]]);

        $this->assertEquals([], $result);
    }

    // =========================================================================
    // parsePubMedCitations() [private, via reflection]
    // =========================================================================

    public function test_parse_pubmed_citations_returns_empty_array_for_empty_string(): void
    {
        $result = $this->callPrivateMethod($this->service, 'parsePubMedCitations', ['']);

        $this->assertEquals([], $result);
    }

    public function test_parse_pubmed_citations_returns_empty_array_for_invalid_xml(): void
    {
        $result = $this->callPrivateMethodSuppressed($this->service, 'parsePubMedCitations', ['not-xml-<<<']);

        $this->assertEquals([], $result);
    }

    public function test_parse_pubmed_citations_extracts_counts_from_cited_in_link(): void
    {
        $xml = $this->samplePubMedCitationXml('12345', 3);

        $result = $this->callPrivateMethod($this->service, 'parsePubMedCitations', [$xml]);

        $this->assertEquals(3, $result['12345']);
    }

    public function test_parse_pubmed_citations_returns_zero_when_cited_in_link_absent(): void
    {
        $xml = <<<XML
<?xml version="1.0"?>
<eLinkResult>
    <LinkSet>
        <IdList><Id>99999</Id></IdList>
        <LinkSetDb>
            <LinkName>pubmed_pubmed_refs</LinkName>
            <Link><Id>1</Id></Link>
        </LinkSetDb>
    </LinkSet>
</eLinkResult>
XML;

        $result = $this->callPrivateMethod($this->service, 'parsePubMedCitations', [$xml]);

        $this->assertEquals(0, $result['99999']);
    }

    public function test_parse_pubmed_citations_handles_multiple_link_sets(): void
    {
        $xml = <<<XML
<?xml version="1.0"?>
<eLinkResult>
    <LinkSet>
        <IdList><Id>111</Id></IdList>
        <LinkSetDb>
            <LinkName>pubmed_pubmed_citedin</LinkName>
            <Link><Id>1</Id></Link>
            <Link><Id>2</Id></Link>
        </LinkSetDb>
    </LinkSet>
    <LinkSet>
        <IdList><Id>222</Id></IdList>
        <LinkSetDb>
            <LinkName>pubmed_pubmed_citedin</LinkName>
            <Link><Id>1</Id></Link>
        </LinkSetDb>
    </LinkSet>
</eLinkResult>
XML;

        $result = $this->callPrivateMethod($this->service, 'parsePubMedCitations', [$xml]);

        $this->assertEquals(2, $result['111']);
        $this->assertEquals(1, $result['222']);
    }

    // =========================================================================
    // formatPubMedSamples() [private, via reflection]
    // =========================================================================

    public function test_format_pubmed_samples_returns_empty_array_for_empty_string(): void
    {
        $result = $this->callPrivateMethod($this->service, 'formatPubMedSamples', ['', []]);

        $this->assertEquals([], $result);
    }

    public function test_format_pubmed_samples_returns_empty_array_for_invalid_xml(): void
    {
        $result = $this->callPrivateMethodSuppressed($this->service, 'formatPubMedSamples', ['<<broken', []]);

        $this->assertEquals([], $result);
    }

    public function test_format_pubmed_samples_parses_title_year_and_authors(): void
    {
        $xml = $this->samplePubMedArticleXml('555', 'Gene Therapy Advances', '2019');

        $result = $this->callPrivateMethod($this->service, 'formatPubMedSamples', [$xml, ['555' => 7]]);

        $this->assertEquals('Gene Therapy Advances', $result[0]['title']);
        $this->assertEquals('2019', $result[0]['year']);
        $this->assertEquals('Doe J', $result[0]['authors']);
        $this->assertEquals(7, $result[0]['citation_count']);
        $this->assertNull($result[0]['tier']);
    }

    public function test_format_pubmed_samples_falls_back_to_medline_date_when_year_missing(): void
    {
        $xml = <<<XML
<?xml version="1.0"?>
<PubmedArticleSet>
    <PubmedArticle>
        <MedlineCitation>
            <PMID>777</PMID>
            <Article>
                <ArticleTitle>Fallback Year Test</ArticleTitle>
                <Journal>
                    <JournalIssue>
                        <PubDate>
                            <MedlineDate>2015 Spring</MedlineDate>
                        </PubDate>
                    </JournalIssue>
                </Journal>
                <AuthorList>
                    <Author>
                        <LastName>Nguyen</LastName>
                        <Initials>T</Initials>
                    </Author>
                </AuthorList>
            </Article>
        </MedlineCitation>
    </PubmedArticle>
</PubmedArticleSet>
XML;

        $result = $this->callPrivateMethod($this->service, 'formatPubMedSamples', [$xml, []]);

        $this->assertEquals('2015', $result[0]['year']);
    }

    public function test_format_pubmed_samples_defaults_unknown_author_when_author_list_missing(): void
    {
        $xml = <<<XML
<?xml version="1.0"?>
<PubmedArticleSet>
    <PubmedArticle>
        <MedlineCitation>
            <PMID>888</PMID>
            <Article>
                <ArticleTitle>No Authors Here</ArticleTitle>
                <Journal>
                    <JournalIssue>
                        <PubDate><Year>2021</Year></PubDate>
                    </JournalIssue>
                </Journal>
            </Article>
        </MedlineCitation>
    </PubmedArticle>
</PubmedArticleSet>
XML;

        $result = $this->callPrivateMethod($this->service, 'formatPubMedSamples', [$xml, []]);

        $this->assertEquals('Unknown Author', $result[0]['authors']);
    }

    public function test_format_pubmed_samples_defaults_no_title_when_title_missing(): void
    {
        $xml = <<<XML
<?xml version="1.0"?>
<PubmedArticleSet>
    <PubmedArticle>
        <MedlineCitation>
            <PMID>999</PMID>
            <Article>
                <Journal>
                    <JournalIssue>
                        <PubDate><Year>2021</Year></PubDate>
                    </JournalIssue>
                </Journal>
            </Article>
        </MedlineCitation>
    </PubmedArticle>
</PubmedArticleSet>
XML;

        $result = $this->callPrivateMethod($this->service, 'formatPubMedSamples', [$xml, []]);

        $this->assertEquals('No Title', $result[0]['title']);
    }

    public function test_format_pubmed_samples_maps_citation_count_of_zero_when_pmid_not_in_map(): void
    {
        $xml = $this->samplePubMedArticleXml('123', 'Some Title', '2020');

        $result = $this->callPrivateMethod($this->service, 'formatPubMedSamples', [$xml, ['999' => 4]]);

        $this->assertEquals(0, $result[0]['citation_count']);
    }

    public function test_format_pubmed_samples_handles_multiple_articles(): void
    {
        $xml = <<<XML
<?xml version="1.0"?>
<PubmedArticleSet>
    <PubmedArticle>
        <MedlineCitation>
            <PMID>1</PMID>
            <Article>
                <ArticleTitle>Article One</ArticleTitle>
                <Journal><JournalIssue><PubDate><Year>2020</Year></PubDate></JournalIssue></Journal>
            </Article>
        </MedlineCitation>
    </PubmedArticle>
    <PubmedArticle>
        <MedlineCitation>
            <PMID>2</PMID>
            <Article>
                <ArticleTitle>Article Two</ArticleTitle>
                <Journal><JournalIssue><PubDate><Year>2021</Year></PubDate></JournalIssue></Journal>
            </Article>
        </MedlineCitation>
    </PubmedArticle>
</PubmedArticleSet>
XML;

        $result = $this->callPrivateMethod($this->service, 'formatPubMedSamples', [$xml, ['1' => 2, '2' => 9]]);

        $this->assertCount(2, $result);
        $this->assertEquals('Article One', $result[0]['title']);
        $this->assertEquals(2, $result[0]['citation_count']);
        $this->assertEquals('Article Two', $result[1]['title']);
        $this->assertEquals(9, $result[1]['citation_count']);
    }

    // =========================================================================
    // generateCacheKeys()
    // =========================================================================

    public function test_generate_cache_keys_for_pubmed_always_uses_tier_all_even_with_tiers_passed(): void
    {
        $keys = $this->service->generateCacheKeys([
            'keyword_id' => 5,
            'start_year' => 2018,
            'end_year'   => 2022,
            'tiers'      => ['Q1', 'Q2'],
        ], 'pubmed');

        $this->assertEquals(['search:kw:5:yr:2018-2022:tier:all:src:pubmed'], $keys);
    }

    public function test_generate_cache_keys_for_scopus_with_tiers_included(): void
    {
        $keys = $this->service->generateCacheKeys([
            'keyword_id' => 8,
            'start_year' => 2019,
            'end_year'   => 2021,
            'tiers'      => ['Q1', 'Q3'],
        ], 'scopus');

        $this->assertEquals(['search:kw:8:yr:2019-2021:tier:Q1,Q3:src:scopus'], $keys);
    }

    public function test_generate_cache_keys_for_scopus_without_tiers_falls_back_to_all(): void
    {
        $keys = $this->service->generateCacheKeys([
            'keyword_id' => 3,
            'start_year' => 2020,
            'end_year'   => 2020,
        ], 'scopus');

        $this->assertEquals(['search:kw:3:yr:2020-2020:tier:all:src:scopus'], $keys);
    }

    // =========================================================================
    // checkCacheHits()
    // =========================================================================

    public function test_check_cache_hits_returns_only_keys_present_in_cache(): void
    {
        cache()->put('key_a', ['some' => 'value'], now()->addMinutes(5));

        $result = $this->service->checkCacheHits(['key_a', 'key_b']);

        $this->assertArrayHasKey('key_a', $result);
        $this->assertArrayNotHasKey('key_b', $result);
    }

    public function test_check_cache_hits_returns_empty_array_when_nothing_cached(): void
    {
        $result = $this->service->checkCacheHits(['missing_key_1', 'missing_key_2']);

        $this->assertEquals([], $result);
    }

    // =========================================================================
    // getActiveBatchId()
    // =========================================================================

    public function test_get_active_batch_id_returns_null_when_nothing_cached(): void
    {
        $result = $this->service->getActiveBatchId(1, 1);

        $this->assertNull($result);
    }

    public function test_get_active_batch_id_returns_ids_when_batch_still_running(): void
    {
        cache()->put('active_search_plan_1_kw_2', 'batch-uuid-1', now()->addHour());

        $batch = Mockery::mock(Batch::class);
        $batch->shouldReceive('finished')->andReturn(false);

        Bus::shouldReceive('findBatch')->with('batch-uuid-1')->andReturn($batch);

        $result = $this->service->getActiveBatchId(1, 2);

        $this->assertEquals('batch-uuid-1', $result);
    }

    public function test_get_active_batch_id_forgets_cache_and_returns_null_when_batch_finished(): void
    {
        cache()->put('active_search_plan_1_kw_3', 'batch-uuid-2', now()->addHour());

        $batch = Mockery::mock(Batch::class);
        $batch->shouldReceive('finished')->andReturn(true);

        Bus::shouldReceive('findBatch')->with('batch-uuid-2')->andReturn($batch);

        $result = $this->service->getActiveBatchId(1, 3);

        $this->assertNull($result);
        $this->assertNull(cache()->get('active_search_plan_1_kw_3'));
    }

    public function test_get_active_batch_id_returns_null_when_batch_not_found(): void
    {
        cache()->put('active_search_plan_1_kw_4', 'batch-uuid-missing', now()->addHour());

        Bus::shouldReceive('findBatch')->with('batch-uuid-missing')->andReturn(null);

        $result = $this->service->getActiveBatchId(1, 4);

        $this->assertNull($result);
    }

    // =========================================================================
    // rememberActiveBatch()
    // =========================================================================

    public function test_remember_active_batch_stores_batch_id_in_cache(): void
    {
        $this->service->rememberActiveBatch(10, 20, 'batch-xyz');

        $this->assertEquals('batch-xyz', cache()->get('active_search_plan_10_kw_20'));
    }

    // =========================================================================
    // executeSearch()
    // =========================================================================

    public function test_execute_search_returns_full_cache_status_when_all_cache_keys_hit(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);
        $rpk = ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
            'article_count' => 0,
        ]);

        $rawArticle1 = RawArticle::factory()->create();
        $rawArticle2 = RawArticle::factory()->create();

        $cacheKey = "search:kw:{$keyword->id}:yr:2020-2021:tier:all:src:scopus";
        cache()->put($cacheKey, [
            'raw_article_ids' => [$rawArticle1->id, $rawArticle2->id],
        ], now()->endOfDay());

        $result = $this->service->executeSearch([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], $plan->research_plan_id);

        $this->assertEquals('full_cache', $result['status']);
        $this->assertEquals(200, $result['code']);

        $this->assertDatabaseHas('filtered_articles', [
            'research_plan_id' => $plan->research_plan_id,
            'raw_article_id' => $rawArticle1->id,
        ]);
    }

    public function test_execute_search_returns_active_running_status_when_batch_in_progress(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);

        cache()->put(
            "active_search_plan_{$plan->research_plan_id}_kw_{$keyword->id}",
            'running-batch-id',
            now()->addHour()
        );

        $batch = Mockery::mock(Batch::class);
        $batch->shouldReceive('finished')->andReturn(false);
        Bus::shouldReceive('findBatch')->with('running-batch-id')->andReturn($batch);

        $result = $this->service->executeSearch([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], $plan->research_plan_id);

        $this->assertEquals('active_running', $result['status']);
        $this->assertEquals(202, $result['code']);
        $this->assertEquals('running-batch-id', $result['batch_id']);
    }

    public function test_execute_search_returns_no_results_when_total_count_is_zero(): void
    {
        $keyword = Keyword::factory()->create(['keyword' => 'zero results topic']);
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        $this->scopusApiMock->shouldReceive('getTotalCount')
            ->andReturn(0);

        $result = $this->service->executeSearch([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], $plan->research_plan_id);

        $this->assertEquals('no_results', $result['status']);
        $this->assertEquals(404, $result['code']);
    }

    public function test_execute_search_dispatches_batch_and_returns_dispatched_status(): void
    {
        Bus::fake();

        $keyword = Keyword::factory()->create(['keyword' => 'ai']);
        $plan = ResearchPlan::factory()->create(['source_database' => 'scopus']);
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        $this->scopusApiMock->shouldReceive('getTotalCount')
            ->andReturn(50, 60); // withYear, withoutYear

        $result = $this->service->executeSearch([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], $plan->research_plan_id);

        $this->assertEquals('dispatched', $result['status']);
        $this->assertEquals(202, $result['code']);
        $this->assertEquals('scopus', $result['source']);
        $this->assertNotEmpty($result['batch_id']);

        Bus::assertBatched(function ($batch) {
            return true;
        });
    }

    // =========================================================================
    // dispatchSearchJobs()
    // =========================================================================

    public function test_dispatch_search_jobs_returns_null_when_total_count_is_zero(): void
    {
        $keyword = Keyword::factory()->create(['keyword' => 'empty topic']);
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        $this->scopusApiMock->shouldReceive('getTotalCount')->andReturn(0);

        $result = $this->service->dispatchSearchJobs([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], 'scopus', ['some_cache_key'], $plan->research_plan_id);

        $this->assertNull($result);
    }

    public function test_dispatch_search_jobs_creates_scopus_jobs_and_dispatches_batch(): void
    {
        Bus::fake();

        $keyword = Keyword::factory()->create(['keyword' => 'genomics']);
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        // 130 results / 25 per page = 6 pages -> 5 pages per job for scopus => 2 jobs
        $this->scopusApiMock->shouldReceive('getTotalCount')->andReturn(130, 150);

        $batchId = $this->service->dispatchSearchJobs([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], 'scopus', ['search:kw:x:src:scopus'], $plan->research_plan_id);

        $this->assertNotEmpty($batchId);

        Bus::assertBatched(function ($batch) {
            return count($batch->jobs) === 2
                && $batch->jobs->first() instanceof FetchScopusJob;
        });
    }

    public function test_dispatch_search_jobs_creates_pubmed_jobs_and_dispatches_batch(): void
    {
        Bus::fake();

        $keyword = Keyword::factory()->create(['keyword' => 'oncology']);
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        // 100 results / 25 per page = 4 pages -> 20 pages per job for pubmed => 1 job
        $this->pubmedApiMock->shouldReceive('getTotalCount')->andReturn(100, 100);

        $batchId = $this->service->dispatchSearchJobs([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], 'pubmed', ['search:kw:x:src:pubmed'], $plan->research_plan_id);

        $this->assertNotEmpty($batchId);

        Bus::assertBatched(function ($batch) {
            return count($batch->jobs) === 1
                && $batch->jobs->first() instanceof FetchPubMedJob;
        });
    }

    public function test_dispatch_search_jobs_caps_total_count_at_five_thousand(): void
    {
        Bus::fake();

        $keyword = Keyword::factory()->create(['keyword' => 'popular topic']);
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        // Way more than 5000 results with year filter applied.
        $this->scopusApiMock->shouldReceive('getTotalCount')->andReturn(20000, 25000);

        $batchId = $this->service->dispatchSearchJobs([
            'keyword_id' => $keyword->id,
            'start_year' => 2000,
            'end_year'   => 2023,
        ], 'scopus', ['search:kw:x:src:scopus'], $plan->research_plan_id);

        $this->assertNotEmpty($batchId);

        // 5000 / 25 = 200 pages, 5 pages per job => 40 jobs
        Bus::assertBatched(function ($batch) {
            return count($batch->jobs) === 40;
        });
    }

    public function test_dispatch_search_jobs_updates_out_of_year_range_count(): void
    {
        Bus::fake();

        $keyword = Keyword::factory()->create(['keyword' => 'range topic']);
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        // withYear = 40, withoutYear = 100 -> out_of_year_range_count = 60
        $this->scopusApiMock->shouldReceive('getTotalCount')->andReturn(40, 100);

        $this->service->dispatchSearchJobs([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], 'scopus', ['search:kw:x:src:scopus'], $plan->research_plan_id);

        $this->assertDatabaseHas('research_plan_keyword', [
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
            'out_of_year_range_count' => 60,
        ]);
    }

    public function test_dispatch_search_jobs_returns_null_for_unrecognized_source(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        $result = $this->service->dispatchSearchJobs([
            'keyword_id' => $keyword->id,
            'start_year' => 2020,
            'end_year'   => 2021,
        ], 'unknown_source', ['some_key'], $plan->research_plan_id);

        $this->assertNull($result);
    }

    // =========================================================================
    // processCacheHits() [private, exercised through executeSearch, plus a
    // direct reflection test to confirm aggregation/update logic in isolation]
    // =========================================================================

    public function test_process_cache_hits_inserts_only_new_unique_articles_and_increments_counts(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
            'article_count' => 5,
        ]);

        $existingArticle = RawArticle::factory()->create();
        $newArticle1 = RawArticle::factory()->create();
        $newArticle2 = RawArticle::factory()->create();

        // Pre-existing article that should be treated as a duplicate.
        FilteredArticle::factory()->create([
            'research_plan_id' => $plan->research_plan_id,
            'raw_article_id' => $existingArticle->id,
            'keyword_id' => $keyword->id,
        ]);

        $hits = [
            'cache_key_1' => [
                'raw_article_ids' => [$existingArticle->id, $newArticle1->id, $newArticle2->id],
                'duplicate_count' => 1,
                'unmatched_tier_count' => 2,
                'missing_doi_count' => 1,
                'out_of_year_range_count' => 3,
            ],
        ];

        $this->callPrivateMethod($this->service, 'processCacheHits', [$hits, $plan->research_plan_id, $keyword->id]);

        $this->assertDatabaseHas('filtered_articles', [
            'research_plan_id' => $plan->research_plan_id,
            'raw_article_id' => $newArticle1->id,
        ]);
        $this->assertDatabaseHas('filtered_articles', [
            'research_plan_id' => $plan->research_plan_id,
            'raw_article_id' => $newArticle2->id,
        ]);

        $rpk = ResearchPlanKeyword::where('research_plan_id', $plan->research_plan_id)
            ->where('keyword_id', $keyword->id)
            ->first();

        // 5 (initial) + 2 (new-1, new-2; existing-1 excluded as duplicate)
        $this->assertEquals(7, $rpk->article_count);
        $this->assertEquals(3, $rpk->out_of_year_range_count);
    }

    public function test_process_cache_hits_handles_legacy_array_format_without_metadata_keys(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
            'article_count' => 0,
        ]);

        $legacyArticle1 = RawArticle::factory()->create();
        $legacyArticle2 = RawArticle::factory()->create();

        // Legacy cache format: plain array of IDs, no 'raw_article_ids' key.
        $hits = [
            'cache_key_legacy' => [$legacyArticle1->id, $legacyArticle2->id],
        ];

        $this->callPrivateMethod($this->service, 'processCacheHits', [$hits, $plan->research_plan_id, $keyword->id]);

        $this->assertDatabaseHas('filtered_articles', [
            'research_plan_id' => $plan->research_plan_id,
            'raw_article_id' => $legacyArticle1->id,
        ]);

        $rpk = ResearchPlanKeyword::where('research_plan_id', $plan->research_plan_id)
            ->where('keyword_id', $keyword->id)
            ->first();

        $this->assertEquals(2, $rpk->article_count);
    }

    // =========================================================================
    // finalizeBatch() [private, via reflection]
    // =========================================================================

    public function test_finalize_batch_persists_accepted_articles_and_updates_counts(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
            'article_count' => 0,
            'out_of_year_range_count' => 4,
        ]);

        $cacheKey = "search:kw:{$keyword->id}:yr:2020-2021:tier:all:src:scopus";

        $batch = Mockery::mock(Batch::class);
        $batch->id = 'batch-final-1';

        $acceptedArticle1 = RawArticle::factory()->create();
        $acceptedArticle2 = RawArticle::factory()->create();

        ArticleMetadataTemp::create([
            'batch_id' => 'batch-final-1',
            'raw_article_id' => $acceptedArticle1->id,
            'status' => ArticleTempStatus::ACCEPTED->value,
            'cache_key' => $cacheKey,
        ]);
        ArticleMetadataTemp::create([
            'batch_id' => 'batch-final-1',
            'raw_article_id' => $acceptedArticle2->id,
            'status' => ArticleTempStatus::ACCEPTED->value,
            'cache_key' => $cacheKey,
        ]);
        ArticleMetadataTemp::create([
            'batch_id' => 'batch-final-1',
            'status' => ArticleTempStatus::MISSING_DOI->value,
            'cache_key' => $cacheKey,
        ]);
        ArticleMetadataTemp::create([
            'batch_id' => 'batch-final-1',
            'status' => ArticleTempStatus::UNMATCHED_TIER->value,
            'cache_key' => $cacheKey,
        ]);

        $this->callPrivateMethod($this->service, 'finalizeBatch', [
            $batch, [$cacheKey], $plan->research_plan_id, $keyword->id, 'scopus', [],
        ]);

        $this->assertDatabaseHas('filtered_articles', [
            'research_plan_id' => $plan->research_plan_id,
            'raw_article_id' => $acceptedArticle1->id,
        ]);
        $this->assertDatabaseHas('filtered_articles', [
            'research_plan_id' => $plan->research_plan_id,
            'raw_article_id' => $acceptedArticle2->id,
        ]);

        $rpk = ResearchPlanKeyword::where('research_plan_id', $plan->research_plan_id)
            ->where('keyword_id', $keyword->id)
            ->first();

        $this->assertEquals(2, $rpk->article_count);
        $this->assertEquals(1, $rpk->missing_doi_count);
        $this->assertEquals(1, $rpk->unmatched_tier_count);

        // Temp rows for this batch should be cleaned up.
        $this->assertEquals(0, ArticleMetadataTemp::where('batch_id', 'batch-final-1')->count());

        // Cache entry should be updated with the new payload.
        $cached = cache()->get($cacheKey);
        $this->assertEqualsCanonicalizing([$acceptedArticle1->id, $acceptedArticle2->id], $cached['raw_article_ids']);
        $this->assertEquals(4, $cached['out_of_year_range_count']);
    }

    public function test_finalize_batch_counts_in_batch_duplicates_and_existing_duplicates_separately(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
            'article_count' => 0,
        ]);

        $existingDupArticle = RawArticle::factory()->create();
        $inBatchDupArticle = RawArticle::factory()->create();

        FilteredArticle::factory()->create([
            'research_plan_id' => $plan->research_plan_id,
            'raw_article_id' => $existingDupArticle->id,
            'keyword_id' => $keyword->id,
        ]);

        $cacheKey = "search:kw:{$keyword->id}:yr:2020-2021:tier:all:src:scopus";

        $batch = Mockery::mock(Batch::class);
        $batch->id = 'batch-final-2';

        // $existingDupArticle already in DB, $inBatchDupArticle appears twice in this batch.
        ArticleMetadataTemp::create([
            'batch_id' => 'batch-final-2',
            'raw_article_id' => $existingDupArticle->id,
            'status' => ArticleTempStatus::ACCEPTED->value,
            'cache_key' => $cacheKey,
        ]);
        ArticleMetadataTemp::create([
            'batch_id' => 'batch-final-2',
            'raw_article_id' => $inBatchDupArticle->id,
            'status' => ArticleTempStatus::ACCEPTED->value,
            'cache_key' => $cacheKey,
        ]);
        ArticleMetadataTemp::create([
            'batch_id' => 'batch-final-2',
            'raw_article_id' => $inBatchDupArticle->id,
            'status' => ArticleTempStatus::ACCEPTED->value,
            'cache_key' => $cacheKey,
        ]);

        $this->callPrivateMethod($this->service, 'finalizeBatch', [
            $batch, [$cacheKey], $plan->research_plan_id, $keyword->id, 'scopus', [],
        ]);

        $rpk = ResearchPlanKeyword::where('research_plan_id', $plan->research_plan_id)
            ->where('keyword_id', $keyword->id)
            ->first();

        // 1 existing duplicate + 1 in-batch duplicate = 2
        $this->assertEquals(2, $rpk->duplicate_count);
        // Only $inBatchDupArticle should be newly inserted ($existingDupArticle already present).
        $this->assertEquals(1, $rpk->article_count);
    }

    public function test_finalize_batch_clears_active_and_pending_cache_when_all_batches_complete(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        cache()->put("pending_batches_{$plan->research_plan_id}_{$keyword->id}", 1, now()->addHours(2));
        cache()->put("active_search_plan_{$plan->research_plan_id}_kw_{$keyword->id}", 'batch-final-3', now()->addHour());

        $cacheKey = "search:kw:{$keyword->id}:yr:2020-2021:tier:all:src:scopus";

        $batch = Mockery::mock(Batch::class);
        $batch->id = 'batch-final-3';

        $this->callPrivateMethod($this->service, 'finalizeBatch', [
            $batch, [$cacheKey], $plan->research_plan_id, $keyword->id, 'scopus', [],
        ]);

        $this->assertNull(cache()->get("pending_batches_{$plan->research_plan_id}_{$keyword->id}"));
        $this->assertNull(cache()->get("active_search_plan_{$plan->research_plan_id}_kw_{$keyword->id}"));
        $this->assertNull(cache()->get("batch_done_{$plan->research_plan_id}_{$keyword->id}_scopus"));
    }

    public function test_finalize_batch_skips_cache_keys_not_matching_source_suffix(): void
    {
        $keyword = Keyword::factory()->create();
        $plan = ResearchPlan::factory()->create();
        ResearchPlanKeyword::create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        $scopusKey = "search:kw:{$keyword->id}:yr:2020-2021:tier:all:src:scopus";
        $pubmedKey = "search:kw:{$keyword->id}:yr:2020-2021:tier:all:src:pubmed";

        $batch = Mockery::mock(Batch::class);
        $batch->id = 'batch-final-4';

        $this->callPrivateMethod($this->service, 'finalizeBatch', [
            $batch, [$scopusKey, $pubmedKey], $plan->research_plan_id, $keyword->id, 'scopus', [],
        ]);

        // Only the scopus-suffixed key should have been written.
        $this->assertNotNull(cache()->get($scopusKey));
        $this->assertNull(cache()->get($pubmedKey));
    }

    // =========================================================================
    // Test fixtures / XML builders
    // =========================================================================

    protected function samplePubMedArticleXml(string $pmid, string $title, string $year): string
    {
        return <<<XML
<?xml version="1.0"?>
<PubmedArticleSet>
    <PubmedArticle>
        <MedlineCitation>
            <PMID>{$pmid}</PMID>
            <Article>
                <ArticleTitle>{$title}</ArticleTitle>
                <Journal>
                    <JournalIssue>
                        <PubDate><Year>{$year}</Year></PubDate>
                    </JournalIssue>
                </Journal>
                <AuthorList>
                    <Author>
                        <LastName>Doe</LastName>
                        <Initials>J</Initials>
                    </Author>
                </AuthorList>
            </Article>
        </MedlineCitation>
    </PubmedArticle>
</PubmedArticleSet>
XML;
    }

    protected function samplePubMedCitationXml(string $pmid, int $citationCount): string
    {
        $links = str_repeat('<Link><Id>1</Id></Link>', $citationCount);

        return <<<XML
<?xml version="1.0"?>
<eLinkResult>
    <LinkSet>
        <IdList><Id>{$pmid}</Id></IdList>
        <LinkSetDb>
            <LinkName>pubmed_pubmed_citedin</LinkName>
            {$links}
        </LinkSetDb>
    </LinkSet>
</eLinkResult>
XML;
    }
}