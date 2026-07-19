<?php

namespace Tests\Unit;

use App\Enums\ArticleTempStatus;
use App\Jobs\GenerateArticleEmbeddingsJob;
use App\Models\ArticleMetadataTemp;
use App\Models\Keyword;
use App\Models\RawArticle;
use App\Models\ScimagoJournal;
use App\Services\ScopusApiService;
use App\Services\ScopusIngestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use ReflectionClass;
use Tests\TestCase;

class ScopusIngestServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ScopusIngestService $service;

    /** @var ScopusApiService&\Mockery\MockInterface */
    protected $scopusApiMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->scopusApiMock = Mockery::mock(ScopusApiService::class);
        $this->service = new ScopusIngestService($this->scopusApiMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Helper to call protected/private methods via reflection.
     */
    protected function invokeMethod(object $object, string $method, array $parameters = [])
    {
        $reflection = new ReflectionClass($object);
        $reflectionMethod = $reflection->getMethod($method);
        $reflectionMethod->setAccessible(true);

        return $reflectionMethod->invokeArgs($object, $parameters);
    }

    /* =========================================================================
     | normalizeDoi()
     * ========================================================================= */

    #[Test]
    public function normalize_doi_returns_null_when_input_is_null(): void
    {
        $result = $this->invokeMethod($this->service, 'normalizeDoi', [null]);

        $this->assertNull($result);
    }

    #[Test]
    public function normalize_doi_trims_lowercases_and_strips_internal_whitespace(): void
    {
        $result = $this->invokeMethod($this->service, 'normalizeDoi', ['  10.1000/ XYZ 123  ']);

        $this->assertSame('10.1000/xyz123', $result);
    }

    #[Test]
    public function normalize_doi_returns_null_when_result_is_empty_string(): void
    {
        $result = $this->invokeMethod($this->service, 'normalizeDoi', ['   ']);

        $this->assertNull($result);
    }

    #[Test]
    public function normalize_doi_is_consistent_for_same_doi_with_different_casing(): void
    {
        $lower = $this->invokeMethod($this->service, 'normalizeDoi', ['10.1000/AbC']);
        $upper = $this->invokeMethod($this->service, 'normalizeDoi', ['10.1000/abc']);

        $this->assertSame($lower, $upper);
    }

    /* =========================================================================
     | extractAuthors()
     * ========================================================================= */

    #[Test]
    public function extract_authors_joins_authname_from_authors_field(): void
    {
        $entry = [
            'authors' => [
                ['authname' => 'Doe J.'],
                ['authname' => 'Smith A.'],
            ],
        ];

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$entry]);

        $this->assertSame('Doe J., Smith A.', $result);
    }

    #[Test]
    public function extract_authors_skips_items_without_authname(): void
    {
        $entry = [
            'authors' => [
                ['authname' => 'Doe J.'],
                ['no_authname_key' => 'x'],
            ],
        ];

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$entry]);

        $this->assertSame('Doe J.', $result);
    }

    #[Test]
    public function extract_authors_falls_back_to_dc_creator_when_authors_is_empty(): void
    {
        $entry = [
            'authors' => [],
            'dc:creator' => 'Doe J.',
        ];

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$entry]);

        $this->assertSame('Doe J.', $result);
    }

    #[Test]
    public function extract_authors_falls_back_to_dc_creator_when_authors_key_is_missing(): void
    {
        $entry = ['dc:creator' => 'Doe J.'];

        $result = $this->invokeMethod($this->service, 'extractAuthors', [$entry]);

        $this->assertSame('Doe J.', $result);
    }

    #[Test]
    public function extract_authors_returns_null_when_authors_and_dc_creator_are_missing(): void
    {
        $result = $this->invokeMethod($this->service, 'extractAuthors', [[]]);

        $this->assertNull($result);
    }

    /* =========================================================================
     | extractArticleKeywords()
     * ========================================================================= */

    #[Test]
    public function extract_article_keywords_replaces_pipe_separator_with_comma(): void
    {
        $entry = ['authkeywords' => 'machine learning | queue | rate limiting'];

        $result = $this->invokeMethod($this->service, 'extractArticleKeywords', [$entry]);

        $this->assertSame('machine learning, queue, rate limiting', $result);
    }

    #[Test]
    public function extract_article_keywords_returns_null_when_trimmed_result_is_empty(): void
    {
        $entry = ['authkeywords' => '   '];

        $result = $this->invokeMethod($this->service, 'extractArticleKeywords', [$entry]);

        $this->assertNull($result);
    }

    #[Test]
    public function extract_article_keywords_returns_null_when_field_is_missing(): void
    {
        $result = $this->invokeMethod($this->service, 'extractArticleKeywords', [[]]);

        $this->assertNull($result);
    }

    /* =========================================================================
     | extractPublishYear()
     * ========================================================================= */

    #[Test]
    public function extract_publish_year_takes_first_four_digits_of_cover_date(): void
    {
        $result = $this->invokeMethod($this->service, 'extractPublishYear', ['2021-06-15']);

        $this->assertSame(2021, $result);
    }

    #[Test]
    public function extract_publish_year_returns_null_when_input_is_null(): void
    {
        $result = $this->invokeMethod($this->service, 'extractPublishYear', [null]);

        $this->assertNull($result);
    }

    #[Test]
    public function extract_publish_year_returns_null_when_result_is_not_positive(): void
    {
        // substr('abcd-xx', 0, 4) => 'abcd' => (int) 'abcd' => 0 => treated as invalid
        $result = $this->invokeMethod($this->service, 'extractPublishYear', ['abcd-01-01']);

        $this->assertNull($result);
    }

    /* =========================================================================
     | resolveTierFromDictionary()
     * ========================================================================= */

    #[Test]
    public function resolve_tier_returns_tier_from_issn_print_when_matched(): void
    {
        $dictionary = ['1234-5678' => 'q1', '8765-4321' => 'q2'];

        $result = $this->invokeMethod($this->service, 'resolveTierFromDictionary', [
            '1234-5678', null, $dictionary,
        ]);

        $this->assertSame('q1', $result);
    }

    #[Test]
    public function resolve_tier_falls_back_to_issn_e_when_issn_print_does_not_match(): void
    {
        $dictionary = ['8765-4321' => 'q2'];

        $result = $this->invokeMethod($this->service, 'resolveTierFromDictionary', [
            '1234-5678', '8765-4321', $dictionary,
        ]);

        $this->assertSame('q2', $result);
    }

    #[Test]
    public function resolve_tier_returns_null_when_neither_issn_matches(): void
    {
        $dictionary = ['9999-9999' => 'q3'];

        $result = $this->invokeMethod($this->service, 'resolveTierFromDictionary', [
            '1234-5678', '8765-4321', $dictionary,
        ]);

        $this->assertNull($result);
    }

    #[Test]
    public function resolve_tier_returns_null_when_both_issn_print_and_issn_e_are_null(): void
    {
        $result = $this->invokeMethod($this->service, 'resolveTierFromDictionary', [
            null, null, ['x' => 'q1'],
        ]);

        $this->assertNull($result);
    }

    /* =========================================================================
     | fetchTiersDictionary()
     * ========================================================================= */

    #[Test]
    public function fetch_tiers_dictionary_returns_empty_array_when_issns_is_empty(): void
    {
        $result = $this->invokeMethod($this->service, 'fetchTiersDictionary', [[]]);

        $this->assertSame([], $result);
    }

    #[Test]
    public function fetch_tiers_dictionary_maps_both_issn_print_and_issn_e_to_tier(): void
    {
        ScimagoJournal::create([
            'source_id'     => 'src-1',
            'title'         => 'Journal One',
            'issn_print'    => '1234-5678',
            'issn_e'        => '8765-4321',
            'best_quartile' => 'Q1',
        ]);
        ScimagoJournal::create([
            'source_id'     => 'src-2',
            'title'         => 'Journal Two',
            'issn_print'    => '1111-2222',
            'issn_e'        => null,
            'best_quartile' => 'Q3',
        ]);

        $result = $this->invokeMethod($this->service, 'fetchTiersDictionary', [
            ['1234-5678', '8765-4321', '1111-2222'],
        ]);

        // assertEquals (not assertSame) on purpose: key order isn't guaranteed by the
        // underlying query, and it doesn't matter for a lookup dictionary.
        $this->assertEquals([
            '1234-5678' => 'q1',
            '8765-4321' => 'q1',
            '1111-2222' => 'q3',
        ], $result);
    }

    #[Test]
    public function fetch_tiers_dictionary_only_includes_journals_matching_requested_issns(): void
    {
        ScimagoJournal::create([
            'source_id'     => 'src-3',
            'title'         => 'Journal Three',
            'issn_print'    => '1234-5678',
            'issn_e'        => null,
            'best_quartile' => 'Q1',
        ]);
        ScimagoJournal::create([
            'source_id'     => 'src-4',
            'title'         => 'Journal Four',
            'issn_print'    => 'not-requested',
            'issn_e'        => null,
            'best_quartile' => 'Q4',
        ]);

        $result = $this->invokeMethod($this->service, 'fetchTiersDictionary', [['1234-5678']]);

        $this->assertArrayHasKey('1234-5678', $result);
        $this->assertArrayNotHasKey('not-requested', $result);
    }

    /* =========================================================================
     | ingest() — pagination orchestration + delegation to processBatch()
     * ========================================================================= */

    #[Test]
    public function ingest_calls_search_for_each_page_with_correct_start_index(): void
    {
        Queue::fake();

        $keyword = Keyword::create(['keyword' => 'message queue']);

        $this->scopusApiMock
            ->shouldReceive('buildScopusQuery')
            ->once()
            ->with('message queue')
            ->andReturn('TITLE-ABS-KEY(message queue)');

        // startPage=1, endPage=2 -> startIndex should be 0 then 25 (itemsPerPage=25)
        $this->scopusApiMock
            ->shouldReceive('search')
            ->once()
            ->with(Mockery::type('string'), 25, 0)
            ->andReturn([]);

        $this->scopusApiMock
            ->shouldReceive('search')
            ->once()
            ->with(Mockery::type('string'), 25, 25)
            ->andReturn([]);

        $this->service->ingest(
            validatedRequest: [
                'keyword_id' => $keyword->id,
                'start_year' => 2019,
                'end_year'   => 2023,
                'tiers'      => [],
            ],
            startPage: 1,
            endPage: 2,
            batchId: 'batch-1',
            cacheKey: 'cache-1'
        );

        // Both pages returned empty entries -> no embedding job should be dispatched
        Queue::assertNotPushed(GenerateArticleEmbeddingsJob::class);
    }

    #[Test]
    public function ingest_skips_pages_with_empty_entries_without_error(): void
    {
        Queue::fake();

        $keyword = Keyword::create(['keyword' => 'rate limiting']);

        $this->scopusApiMock->shouldReceive('buildScopusQuery')->andReturn('QUERY');
        $this->scopusApiMock->shouldReceive('search')->once()->andReturn([]);

        $this->service->ingest(
            validatedRequest: [
                'keyword_id' => $keyword->id,
                'start_year' => 2020,
                'end_year'   => 2020,
                'tiers'      => [],
            ],
            startPage: 1,
            endPage: 1,
            batchId: null,
            cacheKey: 'cache-2'
        );

        $this->assertDatabaseCount('raw_articles', 0);
        $this->assertDatabaseCount('article_metadata_temps', 0);
    }

    #[Test]
    public function ingest_stores_valid_article_with_accepted_status_when_tier_matches(): void
    {
        Queue::fake();

        $keyword = Keyword::create(['keyword' => 'async processing']);

        ScimagoJournal::create([
            'source_id'     => 'src-5',
            'title'         => 'Journal Five',
            'issn_print'    => '1234-5678',
            'issn_e'        => null,
            'best_quartile' => 'Q1',
        ]);

        $entry = [
            'dc:title'       => 'A Study on Async Processing',
            'prism:doi'      => '10.1000/ABC',
            'prism:issn'     => '1234-5678',
            'prism:eIssn'    => null,
            'dc:creator'     => 'Doe J.',
            'authkeywords'   => 'queue | worker',
            'dc:description' => 'Abstract text',
            'citedby-count'  => '5',
            'prism:coverDate' => '2021-03-01',
        ];

        $this->scopusApiMock->shouldReceive('buildScopusQuery')->andReturn('QUERY');
        $this->scopusApiMock->shouldReceive('search')->once()->andReturn([$entry]);

        $this->service->ingest(
            validatedRequest: [
                'keyword_id' => $keyword->id,
                'start_year' => 2020,
                'end_year'   => 2022,
                'tiers'      => ['q1'],
            ],
            startPage: 1,
            endPage: 1,
            batchId: 'batch-9',
            cacheKey: 'cache-9'
        );

        $this->assertDatabaseHas('raw_articles', [
            'doi'   => '10.1000/abc',
            'title' => 'A Study on Async Processing',
            'tier'  => 'q1',
        ]);

        $rawArticleId = RawArticle::where('doi', '10.1000/abc')->value('id');

        $this->assertDatabaseHas('article_metadata_temps', [
            'raw_article_id' => $rawArticleId,
            'cache_key'      => 'cache-9',
            'status'         => ArticleTempStatus::ACCEPTED->value,
        ]);

        // Property name on the job is unknown here, so inspect all public properties
        // generically rather than guessing (e.g. ids, articleIds, rawArticleIds, ...).
        Queue::assertPushed(GenerateArticleEmbeddingsJob::class, function ($job) use ($rawArticleId) {
            foreach (get_object_vars($job) as $value) {
                if (is_array($value) && in_array($rawArticleId, $value, false)) {
                    return true;
                }
            }

            return false;
        });
    }

    #[Test]
    public function ingest_marks_status_unmatched_tier_when_article_tier_is_not_requested(): void
    {
        Queue::fake();

        $keyword = Keyword::create(['keyword' => 'caching']);

        ScimagoJournal::create([
            'source_id'     => 'src-6',
            'title'         => 'Journal Six',
            'issn_print'    => '1234-5678',
            'issn_e'        => null,
            'best_quartile' => 'Q3',
        ]);

        $entry = [
            'dc:title'   => 'Caching Strategies',
            'prism:doi'  => '10.2000/xyz',
            'prism:issn' => '1234-5678',
        ];

        $this->scopusApiMock->shouldReceive('buildScopusQuery')->andReturn('QUERY');
        $this->scopusApiMock->shouldReceive('search')->once()->andReturn([$entry]);

        $this->service->ingest(
            validatedRequest: [
                'keyword_id' => $keyword->id,
                'start_year' => 2020,
                'end_year'   => 2022,
                'tiers'      => ['q1'], // article tier is q3, not requested
            ],
            startPage: 1,
            endPage: 1,
            batchId: 'batch-10',
            cacheKey: 'cache-10'
        );

        // RawArticle is still stored (upsert doesn't filter by tier), only the temp status differs
        $this->assertDatabaseHas('raw_articles', ['doi' => '10.2000/xyz']);

        $this->assertDatabaseHas('article_metadata_temps', [
            'cache_key' => 'cache-10',
            'status'    => ArticleTempStatus::UNMATCHED_TIER->value,
        ]);
    }

    #[Test]
    public function ingest_marks_status_missing_doi_and_skips_raw_article_when_doi_or_title_is_empty(): void
    {
        Queue::fake();

        $keyword = Keyword::create(['keyword' => 'skripsi']);

        $entryWithoutDoi = [
            'dc:title'  => 'Title Without DOI',
            'prism:doi' => null,
        ];
        $entryWithoutTitle = [
            'dc:title'  => '',
            'prism:doi' => '10.3000/abc',
        ];

        $this->scopusApiMock->shouldReceive('buildScopusQuery')->andReturn('QUERY');
        $this->scopusApiMock->shouldReceive('search')->once()->andReturn([$entryWithoutDoi, $entryWithoutTitle]);

        $this->service->ingest(
            validatedRequest: [
                'keyword_id' => $keyword->id,
                'start_year' => 2020,
                'end_year'   => 2022,
                'tiers'      => [],
            ],
            startPage: 1,
            endPage: 1,
            batchId: 'batch-11',
            cacheKey: 'cache-11'
        );

        $this->assertDatabaseCount('raw_articles', 0);

        $this->assertDatabaseHas('article_metadata_temps', [
            'cache_key'      => 'cache-11',
            'status'         => ArticleTempStatus::MISSING_DOI->value,
            'raw_article_id' => null,
        ]);

        $this->assertSame(
            2,
            ArticleMetadataTemp::where('cache_key', 'cache-11')
                ->where('status', ArticleTempStatus::MISSING_DOI->value)
                ->count()
        );
    }

    #[Test]
    public function ingest_upserts_instead_of_duplicating_when_doi_already_exists(): void
    {
        Queue::fake();

        $keyword = Keyword::create(['keyword' => 'upsert test']);

        $oldEntry = [
            'dc:title'  => 'Old Title',
            'prism:doi' => '10.4000/dup',
        ];
        $newEntry = [
            'dc:title'  => 'Revised Title',
            'prism:doi' => '10.4000/DUP', // same DOI after normalization (lowercase)
        ];

        $this->scopusApiMock->shouldReceive('buildScopusQuery')->andReturn('QUERY');
        $this->scopusApiMock->shouldReceive('search')
            ->once()
            ->andReturn([$oldEntry, $newEntry]);

        $this->service->ingest(
            validatedRequest: [
                'keyword_id' => $keyword->id,
                'start_year' => 2020,
                'end_year'   => 2022,
                'tiers'      => [],
            ],
            startPage: 1,
            endPage: 1,
            batchId: 'batch-12',
            cacheKey: 'cache-12'
        );

        // Only 1 row in raw_articles because the DOI is the same (upsert), with the latest title
        $this->assertDatabaseCount('raw_articles', 1);
        $this->assertDatabaseHas('raw_articles', [
            'doi'   => '10.4000/dup',
            'title' => 'Revised Title',
        ]);
    }

    #[Test]
    public function ingest_does_not_dispatch_embedding_job_when_no_article_was_stored(): void
    {
        Queue::fake();

        $keyword = Keyword::create(['keyword' => 'no results']);

        $this->scopusApiMock->shouldReceive('buildScopusQuery')->andReturn('QUERY');
        $this->scopusApiMock->shouldReceive('search')->once()->andReturn([
            ['dc:title' => '', 'prism:doi' => null], // invalid, ends up as MISSING_DOI
        ]);

        $this->service->ingest(
            validatedRequest: [
                'keyword_id' => $keyword->id,
                'start_year' => 2020,
                'end_year'   => 2022,
                'tiers'      => [],
            ],
            startPage: 1,
            endPage: 1,
            batchId: 'batch-13',
            cacheKey: 'cache-13'
        );

        Queue::assertNotPushed(GenerateArticleEmbeddingsJob::class);
    }
}
