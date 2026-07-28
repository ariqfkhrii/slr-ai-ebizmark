<?php

namespace Tests\Feature;

use App\Models\FilteredArticle;
use App\Models\Keyword;
use App\Models\RawArticle;
use App\Models\ResearchPlan;
use App\Models\ResearchPlanKeyword;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class PurificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
    }

    // index

    public function test_index_returns_paginated_filtered_articles_for_valid_plan()
    {
        $researchPlan = ResearchPlan::factory()->create();
        $rawArticle = RawArticle::factory()->create();
        FilteredArticle::factory()->count(3)->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'raw_article_id' => $rawArticle->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/purification");

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    ['filtered_article_id', 'included', 'similarity_score', 'raw_article'],
                ],
            ]);
    }

    public function test_index_validates_size_parameter_exceeds_maximum()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/purification?size=101");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['size']);
    }

    public function test_index_validates_sort_parameter_invalid_value()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/purification?sort=invalid");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sort']);
    }

    public function test_index_uses_default_page_size_when_size_is_not_provided()
    {
        $researchPlan = ResearchPlan::factory()->create();
        $rawArticle = RawArticle::factory()->create();
        FilteredArticle::factory()->count(15)->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'raw_article_id' => $rawArticle->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/purification");

        $response->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('per_page', 10)
            ->assertJsonPath('total', 15);
    }

    public function test_index_returns_empty_data_when_plan_has_no_articles()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/purification");

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    // calculateRelevance

    public function test_calculate_relevance_dispatches_batch_and_returns_batch_id()
    {
        Bus::fake();

        $researchPlan = ResearchPlan::factory()->create();
        $keyword = Keyword::factory()->create([
            'embedding' => json_encode([0.1, 0.2, 0.3]),
        ]);
        ResearchPlanKeyword::factory()->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);
        $rawArticle = RawArticle::factory()->create([
            'embedding' => json_encode([0.1, 0.2, 0.3]),
        ]);
        FilteredArticle::factory()->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'raw_article_id' => $rawArticle->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/purification/{$researchPlan->research_plan_id}/calculate-relevance");

        $response->assertOk()
            ->assertJsonStructure(['message', 'batch_id']);

        Bus::assertBatched(function ($batch) use ($researchPlan) {
            return $batch->name === 'Ranking Plan: '.$researchPlan->research_plan_id;
        });
    }

    public function test_calculate_relevance_fails_when_research_plan_has_no_keywords()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson("/purification/{$researchPlan->research_plan_id}/calculate-relevance");

        $response->assertStatus(400);
    }

    public function test_calculate_relevance_fails_when_keyword_embedding_missing()
    {
        $researchPlan = ResearchPlan::factory()->create();
        $keyword = Keyword::factory()->create([
            'embedding' => null,
        ]);
        ResearchPlanKeyword::factory()->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/purification/{$researchPlan->research_plan_id}/calculate-relevance");

        $response->assertStatus(400);
    }

    public function test_calculate_relevance_fails_when_article_embedding_missing()
    {
        $researchPlan = ResearchPlan::factory()->create();
        $keyword = Keyword::factory()->create([
            'embedding' => json_encode([0.1, 0.2, 0.3]),
        ]);
        ResearchPlanKeyword::factory()->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);
        $rawArticle = RawArticle::factory()->create([
            'embedding' => null,
        ]);
        FilteredArticle::factory()->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'raw_article_id' => $rawArticle->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/purification/{$researchPlan->research_plan_id}/calculate-relevance");

        $response->assertStatus(400);
    }

    public function test_calculate_relevance_splits_jobs_into_multiple_chunks_when_articles_exceed_chunk_size()
    {
        Bus::fake();

        $researchPlan = ResearchPlan::factory()->create();
        $keyword = Keyword::factory()->create([
            'embedding' => json_encode([0.1, 0.2, 0.3]),
        ]);
        ResearchPlanKeyword::factory()->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'keyword_id' => $keyword->id,
        ]);
        $rawArticle = RawArticle::factory()->create([
            'embedding' => json_encode([0.1, 0.2, 0.3]),
        ]);
        FilteredArticle::factory()->count(501)->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'raw_article_id' => $rawArticle->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/purification/{$researchPlan->research_plan_id}/calculate-relevance");

        $response->assertOk();

        Bus::assertBatched(function ($batch) {
            return $batch->jobs->count() === 2;
        });
    }

    // getAll

    public function test_get_all_returns_all_filtered_articles_for_plan()
    {
        $researchPlan = ResearchPlan::factory()->create();
        $rawArticle = RawArticle::factory()->create();
        FilteredArticle::factory()->count(5)->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'raw_article_id' => $rawArticle->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/purification/all");

        $response->assertOk()
            ->assertJsonCount(5);
    }

    public function test_get_all_returns_empty_array_when_plan_has_no_articles()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/research-plans/{$researchPlan->research_plan_id}/purification/all");

        $response->assertOk()
            ->assertJsonCount(0);
    }

    // update

    public function test_update_changes_included_status_of_filtered_article()
    {
        $filteredArticle = FilteredArticle::factory()->create([
            'included' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-status', [
                'filtered_article_id' => $filteredArticle->id,
                'included' => true,
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Status included berhasil diupdate.']);

        $this->assertDatabaseHas('filtered_articles', [
            'id' => $filteredArticle->id,
            'included' => true,
        ]);
    }

    public function test_update_fails_when_filtered_article_id_is_missing()
    {
        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-status', [
                'included' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['filtered_article_id']);
    }

    public function test_update_fails_when_filtered_article_id_does_not_exist()
    {
        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-status', [
                'filtered_article_id' => 999999,
                'included' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['filtered_article_id']);
    }

    public function test_update_fails_when_included_is_not_boolean()
    {
        $filteredArticle = FilteredArticle::factory()->create();

        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-status', [
                'filtered_article_id' => $filteredArticle->id,
                'included' => 'not-a-boolean',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['included']);
    }

    // updateAll

    public function test_update_all_changes_included_status_for_all_articles_in_plan()
    {
        $researchPlan = ResearchPlan::factory()->create();
        FilteredArticle::factory()->count(4)->create([
            'research_plan_id' => $researchPlan->research_plan_id,
            'included' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-all-status', [
                'research_plan_id' => $researchPlan->research_plan_id,
                'included' => true,
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Status included seluruh artikel berhasil diupdate.']);

        $this->assertDatabaseMissing('filtered_articles', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'included' => false,
        ]);
    }

    public function test_update_all_succeeds_when_research_plan_has_no_filtered_articles()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-all-status', [
                'research_plan_id' => $researchPlan->research_plan_id,
                'included' => true,
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Status included seluruh artikel berhasil diupdate.']);
    }

    public function test_update_all_does_not_affect_articles_in_other_research_plans()
    {
        $researchPlanA = ResearchPlan::factory()->create();
        $researchPlanB = ResearchPlan::factory()->create();

        FilteredArticle::factory()->count(2)->create([
            'research_plan_id' => $researchPlanA->research_plan_id,
            'included' => false,
        ]);
        $articlesB = FilteredArticle::factory()->count(2)->create([
            'research_plan_id' => $researchPlanB->research_plan_id,
            'included' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-all-status', [
                'research_plan_id' => $researchPlanA->research_plan_id,
                'included' => true,
            ]);

        $response->assertOk();

        foreach ($articlesB as $articleB) {
            $this->assertDatabaseHas('filtered_articles', [
                'id' => $articleB->id,
                'included' => false,
            ]);
        }
    }

    public function test_update_all_fails_when_research_plan_id_does_not_exist()
    {
        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-all-status', [
                'research_plan_id' => 999999,
                'included' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['research_plan_id']);
    }

    public function test_update_all_fails_when_included_is_missing()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->putJson('/purification/update-all-status', [
                'research_plan_id' => $researchPlan->research_plan_id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['included']);
    }

    // bulkUpdate

    public function test_bulk_update_changes_included_status_for_multiple_articles()
    {
        $filteredArticles = FilteredArticle::factory()->count(3)->create([
            'included' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/purification/bulk-update', [
                'article_ids' => $filteredArticles->pluck('id')->toArray(),
                'included' => true,
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Status artikel berhasil diperbarui.']);

        foreach ($filteredArticles as $filteredArticle) {
            $this->assertDatabaseHas('filtered_articles', [
                'id' => $filteredArticle->id,
                'included' => true,
            ]);
        }
    }

    public function test_bulk_update_fails_when_article_ids_is_empty()
    {
        $response = $this->actingAs($this->user)
            ->putJson('/purification/bulk-update', [
                'article_ids' => [],
                'included' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['article_ids']);
    }

    public function test_bulk_update_fails_when_article_ids_contains_nonexistent_id()
    {
        $filteredArticle = FilteredArticle::factory()->create();

        $response = $this->actingAs($this->user)
            ->putJson('/purification/bulk-update', [
                'article_ids' => [$filteredArticle->id, 999999],
                'included' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['article_ids.1']);
    }

    public function test_bulk_update_fails_when_included_is_missing()
    {
        $filteredArticle = FilteredArticle::factory()->create();

        $response = $this->actingAs($this->user)
            ->putJson('/purification/bulk-update', [
                'article_ids' => [$filteredArticle->id],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['included']);
    }

    // guest access guard

    public function test_index_requires_authentication()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->getJson("/research-plans/{$researchPlan->research_plan_id}/purification");

        $response->assertStatus(401);
    }

    public function test_calculate_relevance_requires_authentication()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->postJson("/purification/{$researchPlan->research_plan_id}/calculate-relevance");

        $response->assertStatus(401);
    }

    public function test_get_all_requires_authentication()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->getJson("/research-plans/{$researchPlan->research_plan_id}/purification/all");

        $response->assertStatus(401);
    }

    public function test_update_requires_authentication()
    {
        $filteredArticle = FilteredArticle::factory()->create();

        $response = $this->putJson('/purification/update-status', [
            'filtered_article_id' => $filteredArticle->id,
            'included' => true,
        ]);

        $response->assertStatus(401);
    }

    public function test_update_all_requires_authentication()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->putJson('/purification/update-all-status', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'included' => true,
        ]);

        $response->assertStatus(401);
    }

    public function test_bulk_update_requires_authentication()
    {
        $filteredArticle = FilteredArticle::factory()->create();

        $response = $this->putJson('/purification/bulk-update', [
            'article_ids' => [$filteredArticle->id],
            'included' => true,
        ]);

        $response->assertStatus(401);
    }
}