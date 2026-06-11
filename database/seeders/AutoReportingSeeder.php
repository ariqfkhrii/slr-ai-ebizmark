<?php

namespace Database\Seeders;

use App\Models\ResearchPlan;
use App\Services\AutoReportingService;
use Illuminate\Database\Seeder;

class AutoReportingSeeder extends Seeder
{
    public function __construct(protected AutoReportingService $service)
    {
    }

    public function run(?int $researchPlanId = null): void
    {
        $researchPlan = $researchPlanId
            ? ResearchPlan::query()->findOrFail($researchPlanId)
            : ResearchPlan::query()->firstOrFail();

        $this->service->ensureDefaultItems($researchPlan->research_plan_id);
    }
}
