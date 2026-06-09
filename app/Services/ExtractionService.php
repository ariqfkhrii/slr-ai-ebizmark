<?php

namespace App\Services;

use App\Models\Extraction;
use App\Models\FilteredArticle;
use App\Models\ResearchPlan;
use App\Models\Review;

class ExtractionService
{
    /**
     * Upsert extraction result for a specific filtered article (manual input).
     */
    public function upsert(int $filteredArticleId, int $userId, array $data): Extraction
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

        return Extraction::query()->updateOrCreate(
            ['review_id' => $review->review_id],
            [
                'abstract'          => $data['abstract'] ?? null,
                'introduction'      => $data['introduction'] ?? null,
                'result'            => $data['result'] ?? null,
                'conclusion'        => $data['conclusion'] ?? null,
                'recommendation'    => $data['recommendation'] ?? null,
                'novelty_gap'       => $data['novelty_gap'] ?? null,
                'future_research'   => $data['future_research'] ?? null,
                'limitation'        => $data['limitation'] ?? null,
                'input_method'      => 'manual',
                'validation_status' => 'pending',
            ]
        );
    }
}
