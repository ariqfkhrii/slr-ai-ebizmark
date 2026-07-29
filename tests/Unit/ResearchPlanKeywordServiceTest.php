<?php

namespace Tests\Unit;

use App\Jobs\GenerateKeywordEmbeddingJob;
use App\Models\FilteredArticle;
use App\Models\Keyword;
use App\Models\ResearchPlan;
use App\Models\User;
use App\Services\ResearchPlanKeyword\ResearchPlanKeywordService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

class ResearchPlanKeywordServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ResearchPlanKeywordService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ResearchPlanKeywordService();
    }

    // ---------------------------------------------------------
    // checkOwnership
    // ---------------------------------------------------------

    public function test_check_ownership_passes_for_owner(): void
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        // gak boleh throw
        $this->service->checkOwnership($user->id, $plan->research_plan_id);
        $this->assertTrue(true);
    }

    public function test_check_ownership_throws_when_not_owner(): void
    {
        $owner   = User::factory()->create();
        $intruder = User::factory()->create();
        $plan    = ResearchPlan::factory()->create(['user_id' => $owner->id]);

        $this->expectException(AuthorizationException::class);

        $this->service->checkOwnership($intruder->id, $plan->research_plan_id);
    }

    public function test_check_ownership_throws_when_plan_not_found(): void
    {
        $user = User::factory()->create();

        $this->expectException(AuthorizationException::class);

        $this->service->checkOwnership($user->id, 999999);
    }

    // ---------------------------------------------------------
    // getKeywordsByResearchPlan
    // ---------------------------------------------------------

    public function test_get_keywords_returns_mapped_collection(): void
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);
        $keyword = Keyword::factory()->create(['keyword' => 'machine learning']);

        $plan->keywords()->attach($keyword->id, [
            'article_count'           => 10,
            'duplicate_count'         => 2,
            'unmatched_tier_count'    => 1,
            'missing_doi_count'       => 0,
            'out_of_year_range_count' => 3,
        ]);

        $result = $this->service->getKeywordsByResearchPlan($user->id, $plan->research_plan_id);

        $this->assertCount(1, $result);
        $item = $result->first();

        $this->assertEquals($keyword->id, $item['id']);
        $this->assertEquals('machine learning', $item['name']);
        $this->assertEquals(10, $item['article_count']);
        $this->assertEquals(2, $item['duplicate_count']);
        $this->assertEquals(1, $item['unmatched_tier_count']);
        $this->assertEquals(0, $item['missing_doi_count']);
        $this->assertEquals(3, $item['out_of_year_range_count']);
    }

    public function test_get_keywords_throws_when_not_owner(): void
    {
        $owner    = User::factory()->create();
        $intruder = User::factory()->create();
        $plan     = ResearchPlan::factory()->create(['user_id' => $owner->id]);

        $this->expectException(AuthorizationException::class);

        $this->service->getKeywordsByResearchPlan($intruder->id, $plan->research_plan_id);
    }

    public function test_get_keywords_returns_empty_collection_when_no_keywords_attached(): void
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $result = $this->service->getKeywordsByResearchPlan($user->id, $plan->research_plan_id);

        $this->assertCount(0, $result);
    }

    // ---------------------------------------------------------
    // attachKeywordToResearchPlan
    // ---------------------------------------------------------

    public function test_attach_new_keyword_creates_keyword_and_dispatches_job(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id, 'keyword_count' => 0]);

        $keyword = $this->service->attachKeywordToResearchPlan($user->id, $plan->research_plan_id, 'nlp');

        $this->assertDatabaseHas('keywords', ['keyword' => 'nlp']);
        $this->assertTrue($plan->keywords()->where('keyword_id', $keyword->id)->exists());

        Queue::assertPushed(GenerateKeywordEmbeddingJob::class, function ($job) use ($keyword) {
            return $job->keywordId === $keyword->id;
        });

        $this->assertEquals(1, $plan->fresh()->keyword_count);
    }

    public function test_attach_existing_keyword_reuses_it_no_duplicate(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $existing = Keyword::factory()->create(['keyword' => 'deep learning']);

        $result = $this->service->attachKeywordToResearchPlan(
            $user->id,
            $plan->research_plan_id,
            'deep learning'
        );

        $this->assertEquals($existing->id, $result->id);
        $this->assertEquals(1, Keyword::where('keyword', 'deep learning')->count());
    }

    public function test_attach_keyword_twice_does_not_detach_or_duplicate_pivot(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $this->service->attachKeywordToResearchPlan($user->id, $plan->research_plan_id, 'ai');
        $this->service->attachKeywordToResearchPlan($user->id, $plan->research_plan_id, 'ai');

        $this->assertEquals(1, $plan->keywords()->count());
        $this->assertEquals(1, $plan->fresh()->keyword_count);
    }

    public function test_attach_keyword_throws_when_not_owner(): void
    {
        Queue::fake();

        $owner    = User::factory()->create();
        $intruder = User::factory()->create();
        $plan     = ResearchPlan::factory()->create(['user_id' => $owner->id]);

        $this->expectException(AuthorizationException::class);

        $this->service->attachKeywordToResearchPlan($intruder->id, $plan->research_plan_id, 'ai');
    }

    // ---------------------------------------------------------
    // updateKeywordForResearchPlan
    // ---------------------------------------------------------

    public function test_update_keyword_to_different_name_detaches_old_attaches_new_and_resets_pivot(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $oldKeyword = Keyword::factory()->create(['keyword' => 'old-term']);
        $plan->keywords()->attach($oldKeyword->id, [
            'article_count' => 50, 'duplicate_count' => 5,
            'unmatched_tier_count' => 2, 'missing_doi_count' => 1,
            'out_of_year_range_count' => 3,
        ]);

        $filtered = FilteredArticle::factory()->create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id'       => $oldKeyword->id,
        ]);

        $newKeyword = $this->service->updateKeywordForResearchPlan(
            $user->id,
            $plan->research_plan_id,
            $oldKeyword->id,
            'new-term'
        );

        // old keyword lepas dari plan
        $this->assertFalse($plan->keywords()->where('keyword_id', $oldKeyword->id)->exists());

        // filtered article lama ikut kehapus
        $this->assertDatabaseMissing('filtered_articles', ['id' => $filtered->id]);

        // keyword baru ke-attach dengan pivot ke-reset
        $pivot = $plan->keywords()->where('keyword_id', $newKeyword->id)->first()->pivot;
        $this->assertEquals(0, $pivot->article_count);
        $this->assertEquals(0, $pivot->duplicate_count);
        $this->assertEquals(0, $pivot->unmatched_tier_count);
        $this->assertEquals(0, $pivot->missing_doi_count);
        $this->assertEquals(0, $pivot->out_of_year_range_count);

        Queue::assertPushed(GenerateKeywordEmbeddingJob::class);
        $this->assertEquals(1, $plan->fresh()->keyword_count);
    }

    public function test_update_keyword_with_same_resulting_id_does_not_detach_or_reset_pivot(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $keyword = Keyword::factory()->create(['keyword' => 'same-term']);
        $plan->keywords()->attach($keyword->id, [
            'article_count' => 20, 'duplicate_count' => 0,
            'unmatched_tier_count' => 0, 'missing_doi_count' => 0,
            'out_of_year_range_count' => 0,
        ]);

        // update dengan nama yg sama -> firstOrCreate balikin id yg sama
        $this->service->updateKeywordForResearchPlan(
            $user->id,
            $plan->research_plan_id,
            $keyword->id,
            'same-term'
        );

        $pivot = $plan->keywords()->where('keyword_id', $keyword->id)->first()->pivot;

        // article_count TIDAK di-reset karena oldId === newId (skip block detach/reset)
        $this->assertEquals(20, $pivot->article_count);

        // job tetap didispatch walau id sama, sesuai kode aslinya
        Queue::assertPushed(GenerateKeywordEmbeddingJob::class);
    }

    public function test_update_keyword_throws_when_not_owner(): void
    {
        Queue::fake();

        $owner    = User::factory()->create();
        $intruder = User::factory()->create();
        $plan     = ResearchPlan::factory()->create(['user_id' => $owner->id]);
        $keyword  = Keyword::factory()->create();

        $this->expectException(AuthorizationException::class);

        $this->service->updateKeywordForResearchPlan(
            $intruder->id,
            $plan->research_plan_id,
            $keyword->id,
            'anything'
        );
    }

    // ---------------------------------------------------------
    // detachKeywordFromResearchPlan
    // ---------------------------------------------------------

    public function test_detach_keyword_removes_pivot_and_filtered_articles(): void
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);
        $keyword = Keyword::factory()->create();

        $plan->keywords()->attach($keyword->id, [
            'article_count' => 1, 'duplicate_count' => 0,
            'unmatched_tier_count' => 0, 'missing_doi_count' => 0,
            'out_of_year_range_count' => 0,
        ]);

        $filtered = FilteredArticle::factory()->create([
            'research_plan_id' => $plan->research_plan_id,
            'keyword_id'       => $keyword->id,
        ]);

        $this->service->detachKeywordFromResearchPlan($user->id, $plan->research_plan_id, $keyword->id);

        $this->assertFalse($plan->keywords()->where('keyword_id', $keyword->id)->exists());
        $this->assertDatabaseMissing('filtered_articles', ['id' => $filtered->id]);
        $this->assertEquals(0, $plan->fresh()->keyword_count);
    }

    public function test_detach_keyword_throws_404_when_keyword_not_exists(): void
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class);

        $this->service->detachKeywordFromResearchPlan($user->id, $plan->research_plan_id, 999999);
    }

    public function test_detach_keyword_throws_when_not_owner(): void
    {
        $owner    = User::factory()->create();
        $intruder = User::factory()->create();
        $plan     = ResearchPlan::factory()->create(['user_id' => $owner->id]);
        $keyword  = Keyword::factory()->create();

        $plan->keywords()->attach($keyword->id);

        $this->expectException(AuthorizationException::class);

        $this->service->detachKeywordFromResearchPlan($intruder->id, $plan->research_plan_id, $keyword->id);
    }
}
