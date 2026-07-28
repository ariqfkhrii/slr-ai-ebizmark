<?php

namespace Tests\Feature;

use App\Jobs\GenerateKeywordEmbeddingJob;
use App\Models\Keyword;
use App\Models\ResearchPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ResearchPlanKeywordControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function createResearchPlanForUser(User $user): ResearchPlan
    {
        return ResearchPlan::factory()->create([
            'user_id' => $user->id,
        ]);
    }

    // index

    public function test_index_returns_keywords_for_owned_research_plan(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $keyword = Keyword::factory()->create(['keyword' => 'machine learning']);

        $researchPlan->keywords()->attach($keyword->id, [
            'article_count'           => 10,
            'duplicate_count'         => 2,
            'unmatched_tier_count'    => 1,
            'missing_doi_count'       => 0,
            'out_of_year_range_count' => 1,
        ]);

        $response = $this->actingAs($user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/keywords");

        $response->assertOk();
        $response->assertJsonFragment([
            'id'                      => $keyword->id,
            'name'                    => 'machine learning',
            'article_count'           => 10,
            'duplicate_count'         => 2,
            'unmatched_tier_count'    => 1,
            'missing_doi_count'       => 0,
            'out_of_year_range_count' => 1,
        ]);
    }

    public function test_index_returns_empty_collection_when_research_plan_has_no_keywords(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/keywords");

        $response->assertOk();
        $response->assertJson([]);
    }

    public function test_index_forbids_access_when_user_does_not_own_research_plan(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($owner);

        $response = $this->actingAs($otherUser)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/keywords");

        $response->assertForbidden();
    }

    public function test_index_requires_authentication(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->getJson("/research-plans/{$researchPlan->research_plan_id}/keywords");

        $response->assertUnauthorized();
    }

    public function test_index_forbids_access_when_research_plan_does_not_exist(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/research-plans/999999/keywords');

        $response->assertForbidden();
    }

    public function test_index_returns_all_attached_keywords(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $firstKeyword = Keyword::factory()->create(['keyword' => 'first keyword']);
        $secondKeyword = Keyword::factory()->create(['keyword' => 'second keyword']);

        $researchPlan->keywords()->attach($firstKeyword->id);
        $researchPlan->keywords()->attach($secondKeyword->id);

        $response = $this->actingAs($user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/keywords");

        $response->assertOk();
        $response->assertJsonCount(2);
        $response->assertJsonFragment(['name' => 'first keyword']);
        $response->assertJsonFragment(['name' => 'second keyword']);
    }

    // store

    public function test_store_attaches_new_keyword_to_research_plan(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => 'deep learning',
            ]);

        $response->assertCreated();
        $response->assertJsonFragment(['keyword' => 'deep learning']);

        $this->assertDatabaseHas('keywords', ['keyword' => 'deep learning']);

        $keywordId = Keyword::where('keyword', 'deep learning')->first()->id;
        $this->assertDatabaseHas('research_plan_keyword', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $keywordId,
        ]);

        $this->assertEquals(1, $researchPlan->fresh()->keyword_count);

        Queue::assertPushed(GenerateKeywordEmbeddingJob::class);
    }

    public function test_store_reuses_existing_keyword_with_same_name(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $existingKeyword = Keyword::factory()->create(['keyword' => 'natural language processing']);

        $response = $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => 'natural language processing',
            ]);

        $response->assertCreated();
        $this->assertEquals(1, Keyword::where('keyword', 'natural language processing')->count());
        $response->assertJsonFragment(['id' => $existingKeyword->id]);
    }

    public function test_store_trims_whitespace_around_semicolon_separated_keywords(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => '  artificial intelligence  ;  neural network  ',
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('keywords', [
            'keyword' => 'artificial intelligence;neural network',
        ]);
    }

    public function test_store_fails_when_keyword_is_missing(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['keyword']);
    }

    public function test_store_fails_when_keyword_contains_invalid_characters(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => 'invalid@keyword#',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['keyword']);
    }

    public function test_store_fails_when_keyword_exceeds_max_length(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => str_repeat('a', 256),
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['keyword']);
    }

    public function test_store_forbids_access_when_user_does_not_own_research_plan(): void
    {
        Queue::fake();

        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($owner);

        $response = $this->actingAs($otherUser)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => 'blockchain',
            ]);

        $response->assertForbidden();
    }

    public function test_store_allows_keyword_with_exclamation_prefix(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => '!excluded keyword',
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('keywords', ['keyword' => '!excluded keyword']);
    }

    public function test_store_does_not_duplicate_pivot_row_when_keyword_already_attached(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => 'repeated keyword',
            ])
            ->assertCreated();

        $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => 'repeated keyword',
            ])
            ->assertCreated();

        $keywordId = Keyword::where('keyword', 'repeated keyword')->first()->id;

        $this->assertEquals(1, DB::table('research_plan_keyword')
            ->where('research_plan_id', $researchPlan->research_plan_id)
            ->where('keyword_id', $keywordId)
            ->count());

        $this->assertEquals(1, $researchPlan->fresh()->keyword_count);
    }

    public function test_store_dispatches_embedding_job_with_correct_keyword_id(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $this->actingAs($user)
            ->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'keyword' => 'quantum computing',
            ])
            ->assertCreated();

        $keyword = Keyword::where('keyword', 'quantum computing')->first();

        Queue::assertPushed(GenerateKeywordEmbeddingJob::class, function ($job) use ($keyword) {
            return $job->keywordId === $keyword->id;
        });
    }

    public function test_store_forbids_access_when_research_plan_does_not_exist(): void
    {
        Queue::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/research-plans/999999/keywords', [
                'keyword' => 'nonexistent plan keyword',
            ]);

        $response->assertForbidden();
    }

    public function test_store_requires_authentication(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->postJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
            'keyword' => 'unauthenticated keyword',
        ]);

        $response->assertUnauthorized();
    }

    // update

    public function test_update_replaces_keyword_and_resets_pivot_counts(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $oldKeyword = Keyword::factory()->create(['keyword' => 'old keyword']);

        $researchPlan->keywords()->attach($oldKeyword->id, [
            'article_count'           => 5,
            'duplicate_count'         => 1,
            'unmatched_tier_count'    => 1,
            'missing_doi_count'       => 1,
            'out_of_year_range_count' => 1,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $oldKeyword->id,
                'new_keyword'    => 'new keyword',
            ]);

        $response->assertOk();
        $response->assertJsonFragment(['keyword' => 'new keyword']);

        $newKeywordId = Keyword::where('keyword', 'new keyword')->first()->id;

        $this->assertDatabaseMissing('research_plan_keyword', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $oldKeyword->id,
        ]);

        $this->assertDatabaseHas('research_plan_keyword', [
            'research_plan_id'        => $researchPlan->research_plan_id,
            'keyword_id'              => $newKeywordId,
            'article_count'           => 0,
            'duplicate_count'         => 0,
            'unmatched_tier_count'    => 0,
            'missing_doi_count'       => 0,
            'out_of_year_range_count' => 0,
        ]);

        Queue::assertPushed(GenerateKeywordEmbeddingJob::class);
    }

    public function test_update_deletes_filtered_articles_tied_to_old_keyword(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $oldKeyword = Keyword::factory()->create(['keyword' => 'old keyword']);

        $researchPlan->keywords()->attach($oldKeyword->id);

        \App\Models\FilteredArticle::factory()->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $oldKeyword->id,
        ]);

        $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $oldKeyword->id,
                'new_keyword'    => 'replacement keyword',
            ])
            ->assertOk();

        $this->assertDatabaseMissing('filtered_articles', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $oldKeyword->id,
        ]);
    }

    public function test_update_keeps_pivot_untouched_when_new_keyword_resolves_to_same_id(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $keyword = Keyword::factory()->create(['keyword' => 'same keyword']);

        $researchPlan->keywords()->attach($keyword->id, [
            'article_count' => 7,
        ]);

        $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $keyword->id,
                'new_keyword'    => 'same keyword',
            ])
            ->assertOk();

        $this->assertDatabaseHas('research_plan_keyword', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $keyword->id,
            'article_count'    => 7,
        ]);
    }

    public function test_update_fails_when_old_keyword_id_does_not_exist(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => 999999,
                'new_keyword'    => 'new keyword',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['old_keyword_id']);
    }

    public function test_update_fails_when_new_keyword_is_missing(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $keyword = Keyword::factory()->create();

        $response = $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $keyword->id,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['new_keyword']);
    }

    public function test_update_forbids_access_when_user_does_not_own_research_plan(): void
    {
        Queue::fake();

        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($owner);
        $keyword = Keyword::factory()->create();

        $researchPlan->keywords()->attach($keyword->id);

        $response = $this->actingAs($otherUser)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $keyword->id,
                'new_keyword'    => 'hijacked keyword',
            ]);

        $response->assertForbidden();
    }

    public function test_update_does_not_affect_pivot_of_another_research_plan_sharing_the_old_keyword_id(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $planA = $this->createResearchPlanForUser($user);
        $planB = $this->createResearchPlanForUser($user);
        $sharedOldKeyword = Keyword::factory()->create(['keyword' => 'shared old keyword']);

        $planB->keywords()->attach($sharedOldKeyword->id, ['article_count' => 3]);

        $this->actingAs($user)
            ->putJson("/research-plans/{$planA->research_plan_id}/keywords", [
                'old_keyword_id' => $sharedOldKeyword->id,
                'new_keyword'    => 'renamed on plan a',
            ])
            ->assertOk();

        $this->assertDatabaseHas('research_plan_keyword', [
            'research_plan_id' => $planB->research_plan_id,
            'keyword_id'       => $sharedOldKeyword->id,
            'article_count'    => 3,
        ]);
    }

    public function test_update_fails_when_new_keyword_exceeds_max_length(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $keyword = Keyword::factory()->create();

        $researchPlan->keywords()->attach($keyword->id);

        $response = $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $keyword->id,
                'new_keyword'    => str_repeat('a', 256),
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['new_keyword']);
    }

    public function test_update_fails_when_new_keyword_contains_invalid_characters(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $keyword = Keyword::factory()->create();

        $researchPlan->keywords()->attach($keyword->id);

        $response = $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $keyword->id,
                'new_keyword'    => 'invalid@keyword#',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['new_keyword']);
    }

    public function test_update_keeps_keyword_count_unchanged_after_replacing_keyword(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $oldKeyword = Keyword::factory()->create();

        $researchPlan->keywords()->attach($oldKeyword->id);
        $researchPlan->update(['keyword_count' => 1]);

        $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $oldKeyword->id,
                'new_keyword'    => 'replacement keyword',
            ])
            ->assertOk();

        $this->assertEquals(1, $researchPlan->fresh()->keyword_count);
    }

    public function test_update_requires_authentication(): void
    {
        $researchPlan = ResearchPlan::factory()->create();
        $keyword = Keyword::factory()->create();

        $response = $this->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
            'old_keyword_id' => $keyword->id,
            'new_keyword'    => 'unauthenticated update',
        ]);

        $response->assertUnauthorized();
    }

    public function test_update_resets_existing_pivot_counts_when_new_keyword_matches_another_already_attached_keyword(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $keywordA = Keyword::factory()->create(['keyword' => 'existing keyword a']);
        $keywordB = Keyword::factory()->create(['keyword' => 'existing keyword b']);

        $researchPlan->keywords()->attach($keywordA->id, [
            'article_count'           => 20,
            'duplicate_count'         => 5,
            'unmatched_tier_count'    => 2,
            'missing_doi_count'       => 1,
            'out_of_year_range_count' => 3,
        ]);
        $researchPlan->keywords()->attach($keywordB->id);

        $this->actingAs($user)
            ->putJson("/research-plans/{$researchPlan->research_plan_id}/keywords", [
                'old_keyword_id' => $keywordB->id,
                'new_keyword'    => 'existing keyword a',
            ])
            ->assertOk();

        $this->assertDatabaseHas('research_plan_keyword', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $keywordA->id,
            'article_count'    => 20,
            'duplicate_count'  => 5,
        ]);
    }

    // destroy

    public function test_destroy_detaches_keyword_from_research_plan(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $keyword = Keyword::factory()->create();

        $researchPlan->keywords()->attach($keyword->id);
        $researchPlan->update(['keyword_count' => 1]);

        $response = $this->actingAs($user)
            ->deleteJson("/research-plans/{$researchPlan->research_plan_id}/keywords/{$keyword->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('research_plan_keyword', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $keyword->id,
        ]);

        $this->assertEquals(0, $researchPlan->fresh()->keyword_count);
    }

    public function test_destroy_deletes_filtered_articles_tied_to_the_keyword(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $keyword = Keyword::factory()->create();

        $researchPlan->keywords()->attach($keyword->id);

        \App\Models\FilteredArticle::factory()->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $keyword->id,
        ]);

        $this->actingAs($user)
            ->deleteJson("/research-plans/{$researchPlan->research_plan_id}/keywords/{$keyword->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('filtered_articles', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id'       => $keyword->id,
        ]);
    }

    public function test_destroy_returns_not_found_when_keyword_does_not_exist(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);

        $response = $this->actingAs($user)
            ->deleteJson("/research-plans/{$researchPlan->research_plan_id}/keywords/999999");

        $response->assertNotFound();
    }

    public function test_destroy_forbids_access_when_user_does_not_own_research_plan(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($owner);
        $keyword = Keyword::factory()->create();

        $researchPlan->keywords()->attach($keyword->id);

        $response = $this->actingAs($otherUser)
            ->deleteJson("/research-plans/{$researchPlan->research_plan_id}/keywords/{$keyword->id}");

        $response->assertForbidden();
    }

    public function test_destroy_succeeds_even_when_keyword_is_not_attached_to_research_plan(): void
    {
        $user = User::factory()->create();
        $researchPlan = $this->createResearchPlanForUser($user);
        $keyword = Keyword::factory()->create();

        $researchPlan->update(['keyword_count' => 0]);

        $response = $this->actingAs($user)
            ->deleteJson("/research-plans/{$researchPlan->research_plan_id}/keywords/{$keyword->id}");

        $response->assertNoContent();
        $this->assertEquals(0, $researchPlan->fresh()->keyword_count);
    }

    public function test_destroy_forbids_access_when_research_plan_does_not_exist(): void
    {
        $user = User::factory()->create();
        $keyword = Keyword::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/research-plans/999999/keywords/{$keyword->id}");

        $response->assertForbidden();
    }

    public function test_destroy_requires_authentication(): void
    {
        $researchPlan = ResearchPlan::factory()->create();
        $keyword = Keyword::factory()->create();

        $researchPlan->keywords()->attach($keyword->id);

        $response = $this->deleteJson("/research-plans/{$researchPlan->research_plan_id}/keywords/{$keyword->id}");

        $response->assertUnauthorized();
    }
}
