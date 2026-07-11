<?php

namespace App\Http\Interfaces;

use App\Models\ResearchPlan;

interface ResearchPlanServiceInterface
{
    public function listForUser($user);
    
    public function getById(int $id): ?ResearchPlan;

    public function createForUser($user, array $data): ResearchPlan;

    public function update(ResearchPlan $researchPlan, $user, array $data): ResearchPlan;

    public function delete(ResearchPlan $researchPlan, $user): bool;
}
