<?php

namespace App\Services;

use App\Models\ArticleClassification;
use App\Models\ClassificationSetup;
use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use App\Models\Review;

class ClassificationService
{
    /**
     * Upsert the classification setup for a research plan.
     */
    public function upsertSetup(int $researchPlanId, int $userId, array $data): ClassificationSetup
    {
        $researchPlan = ResearchPlan::query()
            ->where('research_plan_id', $researchPlanId)
            ->where('user_id', $userId)
            ->first();

        if (! $researchPlan) {
            abort(403, 'Unauthorized.');
        }

        return ClassificationSetup::query()->updateOrCreate(
            ['research_plan_id' => $researchPlan->research_plan_id],
            [
                'category_1' => $data['category_1'] ?? null,
                'category_2' => $data['category_2'] ?? null,
                'category_3' => $data['category_3'] ?? null,
                'category_4' => $data['category_4'] ?? null,
                'category_5' => $data['category_5'] ?? null,
                'category_6' => $data['category_6'] ?? null,
                'theory' => $data['theory'] ?? null,
            ]
        );
    }

    /**
     * Update the classification details of a specific filtered article.
     */
    public function updateClassification(int $filteredArticleId, int $userId, array $data): ArticleClassification
    {
        $filteredArticle = FilteredArticle::query()
            ->where('id', $filteredArticleId)
            ->firstOrFail();

        $researchPlan = ResearchPlan::query()
            ->where('research_plan_id', $filteredArticle->research_plan_id)
            ->where('user_id', $userId)
            ->first();

        if (! $researchPlan) {
            abort(403, 'Unauthorized.');
        }

        $review = Review::query()->firstOrCreate([
            'article_id' => $filteredArticle->id,
        ]);

        return ArticleClassification::query()->updateOrCreate(
            ['review_id' => $review->review_id],
            [
                'research_method' => $data['research_method'] ?? null,
                'category_1' => $data['category_1'] ?? null,
                'category_2' => $data['category_2'] ?? null,
                'category_3' => $data['category_3'] ?? null,
                'category_4' => $data['category_4'] ?? null,
                'category_5' => $data['category_5'] ?? null,
                'category_6' => $data['category_6'] ?? null,
            ]
        );
    }
}
