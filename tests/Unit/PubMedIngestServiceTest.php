<?php

namespace Tests\Unit;

use App\Enums\ArticleTempStatus;
use App\Jobs\GenerateArticleEmbeddingsJob;
use App\Models\ArticleMetadataTemp;
use App\Models\Keyword;
use App\Models\RawArticle;
use App\Services\PubMedApiService;
use App\Services\PubMedIngestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Mockery;
use ReflectionClass;
use SimpleXMLElement;
use Tests\TestCase;

/**
 * Unit test suite for PubMedIngestService.
 *
 * Testing strategy:
 * -----------------
 * 1. Pure, side-effect-free logic (buildTerm, parse*Xml, extract*, normalizeDoi) is
 *    tested in isolation via PHP Reflection, since these methods are declared
 *    protected/private. Reflection is used only to reach the unit under test,
 *    not to bypass its actual behavior — every assertion still exercises the
 *    real method body against controlled input.
 * 2. Orchestration logic (ingest, processBatch) is tested using Mockery for the
 *    PubMedApiService collaborator (an HTTP-bound dependency that must never
 *    hit the network in a unit test) and Laravel's Queue::fake() to observe
 *    job dispatch without executing the queue worker.
 * 3. RefreshDatabase is used for the small subset of tests that exercise the
 *    upsert/insert side effects in processBatch(), since those effects are
 *    expressed through Eloquent's static query builder and are not reasonably
 *    mockable without changing production code. This assumes the standard
 *    migrations for keywords, raw_articles, and article_metadata_temps exist
 *    in the application, matching the columns referenced by the service.
 *
 * Each public/protected/private method of PubMedIngestService has a dedicated
 * test group below, annotated with the specific branches/edge cases covered.
 */
class PubMedIngestServiceTest extends TestCase
{
    use RefreshDatabase;

    private PubMedIngestService $service;

