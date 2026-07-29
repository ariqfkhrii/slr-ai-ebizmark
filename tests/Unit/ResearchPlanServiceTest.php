<?php

namespace Tests\Unit;

use App\Models\ResearchPlan;
use App\Models\User;
use App\Repositories\ResearchPlanRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ResearchPlanServiceTest extends TestCase
{
    use RefreshDatabase;
 
    protected ResearchPlanRepository $repository;
 
    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new ResearchPlanRepository();
    }
 
    /** ================= getAllForUser ================= */
 
    public function test_get_all_for_user_returns_only_plans_belonging_to_that_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
 
        $ownPlans = ResearchPlan::factory()->count(3)->for($user)->create();
        ResearchPlan::factory()->count(2)->for($otherUser)->create();
 
        $result = $this->repository->getAllForUser($user);
 
        $this->assertCount(3, $result);
        $this->assertEqualsCanonicalizing(
            $ownPlans->pluck('research_plan_id')->all(),
            $result->pluck('research_plan_id')->all()
        );
    }
 
    public function test_get_all_for_user_returns_empty_collection_when_user_has_no_plans(): void
    {
        $user = User::factory()->create();
 
        $result = $this->repository->getAllForUser($user);
 
        $this->assertCount(0, $result);
        $this->assertTrue($result->isEmpty());
    }
 
    public function test_get_all_for_user_orders_results_by_latest_first(): void
    {
        $user = User::factory()->create();
 
        $older = ResearchPlan::factory()->for($user)->create([
            'created_at' => now()->subDays(2),
        ]);
        $newer = ResearchPlan::factory()->for($user)->create([
            'created_at' => now(),
        ]);
 
        $result = $this->repository->getAllForUser($user);
 
        $this->assertEquals($newer->research_plan_id, $result->first()->research_plan_id);
        $this->assertEquals($older->research_plan_id, $result->last()->research_plan_id);
    }
 
    public function test_get_all_for_user_does_not_mutate_database_state(): void
    {
        $user = User::factory()->create();
        ResearchPlan::factory()->count(2)->for($user)->create();
 
        $countBefore = ResearchPlan::count();
        $this->repository->getAllForUser($user);
        $countAfter = ResearchPlan::count();
 
        $this->assertEquals($countBefore, $countAfter);
    }
 
    /** ================= getById ================= */
 
    public function test_get_by_id_returns_the_correct_research_plan(): void
    {
        $plan = ResearchPlan::factory()->create();
 
        $result = $this->repository->getById($plan->research_plan_id);
 
        $this->assertNotNull($result);
        $this->assertTrue($result->is($plan));
    }
 
    public function test_get_by_id_returns_null_when_record_does_not_exist(): void
    {
        $result = $this->repository->getById(99999);
 
        $this->assertNull($result);
    }
 
    public function test_get_by_id_returns_null_for_non_positive_id(): void
    {
        $this->assertNull($this->repository->getById(0));
        $this->assertNull($this->repository->getById(-1));
    }
 
    /** ================= createForUser ================= */
 
    public function test_create_for_user_persists_new_research_plan_linked_to_user(): void
    {
        $user = User::factory()->create();
        $data = [
            'title' => 'Systematic Literature Review on LLM Pipelines',
            'source_database' => 'pubmed',
            'keyword_count' => 5,
        ];
 
        $result = $this->repository->createForUser($user, $data);
 
        $this->assertInstanceOf(ResearchPlan::class, $result);
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $result->research_plan_id,
            'user_id' => $user->id,
            'title' => $data['title'],
            'source_database' => 'pubmed',
            'keyword_count' => 5,
        ]);
    }
 
    public function test_create_for_user_associates_plan_with_correct_user_relation(): void
    {
        $user = User::factory()->create();
 
        $result = $this->repository->createForUser($user, ['title' => 'Test Plan']);
 
        $this->assertEquals($user->id, $result->user_id);
    }
 
    public function test_create_for_user_defaults_source_database_to_scopus_when_not_provided(): void
    {
        $user = User::factory()->create();
 
        $result = $this->repository->createForUser($user, ['title' => 'Tanpa Source Database']);
 
        // create() Eloquent gak nge-insert kolom yang gak dikasih, jadi default DB
        // ('scopus') baru kebaca kalau kita refresh dari database, bukan dari
        // attribute in-memory yang masih kosong.
        $result->refresh();
 
        $this->assertEquals('scopus', $result->source_database);
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $result->research_plan_id,
            'source_database' => 'scopus',
        ]);
    }
 
    public function test_create_for_user_defaults_keyword_count_to_zero_when_not_provided(): void
    {
        $user = User::factory()->create();
 
        $result = $this->repository->createForUser($user, ['title' => 'Tanpa Keyword Count']);
 
        $this->assertEquals(0, $result->keyword_count);
    }
 
    public function test_create_for_user_does_not_leak_data_to_other_users_plans(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
 
        $this->repository->createForUser($userA, ['title' => 'Punya A']);
 
        $resultB = $this->repository->getAllForUser($userB);
 
        $this->assertCount(0, $resultB);
    }
 
    /** ================= update ================= */
 
    public function test_update_modifies_research_plan_attributes_and_returns_true(): void
    {
        $plan = ResearchPlan::factory()->create(['title' => 'Old Title']);
 
        $result = $this->repository->update($plan, ['title' => 'New Title']);
 
        $this->assertTrue($result);
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $plan->research_plan_id,
            'title' => 'New Title',
        ]);
    }
 
    public function test_update_can_set_nullable_quantity_fields(): void
    {
        $plan = ResearchPlan::factory()->create([
            'scopus_quantity' => null,
            'pubmed_quantity' => null,
        ]);
 
        $result = $this->repository->update($plan, [
            'scopus_quantity' => 1200,
            'pubmed_quantity' => 340,
        ]);
 
        $this->assertTrue($result);
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $plan->research_plan_id,
            'scopus_quantity' => 1200,
            'pubmed_quantity' => 340,
        ]);
    }
 
    public function test_update_can_set_extraction_count_after_processing(): void
    {
        $plan = ResearchPlan::factory()->create(['extraction_count' => null]);
 
        $this->repository->update($plan, ['extraction_count' => 87]);
 
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $plan->research_plan_id,
            'extraction_count' => 87,
        ]);
    }
 
    public function test_update_does_not_affect_other_records(): void
    {
        $planA = ResearchPlan::factory()->create(['title' => 'Plan A']);
        $planB = ResearchPlan::factory()->create(['title' => 'Plan B']);
 
        $this->repository->update($planA, ['title' => 'Plan A Updated']);
 
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $planB->research_plan_id,
            'title' => 'Plan B',
        ]);
    }
 
    public function test_update_with_empty_data_keeps_original_values_and_returns_true(): void
    {
        $plan = ResearchPlan::factory()->create(['title' => 'Tetap Sama']);
 
        $result = $this->repository->update($plan, []);
 
        $this->assertTrue($result);
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $plan->research_plan_id,
            'title' => 'Tetap Sama',
        ]);
    }
 
    public function test_update_only_changes_specified_fields_not_others(): void
    {
        $plan = ResearchPlan::factory()->create([
            'title' => 'Judul Awal',
            'source_database' => 'scopus',
            'keyword_count' => 3,
        ]);
 
        $this->repository->update($plan, ['title' => 'Judul Baru']);
 
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $plan->research_plan_id,
            'title' => 'Judul Baru',
            'source_database' => 'scopus',
            'keyword_count' => 3,
        ]);
    }
 
    public function test_update_returns_false_when_underlying_save_fails(): void
    {
        // Pakai partial mock buat simulasiin skenario gagal save (mis. koneksi DB error).
        /** @var ResearchPlan&\Mockery\MockInterface $plan */
        $plan = Mockery::mock(ResearchPlan::class)->makePartial();
        $plan->shouldReceive('update')->once()->with(['title' => 'X'])->andReturn(false);
 
        $result = $this->repository->update($plan, ['title' => 'X']);
 
        $this->assertFalse($result);
    }
 
    /** ================= delete ================= */
 
    public function test_delete_removes_research_plan_from_database(): void
    {
        $plan = ResearchPlan::factory()->create();
 
        $result = $this->repository->delete($plan);
 
        $this->assertTrue($result);
        $this->assertDatabaseMissing('research_plans', ['research_plan_id' => $plan->research_plan_id]);
    }
 
    public function test_delete_does_not_remove_other_research_plans(): void
    {
        $planA = ResearchPlan::factory()->create();
        $planB = ResearchPlan::factory()->create();
 
        $this->repository->delete($planA);
 
        $this->assertDatabaseMissing('research_plans', ['research_plan_id' => $planA->research_plan_id]);
        $this->assertDatabaseHas('research_plans', ['research_plan_id' => $planB->research_plan_id]);
    }
 
    public function test_delete_also_removes_plan_when_owning_user_is_deleted_due_to_cascade(): void
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->for($user)->create();
 
        $user->delete();
 
        $this->assertDatabaseMissing('research_plans', ['research_plan_id' => $plan->research_plan_id]);
    }
 
    public function test_delete_returns_bool_type_not_truthy_value(): void
    {
        $plan = ResearchPlan::factory()->create();
 
        $result = $this->repository->delete($plan);
 
        $this->assertIsBool($result);
    }
 
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
