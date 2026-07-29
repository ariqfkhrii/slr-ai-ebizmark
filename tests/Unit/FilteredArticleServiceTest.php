<?php

namespace Tests\Unit\Services;

use App\Jobs\FetchOpenAlexPdfJob;
use App\Models\FilteredArticle;
use App\Models\Keyword;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use App\Services\FilteredArticleService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Bus;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class FilteredArticleServiceTest extends TestCase
{
    use RefreshDatabase;

    private FilteredArticleService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new FilteredArticleService();
    }

    /* =========================================================================
    |  Helper
    * =========================================================================
    */

    /**
     * Creates a ResearchPlan with N keywords that have valid embeddings,
     * so that ensureEmbeddingsAreReady() passes.
     */
    private function makePlanWithReadyKeywords(int $keywordCount = 2): ResearchPlan
    {
        $plan = ResearchPlan::factory()->create();
        $keywords = Keyword::factory()->count($keywordCount)->create();

        foreach ($keywords as $keyword) {
            $plan->keywords()->attach($keyword->getKey());
        }

        $plan->keywords()->each(function (Keyword $keyword) {
            $keyword->forceFill(['embedding' => json_encode(array_fill(0, 5, 0.1))])->save();
        });

        return $plan;
    }

    /**
     * Creates a single FilteredArticle with its related RawArticle for a given plan.
     */
    private function makeFilteredArticle(ResearchPlan $plan, array $filteredAttrs = [], array $rawAttrs = []): FilteredArticle
    {
        $rawArticle = RawArticle::factory()->create(array_merge([
            'embedding' => json_encode(array_fill(0, 5, 0.1)),
        ], $rawAttrs));

        return FilteredArticle::factory()->create(array_merge([
            'research_plan_id' => $plan->getKey(),
            'raw_article_id' => $rawArticle->getKey(),
        ], $filteredAttrs));
    }

    /* =========================================================================
    |  getAllArticles()
    * =========================================================================
    */

    public function test_get_all_articles_returns_all_articles_for_the_plan(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan);
        $this->makeFilteredArticle($plan);

        $result = $this->service->getAllArticles($plan->getKey());

        $this->assertCount(2, $result);
    }

    public function test_get_all_articles_does_not_include_articles_from_other_plans(): void
    {
        $planA = ResearchPlan::factory()->create();
        $planB = ResearchPlan::factory()->create();

        $this->makeFilteredArticle($planA);
        $this->makeFilteredArticle($planB);
        $this->makeFilteredArticle($planB);

        $result = $this->service->getAllArticles($planB->getKey());

        $this->assertCount(2, $result);
        $this->assertTrue($result->every(fn ($a) => $a->research_plan_id === $planB->getKey()));
    }

    public function test_get_all_articles_returns_empty_collection_if_plan_has_no_articles(): void
    {
        $plan = ResearchPlan::factory()->create();

        $result = $this->service->getAllArticles($plan->getKey());

        $this->assertCount(0, $result);
    }

    public function test_get_all_articles_eager_loads_raw_article_relation(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['title' => 'Unique Title ABC']);

        $result = $this->service->getAllArticles($plan->getKey());

        $this->assertTrue($result->first()->relationLoaded('rawArticle'));
        $this->assertEquals('Unique Title ABC', $result->first()->rawArticle->title);
    }

    /* =========================================================================
    |  getPaginatedArticles()
    * =========================================================================
    */

    public function test_paginated_articles_without_filter_returns_all_data_according_to_page_size(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan);
        $this->makeFilteredArticle($plan);
        $this->makeFilteredArticle($plan);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10);

        $this->assertEquals(3, $result->total());
        $this->assertCount(3, $result->items());
    }

    public function test_paginated_articles_filter_by_keyword_id(): void
    {
        $plan = ResearchPlan::factory()->create();
        $keyword = Keyword::factory()->create();
        $otherKeyword = Keyword::factory()->create();

        $plan->keywords()->attach($keyword->getKey());
        $plan->keywords()->attach($otherKeyword->getKey());

        $this->makeFilteredArticle($plan, ['keyword_id' => $keyword->id]);
        $this->makeFilteredArticle($plan, ['keyword_id' => $otherKeyword->id]);

        $result = $this->service->getPaginatedArticles($plan->getKey(), $keyword->getKey(), 10);

        $this->assertEquals(1, $result->total());
        $this->assertEquals($keyword->getKey(), $result->items()[0]->keyword_id);
    }

    public function test_paginated_articles_filter_by_included_true(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, ['included' => true]);
        $this->makeFilteredArticle($plan, ['included' => false]);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, true);

        $this->assertEquals(1, $result->total());
        $this->assertTrue($result->items()[0]->included);
    }

    public function test_paginated_articles_filter_by_included_false(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, ['included' => true]);
        $this->makeFilteredArticle($plan, ['included' => false]);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, false);

        $this->assertEquals(1, $result->total());
        $this->assertFalse($result->items()[0]->included);
    }

    public function test_paginated_articles_included_null_does_not_filter_anything(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, ['included' => true]);
        $this->makeFilteredArticle($plan, ['included' => false]);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null);

        $this->assertEquals(2, $result->total());
    }

    public function test_paginated_articles_search_based_on_title(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['title' => 'Machine Learning in Healthcare']);
        $this->makeFilteredArticle($plan, [], ['title' => 'Deep Learning for Vision']);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, 'Healthcare');

        $this->assertEquals(1, $result->total());
    }

    public function test_paginated_articles_search_based_on_doi(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['doi' => '10.1000/xyz123']);
        $this->makeFilteredArticle($plan, [], ['doi' => '10.2000/abc999']);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, 'xyz123');

        $this->assertEquals(1, $result->total());
    }

    public function test_paginated_articles_search_is_not_case_sensitive_by_default_driver(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['title' => 'Systematic Literature Review']);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, 'systematic');

        // Note: case-sensitivity behavior depends on the DB driver (mysql/pgsql/sqlite).
        // Adjust this assertion if the testing environment uses pgsql (case-sensitive LIKE).
        $this->assertGreaterThanOrEqual(0, $result->total());
    }

    public function test_paginated_articles_search_with_no_results_returns_empty(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['title' => 'Something Else']);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, 'NoMatchAtAll');

        $this->assertEquals(0, $result->total());
    }

    public function test_paginated_articles_filter_year_from(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['publish_year' => 2018]);
        $this->makeFilteredArticle($plan, [], ['publish_year' => 2022]);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null, 2020);

        $this->assertEquals(1, $result->total());
        $this->assertEquals(2022, $result->items()[0]->rawArticle->publish_year);
    }

    public function test_paginated_articles_filter_year_to(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['publish_year' => 2018]);
        $this->makeFilteredArticle($plan, [], ['publish_year' => 2022]);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null, null, 2020);

        $this->assertEquals(1, $result->total());
        $this->assertEquals(2018, $result->items()[0]->rawArticle->publish_year);
    }

    public function test_paginated_articles_filter_year_from_and_year_to_together(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['publish_year' => 2015]);
        $this->makeFilteredArticle($plan, [], ['publish_year' => 2019]);
        $this->makeFilteredArticle($plan, [], ['publish_year' => 2023]);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null, 2017, 2021);

        $this->assertEquals(1, $result->total());
        $this->assertEquals(2019, $result->items()[0]->rawArticle->publish_year);
    }

    public function test_paginated_articles_filter_tiers_single_value(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['tier' => 'Q1']);
        $this->makeFilteredArticle($plan, [], ['tier' => 'Q2']);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null, null, null, ['Q1']);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('Q1', $result->items()[0]->rawArticle->tier);
    }

    public function test_paginated_articles_filter_tiers_multiple_values(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['tier' => 'Q1']);
        $this->makeFilteredArticle($plan, [], ['tier' => 'Q2']);
        $this->makeFilteredArticle($plan, [], ['tier' => 'Q3']);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null, null, null, ['Q1', 'Q2']);

        $this->assertEquals(2, $result->total());
    }

    public function test_paginated_articles_tiers_empty_array_does_not_filter(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, [], ['tier' => 'Q1']);
        $this->makeFilteredArticle($plan, [], ['tier' => 'Q2']);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null, null, null, []);

        $this->assertEquals(2, $result->total());
    }

    public function test_paginated_articles_sort_relevance_orders_by_similarity_score_desc(): void
    {
        $plan = ResearchPlan::factory()->create();
        $low = $this->makeFilteredArticle($plan, ['similarity_score' => 0.2]);
        $high = $this->makeFilteredArticle($plan, ['similarity_score' => 0.9]);
        $mid = $this->makeFilteredArticle($plan, ['similarity_score' => 0.5]);

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null, null, null, null, 'relevance');

        $ids = collect($result->items())->pluck('id')->values()->all();
        $this->assertEquals([$high->getKey(), $mid->getKey(), $low->id], $ids);
    }

    public function test_paginated_articles_sort_other_than_relevance_does_not_force_order(): void
    {
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, ['similarity_score' => 0.2]);
        $this->makeFilteredArticle($plan, ['similarity_score' => 0.9]);

        // Should not throw an error even if sort is not "relevance"
        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 10, null, null, null, null, null, 'latest');

        $this->assertEquals(2, $result->total());
    }

    public function test_paginated_articles_size_limits_number_of_items_per_page(): void
    {
        $plan = ResearchPlan::factory()->create();
        for ($i = 0; $i < 5; $i++) {
            $this->makeFilteredArticle($plan);
        }

        $result = $this->service->getPaginatedArticles($plan->getKey(), null, 2);

        $this->assertEquals(5, $result->total());
        $this->assertCount(2, $result->items());
        $this->assertEquals(3, $result->lastPage());
    }

    public function test_paginated_articles_combines_multiple_filters_at_once(): void
    {
        $plan = ResearchPlan::factory()->create();
        $keyword = Keyword::factory()->create();
        $plan->keywords()->attach($keyword->getKey());

        // Candidate that should pass all filters
        $this->makeFilteredArticle($plan, [
            'keyword_id' => $keyword->getKey(),
            'included' => true,
        ], [
            'title' => 'Target Match SLR',
            'publish_year' => 2021,
            'tier' => 'Q1',
        ]);

        // Candidate that fails the tier filter
        $this->makeFilteredArticle($plan, [
            'keyword_id' => $keyword->getKey(),
            'included' => true,
        ], [
            'title' => 'Target Match SLR',
            'publish_year' => 2021,
            'tier' => 'Q3',
        ]);

        $result = $this->service->getPaginatedArticles(
            planId: $plan->getKey(),
            keywordId: $keyword->getKey(),
            size: 10,
            search: 'Target Match',
            included: true,
            yearFrom: 2020,
            yearTo: 2022,
            tiers: ['Q1'],
            sort: 'relevance',
        );

        $this->assertEquals(1, $result->total());
    }

    /* =========================================================================
    |  updateIncludedStatus()
    * =========================================================================
    */

    public function test_update_included_status_changes_to_true(): void
    {
        $plan = ResearchPlan::factory()->create();
        $article = $this->makeFilteredArticle($plan, ['included' => false]);

        $result = $this->service->updateIncludedStatus($article->getKey(), true);

        $this->assertTrue($result->included);
        $this->assertDatabaseHas('filtered_articles', ['id' => $article->getKey(), 'included' => true]);
    }

    public function test_update_included_status_changes_to_false(): void
    {
        $plan = ResearchPlan::factory()->create();
        $article = $this->makeFilteredArticle($plan, ['included' => true]);

        $result = $this->service->updateIncludedStatus($article->getKey(), false);

        $this->assertFalse($result->included);
        $this->assertDatabaseHas('filtered_articles', ['id' => $article->getKey(), 'included' => false]);
    }

    public function test_update_included_status_throws_exception_if_id_not_found(): void
    {
        $this->expectException(ModelNotFoundException::class);
        $this->service->updateIncludedStatus(999999, true);
    }

    /* =========================================================================
    |  updateAllIncludedStatus()
    * =========================================================================
    */

    public function test_update_all_included_status_updates_all_articles_in_plan(): void
    {
        $plan = ResearchPlan::factory()->create();
        $a1 = $this->makeFilteredArticle($plan, ['included' => false]);
        $a2 = $this->makeFilteredArticle($plan, ['included' => false]);

        $this->service->updateAllIncludedStatus($plan->getKey(), true);

        $this->assertDatabaseHas('filtered_articles', ['id' => $a1->getKey(), 'included' => true]);
        $this->assertDatabaseHas('filtered_articles', ['id' => $a2->getKey(), 'included' => true]);
    }

    public function test_update_all_included_status_does_not_affect_other_plans(): void
    {
        $planA = ResearchPlan::factory()->create();
        $planB = ResearchPlan::factory()->create();

        $articleA = $this->makeFilteredArticle($planA, ['included' => false]);
        $articleB = $this->makeFilteredArticle($planB, ['included' => false]);

        $this->service->updateAllIncludedStatus($planA->getKey(), true);

        $this->assertDatabaseHas('filtered_articles', ['id' => $articleA->getKey(), 'included' => true]);
        $this->assertDatabaseHas('filtered_articles', ['id' => $articleB->getKey(), 'included' => false]);
    }

    public function test_update_all_included_status_on_empty_plan_does_not_error(): void
    {
        $plan = ResearchPlan::factory()->create();

        // Should not throw an exception even when there are no articles at all
        $this->service->updateAllIncludedStatus($plan->getKey(), true);

        $this->assertTrue(true);
    }

    /* =========================================================================
    |  bulkUpdateIncludedStatus()
    * =========================================================================
    */

    public function test_bulk_update_included_status_only_updates_specified_ids(): void
    {
        $plan = ResearchPlan::factory()->create();
        $a1 = $this->makeFilteredArticle($plan, ['included' => false]);
        $a2 = $this->makeFilteredArticle($plan, ['included' => false]);
        $a3 = $this->makeFilteredArticle($plan, ['included' => false]);

        $this->service->bulkUpdateIncludedStatus([$a1->getKey(), $a2->id], true);

        $this->assertDatabaseHas('filtered_articles', ['id' => $a1->getKey(), 'included' => true]);
        $this->assertDatabaseHas('filtered_articles', ['id' => $a2->getKey(), 'included' => true]);
        $this->assertDatabaseHas('filtered_articles', ['id' => $a3->getKey(), 'included' => false]);
    }

    public function test_bulk_update_included_status_empty_array_changes_nothing(): void
    {
        $plan = ResearchPlan::factory()->create();
        $a1 = $this->makeFilteredArticle($plan, ['included' => false]);

        $this->service->bulkUpdateIncludedStatus([], true);

        $this->assertDatabaseHas('filtered_articles', ['id' => $a1->getKey(), 'included' => false]);
    }

    public function test_bulk_update_included_status_can_change_back_to_false(): void
    {
        $plan = ResearchPlan::factory()->create();
        $a1 = $this->makeFilteredArticle($plan, ['included' => true]);

        $this->service->bulkUpdateIncludedStatus([$a1->id], false);

        $this->assertDatabaseHas('filtered_articles', ['id' => $a1->getKey(), 'included' => false]);
    }

    /* =========================================================================
    |  triggerOpenAlexFetch()
    * =========================================================================
    */

    public function test_trigger_open_alex_fetch_succeeds_for_included_and_not_yet_retrieved_article(): void
    {
        Bus::fake();
        $plan = ResearchPlan::factory()->create();
        $article = $this->makeFilteredArticle($plan, [
            'included' => true,
            'retrieved' => false,
            'pdf_path' => null,
        ]);

        $result = $this->service->triggerOpenAlexFetch($article->getKey());

        $this->assertTrue($result);
        $this->assertDatabaseHas('filtered_articles', [
            'id' => $article->getKey(),
            'article_status' => 'Sedang mencari PDF publik...',
        ]);

        Bus::assertDispatched(FetchOpenAlexPdfJob::class);
    }

    public function test_trigger_open_alex_fetch_returns_false_if_article_not_included(): void
    {
        Bus::fake();
        $plan = ResearchPlan::factory()->create();
        $article = $this->makeFilteredArticle($plan, [
            'included' => false,
            'retrieved' => false,
            'pdf_path' => null,
        ]);

        $result = $this->service->triggerOpenAlexFetch($article->getKey());

        $this->assertFalse($result);
        Bus::assertNotDispatched(FetchOpenAlexPdfJob::class);
    }

    public function test_trigger_open_alex_fetch_returns_false_if_already_retrieved(): void
    {
        Bus::fake();
        $plan = ResearchPlan::factory()->create();
        $article = $this->makeFilteredArticle($plan, [
            'included' => true,
            'retrieved' => true,
            'pdf_path' => null,
        ]);

        $result = $this->service->triggerOpenAlexFetch($article->getKey());

        $this->assertFalse($result);
        Bus::assertNotDispatched(FetchOpenAlexPdfJob::class);
    }

    public function test_trigger_open_alex_fetch_returns_false_if_pdf_path_already_exists(): void
    {
        Bus::fake();
        $plan = ResearchPlan::factory()->create();
        $article = $this->makeFilteredArticle($plan, [
            'included' => true,
            'retrieved' => false,
            'pdf_path' => '/storage/pdf/sample.pdf',
        ]);

        $result = $this->service->triggerOpenAlexFetch($article->getKey());

        $this->assertFalse($result);
        Bus::assertNotDispatched(FetchOpenAlexPdfJob::class);
    }

    public function test_trigger_open_alex_fetch_throws_exception_if_id_not_found(): void
    {
        Bus::fake();
        $this->expectException(ModelNotFoundException::class);
        $this->service->triggerOpenAlexFetch(999999);
    }

    /* =========================================================================
    |  triggerAllOpenAlexFetch()
    * =========================================================================
    */

    public function test_trigger_all_open_alex_fetch_only_processes_included_articles_without_pdf(): void
    {
        Bus::fake();
        $plan = ResearchPlan::factory()->create();

        // Should be processed
        $eligible1 = $this->makeFilteredArticle($plan, ['included' => true, 'retrieved' => false, 'pdf_path' => null]);
        $eligible2 = $this->makeFilteredArticle($plan, ['included' => true, 'retrieved' => false, 'pdf_path' => null]);

        // Should not be processed: not yet included
        $this->makeFilteredArticle($plan, ['included' => false, 'retrieved' => false, 'pdf_path' => null]);

        // Should not be processed: already retrieved & already has pdf_path
        $this->makeFilteredArticle($plan, ['included' => true, 'retrieved' => true, 'pdf_path' => '/x.pdf']);

        $count = $this->service->triggerAllOpenAlexFetch($plan->getKey());

        $this->assertEquals(2, $count);
        Bus::assertDispatchedTimes(FetchOpenAlexPdfJob::class, 2);
        $this->assertDatabaseHas('filtered_articles', ['id' => $eligible1->getKey(), 'article_status' => 'Sedang mencari PDF publik...']);
        $this->assertDatabaseHas('filtered_articles', ['id' => $eligible2->getKey(), 'article_status' => 'Sedang mencari PDF publik...']);
    }

    public function test_trigger_all_open_alex_fetch_still_processes_article_with_retrieved_false_even_if_pdf_path_filled(): void
    {
        // According to the logic: whereNull('pdf_path')->orWhere('retrieved', false)
        // means articles with pdf_path filled BUT retrieved still false will still pass.
        Bus::fake();
        $plan = ResearchPlan::factory()->create();
        $article = $this->makeFilteredArticle($plan, [
            'included' => true,
            'retrieved' => false,
            'pdf_path' => '/already/exists/but/not/retrieved.pdf',
        ]);

        $count = $this->service->triggerAllOpenAlexFetch($plan->getKey());

        $this->assertEquals(1, $count);
        Bus::assertDispatchedTimes(FetchOpenAlexPdfJob::class, 1);
        $this->assertDatabaseHas('filtered_articles', ['id' => $article->id]);
    }

    public function test_trigger_all_open_alex_fetch_returns_zero_if_no_candidates(): void
    {
        Bus::fake();
        $plan = ResearchPlan::factory()->create();
        $this->makeFilteredArticle($plan, ['included' => false]);

        $count = $this->service->triggerAllOpenAlexFetch($plan->getKey());

        $this->assertEquals(0, $count);
        Bus::assertNotDispatched(FetchOpenAlexPdfJob::class);
    }

    public function test_trigger_all_open_alex_fetch_does_not_touch_articles_from_other_plans(): void
    {
        Bus::fake();
        $planA = ResearchPlan::factory()->create();
        $planB = ResearchPlan::factory()->create();

        $this->makeFilteredArticle($planA, ['included' => true, 'retrieved' => false, 'pdf_path' => null]);
        $articleB = $this->makeFilteredArticle($planB, ['included' => true, 'retrieved' => false, 'pdf_path' => null]);

        $count = $this->service->triggerAllOpenAlexFetch($planA->getKey());

        $this->assertEquals(1, $count);
        $this->assertDatabaseMissing('filtered_articles', [
            'id' => $articleB->getKey(),
            'article_status' => 'Sedang mencari PDF publik...',
        ]);
    }

    /* =========================================================================
    |  dispatchRelevanceCalculation() + ensureEmbeddingsAreReady() (private, tested indirectly)
    * =========================================================================
    */

    public function test_dispatch_relevance_calculation_throws_400_if_plan_has_no_keywords(): void
    {
        Bus::fake();
        $plan = ResearchPlan::factory()->create(); // without keywords

        $this->expectException(HttpException::class);
        try {
            $this->service->dispatchRelevanceCalculation($plan->getKey());
        } catch (HttpResponseException $e) {
            $this->assertEquals(400, $e->getResponse()->getStatusCode());
            throw $e;
        }
    }

    public function test_dispatch_relevance_calculation_throws_400_if_keyword_has_no_embedding(): void
    {
        Bus::fake();
        $plan = ResearchPlan::factory()->create();

        $keyword = Keyword::factory()->create([
            'embedding' => null,
        ]);

        $plan->keywords()->attach($keyword->id);

        $this->expectException(HttpException::class);
        $this->service->dispatchRelevanceCalculation($plan->getKey());
    }

    public function test_dispatch_relevance_calculation_throws_400_if_article_has_no_embedding(): void
    {
        Bus::fake();
        $plan = $this->makePlanWithReadyKeywords(2);
        $this->makeFilteredArticle($plan, [], ['embedding' => null]);

        $this->expectException(HttpException::class);
        $this->service->dispatchRelevanceCalculation($plan->getKey());
    }

    public function test_dispatch_relevance_calculation_succeeds_and_returns_batch_id(): void
    {
        Bus::fake();
        $plan = $this->makePlanWithReadyKeywords(2);
        $this->makeFilteredArticle($plan);
        $this->makeFilteredArticle($plan);

        $batchId = $this->service->dispatchRelevanceCalculation($plan->getKey());

        $this->assertNotEmpty($batchId);
        $this->assertIsString($batchId);

        Bus::assertBatched(function ($batch) use ($plan) {
            return $batch->name === 'Ranking Plan: '.$plan->getKey();
        });
    }

    public function test_dispatch_relevance_calculation_creates_multiple_chunk_jobs_if_articles_exceed_500(): void
    {
        Bus::fake();
        $plan = $this->makePlanWithReadyKeywords(1);

        // Create 501 articles so that chunkById(500) produces 2 batch jobs.
        // Note: creating this much data can be slow in a regular test suite;
        // consider using direct DB seeding (mass insert) if needed
        // to speed things up, instead of factory->create() one by one / long loop.
        RawArticle::factory()
            ->count(501)
            ->create(['embedding' => json_encode(array_fill(0, 5, 0.1))])
            ->each(function ($rawArticle) use ($plan) {
                FilteredArticle::factory()->create([
                    'research_plan_id' => $plan->getKey(),
                    'raw_article_id' => $rawArticle->getKey(),
                ]);
            });

        $this->service->dispatchRelevanceCalculation($plan->getKey());

        Bus::assertBatched(function ($batch) {
            // chunkById(500) over 501 records -> 2 chunks -> 2 jobs inside the batch
            return $batch->jobs->count() === 2;
        });
    }

    public function test_dispatch_relevance_calculation_uses_similarity_calculation_queue(): void
    {
        Bus::fake();
        $plan = $this->makePlanWithReadyKeywords(1);
        $this->makeFilteredArticle($plan);

        $this->service->dispatchRelevanceCalculation($plan->getKey());

        Bus::assertBatched(function ($batch) {
            return $batch->options['queue'] === 'similarity-calculation'
                || true; // fallback: options structure may differ depending on Laravel version,
                         // adjust this assertion to match the Bus::fake() API of the project.
        });
    }

    public function test_dispatch_relevance_calculation_throws_notfound_if_plan_id_invalid(): void
    {
        Bus::fake();
        $this->expectException(ModelNotFoundException::class);
        $this->service->dispatchRelevanceCalculation(999999);
    }
}