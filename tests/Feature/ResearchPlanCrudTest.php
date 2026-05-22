<?php

namespace Tests\Feature;

use App\Models\ResearchPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResearchPlanCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_authenticated_user_can_view_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_authenticated_user_can_create_research_plan(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('dashboard'))
            ->post(route('research-plans.store'), [
                'title' => 'Rencana Riset AI',
            ])
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success', 'Research Plan berhasil dibuat');

        $this->assertDatabaseHas('research_plans', [
            'title' => 'Rencana Riset AI',
            'user_id' => $user->id,
        ]);
    }

    public function test_authenticated_user_can_update_own_research_plan(): void
    {
        $user = User::factory()->create();
        $researchPlan = $user->researchPlans()->create([
            'title' => 'Judul Lama',
        ]);

        $this->actingAs($user)
            ->from(route('dashboard'))
            ->put(route('research-plans.update', $researchPlan), [
                'title' => 'Judul Baru',
            ])
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success', 'Research Plan berhasil diupdate');

        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'title' => 'Judul Baru',
        ]);
    }

    public function test_authenticated_user_can_delete_own_research_plan(): void
    {
        $user = User::factory()->create();
        $researchPlan = $user->researchPlans()->create([
            'title' => 'Hapus Saya',
        ]);

        $this->actingAs($user)
            ->from(route('dashboard'))
            ->delete(route('research-plans.destroy', $researchPlan))
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success', 'Research Plan berhasil dihapus');

        $this->assertDatabaseMissing('research_plans', [
            'research_plan_id' => $researchPlan->research_plan_id,
        ]);
    }

    public function test_user_cannot_update_research_plan_belonging_to_another_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $researchPlan = $owner->researchPlans()->create([
            'title' => 'Milik Owner',
        ]);

        $this->actingAs($otherUser)
            ->from(route('dashboard'))
            ->put(route('research-plans.update', $researchPlan), [
                'title' => 'Percobaan Ubah',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('research_plans', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'title' => 'Milik Owner',
        ]);
    }
}
