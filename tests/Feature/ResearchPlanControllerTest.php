<?php

namespace Tests\Feature;

use App\Models\ResearchPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResearchPlanControllerTest extends TestCase
{
    use RefreshDatabase;

    // index

    public function test_authenticated_user_can_view_dashboard_with_their_research_plans()
    {
        $user = User::factory()->create();
        ResearchPlan::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('researchPlans', 3)
        );
    }

    public function test_guest_cannot_access_dashboard()
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_dashboard_does_not_show_research_plans_belonging_to_other_users()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        ResearchPlan::factory()->count(2)->create(['user_id' => $user->id]);
        ResearchPlan::factory()->count(5)->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('researchPlans', 2)
        );
    }

    // getById

    public function test_authenticated_user_can_retrieve_research_plan_by_id()
    {
        $user = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->getJson(route('research-plans.getById', $researchPlan->research_plan_id));

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'message' => 'Research plan retrieved successfully',
        ]);
        $response->assertJsonPath('data.research_plan_id', $researchPlan->research_plan_id);
    }

    public function test_guest_cannot_retrieve_research_plan_by_id()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->getJson(route('research-plans.getById', $researchPlan->research_plan_id));

        $response->assertUnauthorized();
    }

    public function test_user_cannot_retrieve_a_research_plan_belonging_to_another_user()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser)->getJson(route('research-plans.getById', $researchPlan->research_plan_id));

        $response->assertForbidden();
    }

    // store

    public function test_authenticated_user_can_create_a_research_plan()
    {
        $user = User::factory()->create();

        $payload = [
            'title' => 'Systematic Literature Review on Machine Learning',
            'source_database' => 'scopus',
        ];

        $response = $this->actingAs($user)->post(route('research-plans.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Research Plan berhasil dibuat');
        $this->assertDatabaseHas('research_plans', [
            'title' => $payload['title'],
            'source_database' => $payload['source_database'],
            'user_id' => $user->id,
        ]);
    }

    public function test_creating_a_research_plan_requires_a_title()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('research-plans.store'), [
            'source_database' => 'scopus',
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_guest_cannot_create_a_research_plan()
    {
        $response = $this->post(route('research-plans.store'), [
            'title' => 'Guest Research Plan',
        ]);

        $response->assertRedirect(route('login'));
    }

    // update

    public function test_owner_can_update_their_research_plan()
    {
        $user = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->put(route('research-plans.update', $researchPlan), [
            'title' => 'Updated Research Plan Title',
            'source_database' => 'pubmed',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Research Plan berhasil diupdate');
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'title' => 'Updated Research Plan Title',
            'source_database' => 'pubmed',
        ]);
    }

    public function test_non_owner_cannot_update_another_users_research_plan()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser)->put(route('research-plans.update', $researchPlan), [
            'title' => 'Malicious Update',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'title' => $researchPlan->title,
        ]);
    }

    public function test_guest_cannot_update_a_research_plan()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->put(route('research-plans.update', $researchPlan), [
            'title' => 'Guest Update',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_updating_a_nonexistent_research_plan_returns_404()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put(route('research-plans.update', ['researchPlan' => 999999]), [
            'title' => 'Updated Title',
        ]);

        $response->assertNotFound();
    }

    // destroy

    public function test_owner_can_delete_their_research_plan()
    {
        $user = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete(route('research-plans.destroy', $researchPlan));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Research Plan berhasil dihapus');
        $this->assertDatabaseMissing('research_plans', [
            'research_plan_id' => $researchPlan->research_plan_id,
        ]);
    }

    public function test_non_owner_cannot_delete_another_users_research_plan()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser)->delete(route('research-plans.destroy', $researchPlan));

        $response->assertForbidden();
        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $researchPlan->research_plan_id,
        ]);
    }

    public function test_guest_cannot_delete_a_research_plan()
    {
        $researchPlan = ResearchPlan::factory()->create();

        $response = $this->delete(route('research-plans.destroy', $researchPlan));

        $response->assertRedirect(route('login'));
    }

    public function test_deleting_a_nonexistent_research_plan_returns_404()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->delete(route('research-plans.destroy', ['researchPlan' => 999999]));

        $response->assertNotFound();
    }

    // spar

    public function test_authenticated_user_can_view_spar_page_for_their_research_plan()
    {
        $user = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('spar', ['research_plan_id' => $researchPlan->research_plan_id]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('spar/index')
            ->where('researchPlanId', $researchPlan->research_plan_id)
        );
    }

    public function test_spar_defaults_to_the_users_latest_research_plan_when_no_id_is_given()
    {
        $user = User::factory()->create();
        ResearchPlan::factory()->create(['user_id' => $user->id, 'created_at' => now()->subDay()]);
        $latestPlan = ResearchPlan::factory()->create(['user_id' => $user->id, 'created_at' => now()]);

        $response = $this->actingAs($user)->get(route('spar'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('researchPlanId', $latestPlan->research_plan_id)
        );
    }

    public function test_spar_uses_the_explicitly_requested_research_plan_instead_of_the_latest_one()
    {
        $user = User::factory()->create();
        $olderPlan = ResearchPlan::factory()->create(['user_id' => $user->id, 'created_at' => now()->subDay()]);
        ResearchPlan::factory()->create(['user_id' => $user->id, 'created_at' => now()]);

        $response = $this->actingAs($user)->get(route('spar', ['research_plan_id' => $olderPlan->research_plan_id]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('researchPlanId', $olderPlan->research_plan_id)
        );
    }

    public function test_spar_shows_forbidden_page_when_research_plan_belongs_to_another_user()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = ResearchPlan::factory()->create(['user_id' => $owner->id]);
        ResearchPlan::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($otherUser)->get(route('spar', ['research_plan_id' => $researchPlan->research_plan_id]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('errors/forbidden-research-plan')
            ->where('requestedId', $researchPlan->research_plan_id)
        );
    }

    public function test_spar_returns_404_when_research_plan_does_not_exist()
    {
        $user = User::factory()->create();
        ResearchPlan::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('spar', ['research_plan_id' => 999999]));

        $response->assertNotFound();
    }

    public function test_guest_cannot_access_spar_page()
    {
        $response = $this->get(route('spar'));

        $response->assertRedirect(route('login'));
    }
}