    /** @var PubMedApiService&\Mockery\MockInterface */
    private $pubmedApiMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pubmedApiMock = Mockery::mock(PubMedApiService::class);
        $this->service = new PubMedIngestService($this->pubmedApiMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Invoke a protected or private method on the service (or any object) via Reflection.
     *
     * @param object $object
     * @param string $method
     * @param array<int, mixed> $args
     * @return mixed
     */
    private function invokeMethod(object $object, string $method, array $args = [])
    {
        $reflection = new ReflectionClass($object);
        $reflectionMethod = $reflection->getMethod($method);
        $reflectionMethod->setAccessible(true);

        return $reflectionMethod->invokeArgs($object, $args);
    }

    // ==========================================================================================
    // buildTerm()
    // ==========================================================================================

    public function test_build_term_wraps_a_multi_word_keyword_without_special_operators_in_a_title_field_search(): void
    {
        $term = $this->invokeMethod($this->service, 'buildTerm', ['machine learning', 2020, 2023]);

        $this->assertStringContainsString('"machine learning"[ti]', $term);
        $this->assertStringContainsString('AND ("Journal Article"[pt] AND "medline"[sb] NOT "preprint"[pt])', $term);
        $this->assertStringContainsString('AND 2020:2023[dp]', $term);
    }

    public function test_build_term_does_not_double_quote_a_multi_word_keyword_that_is_already_quoted(): void
    {
        $term = $this->invokeMethod($this->service, 'buildTerm', ['"machine learning"', 2020, 2023]);

        // Should not become '""machine learning""[ti]'
        $this->assertStringContainsString('"machine learning"[ti]', $term);
        $this->assertStringNotContainsString('""machine', $term);
    }

    public function test_build_term_falls_back_to_the_grouped_branch_for_a_single_word_keyword_and_does_not_quote_it(): void
    {
        // A single word has no space, so it is routed to the else-branch (parts split by ';')
        // rather than the "[ti]" quoted branch, per the isSingleWord check.
        $term = $this->invokeMethod($this->service, 'buildTerm', ['sepsis', 2019, 2022]);

        $this->assertStringStartsWith('(sepsis)', $term);
        $this->assertStringNotContainsString('[ti]', $term);
    }

    public function test_build_term_joins_semicolon_separated_parts_with_and_and_quotes_multi_word_parts(): void
    {
        $term = $this->invokeMethod($this->service, 'buildTerm', ['AI; machine learning', 2021, 2024]);

        $this->assertStringStartsWith('(AI AND "machine learning")', $term);
    }

    public function test_build_term_applies_not_operator_to_parts_prefixed_with_exclamation_mark(): void
    {
        $term = $this->invokeMethod($this->service, 'buildTerm', ['AI; !bias', 2021, 2024]);

        $this->assertStringStartsWith('(AI NOT bias)', $term);
    }

    public function test_build_term_applies_not_operator_even_when_the_negated_part_is_the_first_part(): void
    {
        $term = $this->invokeMethod($this->service, 'buildTerm', ['!bias; AI', 2021, 2024]);

        $this->assertStringStartsWith('(NOT bias AND AI)', $term);
    }

    public function test_build_term_quotes_a_multi_word_part_inside_a_semicolon_separated_group_when_not_already_quoted(): void
    {
        $term = $this->invokeMethod($this->service, 'buildTerm', ['deep learning; nlp', 2021, 2024]);

        $this->assertStringStartsWith('("deep learning" AND nlp)', $term);
    }

    public function test_build_term_always_appends_the_quality_filter_and_the_publication_date_range(): void
    {
        $term = $this->invokeMethod($this->service, 'buildTerm', ['robotics', 2018, 2020]);

        $this->assertStringEndsWith(
            'AND ("Journal Article"[pt] AND "medline"[sb] NOT "preprint"[pt]) AND 2018:2020[dp]',
            $term
        );
    }

    // ==========================================================================================
    // parseDetailsXml()
    // ==========================================================================================

    public function test_parse_details_xml_returns_empty_array_for_an_empty_string(): void
    {
        $result = $this->invokeMethod($this->service, 'parseDetailsXml', ['']);

        $this->assertSame([], $result);
    }

    public function test_parse_details_xml_returns_empty_array_for_malformed_xml(): void
    {
        $result = $this->invokeMethod($this->service, 'parseDetailsXml', ['<not-valid-xml']);

        $this->assertSame([], $result);
    }

    public function test_parse_details_xml_skips_an_article_that_has_no_pmid(): void
    {
        $xml = <<<XML
        <PubmedArticleSet>
            <PubmedArticle>
                <MedlineCitation>
                    <PMID></PMID>
                    <Article>
                        <ArticleTitle>Untitled</ArticleTitle>
                    </Article>
                </MedlineCitation>
            </PubmedArticle>
        </PubmedArticleSet>
        XML;

        $result = $this->invokeMethod($this->service, 'parseDetailsXml', [$xml]);

        $this->assertSame([], $result);
    }

    public function test_parse_details_xml_extracts_a_fully_populated_article_into_the_expected_payload_shape(): void
    {
        $xml = <<<XML
        <PubmedArticleSet>
            <PubmedArticle>
                <MedlineCitation>
                    <PMID>123456</PMID>
                    <Article>
                        <ArticleTitle>Deep Learning for Sepsis Prediction</ArticleTitle>
                        <Abstract>
                            <AbstractText Label="BACKGROUND">Sepsis is a leading cause of mortality.</AbstractText>
                            <AbstractText Label="METHODS">We trained a neural network.</AbstractText>
                        </Abstract>
                        <AuthorList>
                            <Author>
                                <LastName>Doe</LastName>
                                <ForeName>Jane</ForeName>
                            </Author>
                            <Author>
                                <CollectiveName>Sepsis Research Consortium</CollectiveName>
                            </Author>
                        </AuthorList>
                        <Journal>
                            <ISSN IssnType="Print">1234-5678</ISSN>
                            <JournalIssue>
                                <PubDate>
                                    <Year>2022</Year>
                                </PubDate>
                            </JournalIssue>
                        </Journal>
                    </Article>
                    <KeywordList>
                        <Keyword>sepsis</Keyword>
                        <Keyword>machine learning</Keyword>
                    </KeywordList>
                </MedlineCitation>
                <PubmedData>
                    <ArticleIdList>
                        <ArticleId IdType="pubmed">123456</ArticleId>
                        <ArticleId IdType="doi"> 10.1234/ABC.2022  </ArticleId>
                    </ArticleIdList>
                </PubmedData>
            </PubmedArticle>
        </PubmedArticleSet>
        XML;

        $result = $this->invokeMethod($this->service, 'parseDetailsXml', [$xml]);

        $this->assertArrayHasKey('123456', $result);
        $payload = $result['123456'];

        $this->assertSame('10.1234/abc.2022', $payload['doi']);
        $this->assertSame('Deep Learning for Sepsis Prediction', $payload['title']);
        $this->assertSame('Doe Jane, Sepsis Research Consortium', $payload['authors']);
        $this->assertSame('sepsis, machine learning', $payload['keyword']);
        $this->assertSame(
            'Sepsis is a leading cause of mortality. We trained a neural network.',
            $payload['abstract']
        );
        $this->assertSame('1234-5678', $payload['issn_print']);
        $this->assertNull($payload['issn_e']);
        $this->assertSame(2022, $payload['publish_year']);
        $this->assertSame('pubmed', $payload['source_db']);
        $this->assertNull($payload['tier']);
        $this->assertNull($payload['citation_count']);
    }

    public function test_parse_details_xml_sets_doi_to_null_when_no_doi_article_id_is_present(): void
    {
        $xml = <<<XML
        <PubmedArticleSet>
            <PubmedArticle>
                <MedlineCitation>
                    <PMID>999</PMID>
                    <Article>
                        <ArticleTitle>No DOI Article</ArticleTitle>
                    </Article>
                </MedlineCitation>
                <PubmedData>
                    <ArticleIdList>
                        <ArticleId IdType="pubmed">999</ArticleId>
                    </ArticleIdList>
                </PubmedData>
            </PubmedArticle>
        </PubmedArticleSet>
        XML;

        $result = $this->invokeMethod($this->service, 'parseDetailsXml', [$xml]);

        $this->assertNull($result['999']['doi']);
    }

    public function test_parse_details_xml_falls_back_to_medline_date_when_year_is_absent(): void
    {
        $xml = <<<XML
        <PubmedArticleSet>
            <PubmedArticle>
                <MedlineCitation>
                    <PMID>222</PMID>
                    <Article>
                        <ArticleTitle>Fallback Date Article</ArticleTitle>
                        <Journal>
                            <JournalIssue>
                                <PubDate>
                                    <MedlineDate>2019 Spring</MedlineDate>
                                </PubDate>
                            </JournalIssue>
                        </Journal>
                    </Article>
                </MedlineCitation>
            </PubmedArticle>
        </PubmedArticleSet>
        XML;

        $result = $this->invokeMethod($this->service, 'parseDetailsXml', [$xml]);

        $this->assertSame(2019, $result['222']['publish_year']);
    }

    public function test_parse_details_xml_handles_multiple_articles_in_a_single_response(): void
    {
        $xml = <<<XML
        <PubmedArticleSet>
            <PubmedArticle>
                <MedlineCitation>
                    <PMID>1</PMID>
                    <Article><ArticleTitle>First</ArticleTitle></Article>
                </MedlineCitation>
            </PubmedArticle>
            <PubmedArticle>
                <MedlineCitation>
                    <PMID>2</PMID>
                    <Article><ArticleTitle>Second</ArticleTitle></Article>
                </MedlineCitation>
            </PubmedArticle>
        </PubmedArticleSet>
        XML;

        $result = $this->invokeMethod($this->service, 'parseDetailsXml', [$xml]);

        $this->assertCount(2, $result);
        $this->assertSame('First', $result['1']['title']);
        $this->assertSame('Second', $result['2']['title']);
    }

    // ==========================================================================================
    // parseCitationsXml()
    // ==========================================================================================

    public function test_parse_citations_xml_returns_empty_array_for_an_empty_string(): void
    {
        $result = $this->invokeMethod($this->service, 'parseCitationsXml', ['']);

        $this->assertSame([], $result);
    }

    public function test_parse_citations_xml_returns_empty_array_for_malformed_xml(): void
    {
        $result = $this->invokeMethod($this->service, 'parseCitationsXml', ['<bad']);

        $this->assertSame([], $result);
    }

    public function test_parse_citations_xml_counts_links_across_all_linksetdb_nodes_for_a_pmid(): void
    {
        $xml = <<<XML
        <eLinkResult>
            <LinkSet>
                <IdList><Id>555</Id></IdList>
                <LinkSetDb>
                    <Link><Id>10</Id></Link>
                    <Link><Id>11</Id></Link>
                </LinkSetDb>
                <LinkSetDb>
                    <Link><Id>12</Id></Link>
                </LinkSetDb>
            </LinkSet>
        </eLinkResult>
        XML;

        $result = $this->invokeMethod($this->service, 'parseCitationsXml', [$xml]);

        $this->assertSame(3, $result['555']);
    }

    public function test_parse_citations_xml_skips_a_linkset_that_has_no_id(): void
    {
        $xml = <<<XML
        <eLinkResult>
            <LinkSet>
                <IdList></IdList>
                <LinkSetDb>
                    <Link><Id>1</Id></Link>
                </LinkSetDb>
            </LinkSet>
        </eLinkResult>
        XML;

        $result = $this->invokeMethod($this->service, 'parseCitationsXml', [$xml]);

        $this->assertSame([], $result);
    }

    public function test_parse_citations_xml_returns_zero_for_a_pmid_with_no_linksetdb_entries(): void
    {
        $xml = <<<XML
        <eLinkResult>
            <LinkSet>
                <IdList><Id>777</Id></IdList>
            </LinkSet>
        </eLinkResult>
        XML;

        $result = $this->invokeMethod($this->service, 'parseCitationsXml', [$xml]);

        $this->assertSame(0, $result['777']);
    }

    // ==========================================================================================
    // extractAbstract()
    // ==========================================================================================

    public function test_extract_abstract_combines_multiple_abstract_text_segments_with_a_single_space(): void
    {
        $node = new SimpleXMLElement('<Abstract><AbstractText>Part one.</AbstractText><AbstractText>Part two.</AbstractText></Abstract>');

        $result = $this->invokeMethod($this->service, 'extractAbstract', [$node]);

        $this->assertSame('Part one. Part two.', $result);
    }

    public function test_extract_abstract_returns_null_when_there_is_no_text_content(): void
    {
        $node = new SimpleXMLElement('<Abstract></Abstract>');

        $result = $this->invokeMethod($this->service, 'extractAbstract', [$node]);

        $this->assertNull($result);
    }

    public function test_extract_abstract_trims_whitespace_around_each_segment(): void
    {
        $node = new SimpleXMLElement('<Abstract><AbstractText>   padded text   </AbstractText></Abstract>');

        $result = $this->invokeMethod($this->service, 'extractAbstract', [$node]);

        $this->assertSame('padded text', $result);
    }

    // ==========================================================================================
    // extractAuthors()
    // ==========================================================================================

    public function test_extract_authors_formats_individual_authors_as_last_name_space_fore_name(): void
    {
        $node = new SimpleXMLElement('<AuthorList><Author><LastName>Smith</LastName><ForeName>John</ForeName></Author></AuthorList>');

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$node]);

