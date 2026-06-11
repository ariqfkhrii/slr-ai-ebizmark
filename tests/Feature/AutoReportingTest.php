<?php

namespace Tests\Feature;

use App\Models\ResearchPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutoReportingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_authenticated_user_can_list_auto_reporting_items_and_seed_defaults(): void
    {
        $user = User::factory()->create();
        $researchPlan = $user->researchPlans()->create([
            'title' => 'Auto Report Test',
            'source_database' => 'scopus',
        ]);

        $response = $this->actingAs($user)
            ->get(route('auto-reporting.index', $researchPlan->research_plan_id));

        $response->assertOk();
        $this->assertDatabaseCount('auto_reportings', 24);
        $this->assertDatabaseHas('auto_reportings', [
            'research_plan_id' => $researchPlan->research_plan_id,
            'chapter' => 'Introduction',
            'title' => 'Rationale',
        ]);
    }
}
