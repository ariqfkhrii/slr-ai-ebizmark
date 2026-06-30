<?php

namespace App\Services;

use App\Models\ResearchPlan;
use App\Http\Interfaces\ResearchPlanRepositoryInterface;
use App\Http\Interfaces\ResearchPlanServiceInterface;
use Illuminate\Auth\Access\AuthorizationException;

class ResearchPlanService implements ResearchPlanServiceInterface
{
    protected ResearchPlanRepositoryInterface $repository;

    public function __construct(ResearchPlanRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function listForUser($user)
    {
        return $this->repository->getAllForUser($user);
    }

    public function getById(int $id): ?ResearchPlan
    {
        return $this->repository->getById($id);
    }

    public function createForUser($user, array $data): ResearchPlan
    {
        return $this->repository->createForUser($user, $data);
    }

    public function update(ResearchPlan $researchPlan, $user, array $data): ResearchPlan
    {
        if ($researchPlan->user_id !== $user->id) {
            throw new AuthorizationException('Unauthorized.');
        }

        $this->repository->update($researchPlan, $data);

        return $researchPlan->fresh();
    }

    public function delete(ResearchPlan $researchPlan, $user): bool
    {
        if ($researchPlan->user_id !== $user->id) {
            throw new AuthorizationException('Unauthorized.');
        }

        return $this->repository->delete($researchPlan);
    }
}