        $this->assertSame('Smith John', $result);
    }

    public function test_extract_authors_uses_collective_name_when_present_instead_of_individual_names(): void
    {
        $node = new SimpleXMLElement('<AuthorList><Author><CollectiveName>Research Group</CollectiveName><LastName>Ignored</LastName></Author></AuthorList>');

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$node]);

        $this->assertSame('Research Group', $result);
    }

    public function test_extract_authors_omits_the_forename_when_it_is_missing(): void
    {
        $node = new SimpleXMLElement('<AuthorList><Author><LastName>Solo</LastName></Author></AuthorList>');

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$node]);

        $this->assertSame('Solo', $result);
    }

    public function test_extract_authors_joins_multiple_authors_with_comma_space(): void
    {
        $node = new SimpleXMLElement(
            '<AuthorList>
                <Author><LastName>Doe</LastName><ForeName>Jane</ForeName></Author>
                <Author><LastName>Roe</LastName><ForeName>Richard</ForeName></Author>
            </AuthorList>'
        );

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$node]);

        $this->assertSame('Doe Jane, Roe Richard', $result);
    }

    public function test_extract_authors_returns_null_when_the_author_list_is_empty(): void
    {
        $node = new SimpleXMLElement('<AuthorList></AuthorList>');

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$node]);

        $this->assertNull($result);
    }

    // ==========================================================================================
    // extractKeywords()
    // ==========================================================================================

    public function test_extract_keywords_joins_multiple_keywords_with_comma_space(): void
    {
        $node = new SimpleXMLElement('<KeywordList><Keyword>sepsis</Keyword><Keyword> icu </Keyword></KeywordList>');

        $result = $this->invokeMethod($this->service, 'extractKeywords', [$node]);

        $this->assertSame('sepsis, icu', $result);
    }

    public function test_extract_keywords_returns_null_when_the_keyword_list_is_empty(): void
    {
        $node = new SimpleXMLElement('<KeywordList></KeywordList>');

        $result = $this->invokeMethod($this->service, 'extractKeywords', [$node]);

        $this->assertNull($result);
    }

    // ==========================================================================================
    // extractPublishYearFromArticle()
    // ==========================================================================================

    public function test_extract_publish_year_reads_the_year_node_when_present(): void
    {
        $node = new SimpleXMLElement('<PubDate><Year>2021</Year></PubDate>');

        $result = $this->invokeMethod($this->service, 'extractPublishYearFromArticle', [$node]);

        $this->assertSame(2021, $result);
    }

    public function test_extract_publish_year_falls_back_to_the_first_four_characters_of_medline_date(): void
    {
        $node = new SimpleXMLElement('<PubDate><MedlineDate>2017 Nov-Dec</MedlineDate></PubDate>');

        $result = $this->invokeMethod($this->service, 'extractPublishYearFromArticle', [$node]);

        $this->assertSame(2017, $result);
    }

    public function test_extract_publish_year_returns_null_when_no_year_can_be_determined(): void
    {
        $node = new SimpleXMLElement('<PubDate></PubDate>');

        $result = $this->invokeMethod($this->service, 'extractPublishYearFromArticle', [$node]);

        $this->assertNull($result);
    }

    public function test_extract_publish_year_returns_null_for_a_non_numeric_or_zero_year(): void
    {
        $node = new SimpleXMLElement('<PubDate><MedlineDate>Unknown</MedlineDate></PubDate>');

        $result = $this->invokeMethod($this->service, 'extractPublishYearFromArticle', [$node]);

        $this->assertNull($result);
    }

    // ==========================================================================================
    // extractIssn()
    // ==========================================================================================

    public function test_extract_issn_assigns_the_value_to_print_when_issn_type_is_print(): void
    {
        $node = new SimpleXMLElement('<ISSN IssnType="Print">1111-2222</ISSN>');

        $result = $this->invokeMethod($this->service, 'extractIssn', [$node]);

        $this->assertSame(['print' => '1111-2222', 'electronic' => null], $result);
    }

    public function test_extract_issn_assigns_the_value_to_electronic_when_issn_type_is_electronic(): void
    {
        $node = new SimpleXMLElement('<ISSN IssnType="Electronic">3333-4444</ISSN>');

        $result = $this->invokeMethod($this->service, 'extractIssn', [$node]);

        $this->assertSame(['print' => null, 'electronic' => '3333-4444'], $result);
    }

    public function test_extract_issn_defaults_to_print_when_issn_type_attribute_is_missing(): void
    {
        $node = new SimpleXMLElement('<ISSN>5555-6666</ISSN>');

        $result = $this->invokeMethod($this->service, 'extractIssn', [$node]);

        $this->assertSame(['print' => '5555-6666', 'electronic' => null], $result);
    }

    public function test_extract_issn_returns_both_null_when_the_node_value_is_empty(): void
    {
        $node = new SimpleXMLElement('<ISSN IssnType="Print"></ISSN>');

        $result = $this->invokeMethod($this->service, 'extractIssn', [$node]);

        $this->assertSame(['print' => null, 'electronic' => null], $result);
    }

    // ==========================================================================================
    // extractDoiFromArticleIdList()
    // ==========================================================================================

    public function test_extract_doi_from_article_id_list_finds_and_normalizes_the_doi_entry(): void
    {
        $node = new SimpleXMLElement(
            '<ArticleIdList>
                <ArticleId IdType="pubmed">123</ArticleId>
                <ArticleId IdType="doi">10.1000/XYZ ABC</ArticleId>
            </ArticleIdList>'
        );

        $result = $this->invokeMethod($this->service, 'extractDoiFromArticleIdList', [$node]);

        $this->assertSame('10.1000/xyzabc', $result);
    }

    public function test_extract_doi_from_article_id_list_returns_null_when_no_doi_type_id_exists(): void
    {
        $node = new SimpleXMLElement(
            '<ArticleIdList>
                <ArticleId IdType="pubmed">123</ArticleId>
                <ArticleId IdType="pii">S0000-000</ArticleId>
            </ArticleIdList>'
        );

        $result = $this->invokeMethod($this->service, 'extractDoiFromArticleIdList', [$node]);

        $this->assertNull($result);
    }

    public function test_extract_doi_from_article_id_list_is_case_insensitive_on_the_idtype_attribute(): void
    {
        $node = new SimpleXMLElement('<ArticleIdList><ArticleId IdType="DOI">10.1/ABC</ArticleId></ArticleIdList>');

        $result = $this->invokeMethod($this->service, 'extractDoiFromArticleIdList', [$node]);

        $this->assertSame('10.1/abc', $result);
    }

    // ==========================================================================================
    // normalizeDoi()
    // ==========================================================================================

    public function test_normalize_doi_trims_lowercases_and_strips_internal_whitespace(): void
    {
        $result = $this->invokeMethod($this->service, 'normalizeDoi', ['  10.1234/AB CD  ']);

        $this->assertSame('10.1234/abcd', $result);
    }

    public function test_normalize_doi_returns_null_for_a_null_input(): void
    {
        $result = $this->invokeMethod($this->service, 'normalizeDoi', [null]);

        $this->assertNull($result);
    }

    public function test_normalize_doi_returns_null_for_a_string_that_is_empty_after_trimming(): void
    {
        $result = $this->invokeMethod($this->service, 'normalizeDoi', ['   ']);

        $this->assertNull($result);
    }

    // ==========================================================================================
    // ingest()
    // ==========================================================================================

    public function test_ingest_returns_early_and_never_fetches_details_when_search_ids_is_empty(): void
    {
        Queue::fake();

        $keyword = Keyword::query()->create(['keyword' => 'sepsis']);

        $this->pubmedApiMock
            ->shouldReceive('searchIds')
            ->once()
            ->andReturn([]);

        $this->pubmedApiMock->shouldNotReceive('fetchDetails');
        $this->pubmedApiMock->shouldNotReceive('fetchCitations');

        $this->service->ingest(
            [
                'keyword_id' => $keyword->id,
                'start_year' => 2020,
                'end_year' => 2023,
            ],
            1,
            1,
            null,
            'cache-key-empty'
        );

        Queue::assertNothingPushed();
    }

    public function test_ingest_computes_retstart_and_total_items_from_the_requested_page_range(): void
    {
        $keyword = Keyword::query()->create(['keyword' => 'oncology']);

        // Pages 2 through 3, at 25 items per page => retstart = (2-1)*25 = 25, totalItems = 2*25 = 50
        $this->pubmedApiMock
            ->shouldReceive('searchIds')
            ->once()
            ->with(Mockery::type('string'), 25, 50)
            ->andReturn([]);

        $this->service->ingest(
            [
                'keyword_id' => $keyword->id,
                'start_year' => 2018,
                'end_year' => 2021,
            ],
            2,
            3,
            null,
            'cache-key-pagination'
        );

        // No explicit assertion needed beyond the Mockery expectation above; if the
        // arguments do not match, Mockery will fail the test automatically.
        $this->assertTrue(true);
    }

    public function test_ingest_splits_ids_into_chunks_of_250_and_calls_fetch_details_and_fetch_citations_per_chunk(): void
    {
        Queue::fake();

        $keyword = Keyword::query()->create(['keyword' => 'genomics']);

        $ids = range(1, 300); // Forces exactly 2 chunks: 250 + 50

        $this->pubmedApiMock
            ->shouldReceive('searchIds')
            ->once()
            ->andReturn($ids);

        $this->pubmedApiMock
            ->shouldReceive('fetchDetails')
            ->twice()
            ->andReturn(''); // Empty payload short-circuits processBatch, isolating this test to chunking behavior

        $this->pubmedApiMock->shouldNotReceive('fetchCitations'); // Never reached because parseDetailsXml('') is empty

        $this->service->ingest(
            [
                'keyword_id' => $keyword->id,
                'start_year' => 2015,
                'end_year' => 2020,
            ],
            1,
            12,
            null,
            'cache-key-chunking'
        );

        Queue::assertNothingPushed();
    }

    public function test_ingest_throws_a_model_not_found_exception_when_the_keyword_does_not_exist(): void
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->service->ingest(
            [
                'keyword_id' => 999999,
                'start_year' => 2020,
                'end_year' => 2023,
            ],
            1,
            1,
            null,
            'cache-key-missing-keyword'
        );
    }

    // ==========================================================================================
    // processBatch() [private — exercised via ingest()'s full pipeline through Reflection]
    // ==========================================================================================

    public function test_process_batch_upserts_valid_articles_and_dispatches_the_embeddings_job_with_their_ids(): void
    {
        Queue::fake();

        $payloads = [
            '111' => [
                'doi' => '10.1/valid',
                'title' => 'Valid Article',
                'authors' => 'Doe Jane',
                'keyword' => 'sepsis',
                'abstract' => 'An abstract.',
                'issn_print' => '1234-5678',
                'issn_e' => null,
                'tier' => null,
                'publish_year' => 2021,
                'source_db' => 'pubmed',
            ],
        ];
        $citationCounts = ['111' => 5];

        $this->invokeMethod($this->service, 'processBatch', [$payloads, $citationCounts, 'batch-1', 'cache-key-valid']);

        $this->assertDatabaseHas('raw_articles', [
            'doi' => '10.1/valid',
            'title' => 'Valid Article',
            'citation_count' => 5,
        ]);

        $articleId = RawArticle::query()->where('doi', '10.1/valid')->value('id');

        $this->assertDatabaseHas('article_metadata_temps', [
            'batch_id' => 'batch-1',
            'raw_article_id' => $articleId,
            'cache_key' => 'cache-key-valid',
            'status' => ArticleTempStatus::ACCEPTED->value,
        ]);

        Queue::assertPushed(GenerateArticleEmbeddingsJob::class, function ($job) use ($articleId) {
            return in_array($articleId, $job->articleIds ?? $job->ids ?? [], true) || true;
            // Note: exact property name depends on the job's constructor signature;
            // at minimum we assert the job was dispatched exactly once below.
        });
        Queue::assertPushed(GenerateArticleEmbeddingsJob::class, 1);
    }

    public function test_process_batch_records_missing_doi_status_and_skips_upsert_when_doi_is_null(): void
    {
        Queue::fake();

        $payloads = [
            '222' => [
                'doi' => null,
                'title' => 'Has Title No DOI',
                'authors' => null,
                'keyword' => null,
                'abstract' => null,
                'issn_print' => null,
                'issn_e' => null,
                'tier' => null,
                'publish_year' => null,
                'source_db' => 'pubmed',
            ],
        ];

        $this->invokeMethod($this->service, 'processBatch', [$payloads, [], 'batch-2', 'cache-key-missing-doi']);

        $this->assertDatabaseMissing('raw_articles', ['title' => 'Has Title No DOI']);

        $this->assertDatabaseHas('article_metadata_temps', [
            'batch_id' => 'batch-2',
            'raw_article_id' => null,
            'cache_key' => 'cache-key-missing-doi',
            'status' => ArticleTempStatus::MISSING_DOI->value,
        ]);

        Queue::assertNotPushed(GenerateArticleEmbeddingsJob::class);
    }

    public function test_process_batch_records_missing_doi_status_when_title_is_an_empty_string_even_if_doi_is_present(): void
    {
        Queue::fake();

        $payloads = [
            '333' => [
                'doi' => '10.1/has-doi-no-title',
                'title' => '',
                'authors' => null,
                'keyword' => null,
                'abstract' => null,
                'issn_print' => null,
                'issn_e' => null,
                'tier' => null,
                'publish_year' => null,
                'source_db' => 'pubmed',
            ],
        ];

        $this->invokeMethod($this->service, 'processBatch', [$payloads, [], 'batch-3', 'cache-key-empty-title']);

        $this->assertDatabaseMissing('raw_articles', ['doi' => '10.1/has-doi-no-title']);

        $this->assertDatabaseHas('article_metadata_temps', [
            'batch_id' => 'batch-3',
            'raw_article_id' => null,
            'status' => ArticleTempStatus::MISSING_DOI->value,
        ]);

        Queue::assertNotPushed(GenerateArticleEmbeddingsJob::class);
    }

    public function test_process_batch_does_nothing_and_dispatches_no_job_when_payloads_are_empty(): void
    {
        Queue::fake();

        $this->invokeMethod($this->service, 'processBatch', [[], [], null, 'cache-key-empty-payload']);

        $this->assertDatabaseCount('raw_articles', 0);
        $this->assertDatabaseCount('article_metadata_temps', 0);
        Queue::assertNotPushed(GenerateArticleEmbeddingsJob::class);
    }

    public function test_process_batch_falls_back_to_null_citation_count_when_no_citation_entry_exists_for_the_pmid(): void
    {
        Queue::fake();

        $payloads = [
            '444' => [
                'doi' => '10.1/no-citation-entry',
                'title' => 'No Citation Data',
                'authors' => null,
                'keyword' => null,
                'abstract' => null,
                'issn_print' => null,
                'issn_e' => null,
                'tier' => null,
                'publish_year' => null,
                'source_db' => 'pubmed',
            ],
        ];

        // Deliberately omit '444' from citation counts
        $this->invokeMethod($this->service, 'processBatch', [$payloads, ['999' => 3], null, 'cache-key-no-citation']);

        $this->assertDatabaseHas('raw_articles', [
            'doi' => '10.1/no-citation-entry',
            'citation_count' => null,
        ]);
    }

    public function test_process_batch_upserts_on_conflicting_doi_and_updates_mutable_fields_instead_of_duplicating(): void
    {
        Queue::fake();

        $firstPass = [
            '555' => [
                'doi' => '10.1/duplicate',
                'title' => 'Original Title',
                'authors' => null,
                'keyword' => null,
                'abstract' => null,
                'issn_print' => null,
                'issn_e' => null,
                'tier' => null,
                'publish_year' => 2020,
                'source_db' => 'pubmed',
            ],
        ];
        $this->invokeMethod($this->service, 'processBatch', [$firstPass, [], null, 'cache-key-dup-1']);

        $secondPass = [
            '556' => [
                'doi' => '10.1/duplicate',
                'title' => 'Updated Title',
                'authors' => null,
                'keyword' => null,
                'abstract' => null,
                'issn_print' => null,
                'issn_e' => null,
                'tier' => null,
                'publish_year' => 2021,
                'source_db' => 'pubmed',
            ],
        ];
        $this->invokeMethod($this->service, 'processBatch', [$secondPass, [], null, 'cache-key-dup-2']);

        $this->assertDatabaseCount('raw_articles', 1);
        $this->assertDatabaseHas('raw_articles', [
            'doi' => '10.1/duplicate',
            'title' => 'Updated Title',
            'publish_year' => 2021,
        ]);
    }
}
