<?php

namespace App\Http\Interfaces;

use App\Models\ResearchPlan;

interface ResearchPlanRepositoryInterface
{
    public function getAllForUser($user);

    public function getById(int $id): ?ResearchPlan;

    public function createForUser($user, array $data): ResearchPlan;

    public function update(ResearchPlan $researchPlan, array $data): bool;

    public function delete(ResearchPlan $researchPlan): bool;
}
