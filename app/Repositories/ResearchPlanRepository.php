<?php

namespace App\Repositories;

use App\Models\ResearchPlan;
use App\Http\Interfaces\ResearchPlanRepositoryInterface;

class ResearchPlanRepository implements ResearchPlanRepositoryInterface
{
    public function getAllForUser($user)
    {
        return $user->researchPlans()->latest()->get();
    }

    public function createForUser($user, array $data): ResearchPlan
    {
        return $user->researchPlans()->create($data);
    }

    public function update(ResearchPlan $researchPlan, array $data): bool
    {
        return $researchPlan->update($data);
    }

    public function delete(ResearchPlan $researchPlan): bool
    {
        return $researchPlan->delete();
    }
}
