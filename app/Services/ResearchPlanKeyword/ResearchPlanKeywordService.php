<?php
namespace App\Services\ResearchPlanKeyword;

use App\Models\Keyword;
use App\Models\ResearchPlan;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Http;
use App\Jobs\GenerateKeywordEmbeddingJob;

class ResearchPlanKeywordService
{
    /**
     * Check if the user owns the research plan
     * 
     * @param int $userId The ID of the user
     * @param int $researchPlanId The ID of the research plan
     * @throws AuthorizationException if the user does not own the research plan
     * @return void
     */
    public function checkOwnership(int $userId,int $researchPlanId)
    {
        $exists = ResearchPlan::where('research_plan_id', $researchPlanId)
            ->where('user_id', $userId)
            ->exists();

        if (!$exists) {
            throw new AuthorizationException();
        }
    }

    /**
     * Get keywords associated with a research plan
     * 
     * @param int $userId The ID of the user
     * @param int $researchPlanId The ID of the research plan
     * @return \Illuminate\Support\Collection A collection of keywords with article counts
     */
    public function getKeywordsByResearchPlan(int $userId, int $researchPlanId)
    {
        $this->checkOwnership($userId, $researchPlanId);

        $researchPlan = ResearchPlan::with(['keywords'])->find($researchPlanId);

        return $researchPlan->keywords->map(function ($keyword) {
            return [
                'id' => $keyword->id,
                'name' => $keyword->keyword,
                'article_count' => $keyword->pivot->article_count,
            ];
        });
    }

    /**
     * Attach a keyword to a research plan
     * 
     * @param int $userId The ID of the user
     * @param int $researchPlanId The ID of the research plan
     * @param string $keywordName The name of the keyword
     * @return Keyword The attached keyword
     */
    public function attachKeywordToResearchPlan(
        int $userId,
        int $researchPlanId,
        string $keywordName
    )
    {
        $this->checkOwnership($userId, $researchPlanId);

        // 1. create / get keyword
        $keyword = Keyword::firstOrCreate([
            'keyword' => $keywordName
        ]);

        // 2. dispatch embedding job (ASYNC)
        GenerateKeywordEmbeddingJob::dispatch($keyword->id);

        // 3. attach ke research plan
        $researchPlan = ResearchPlan::find($researchPlanId);

        $researchPlan->keywords()
            ->syncWithoutDetaching([$keyword->id]);

        return $keyword;
    }

    /**
     * Update a keyword for a research plan
     * 
     * @param int $userId The ID of the user
     * @param int $researchPlanId The ID of the research plan
     * @param int $oldKeywordId The ID of the old keyword
     * @param string $newKeywordName The name of the new keyword
     * @return Keyword The updated keyword
     */
    public function updateKeywordForResearchPlan(
        int $userId,
        int $researchPlanId,
        int $oldKeywordId,
        string $newKeywordName
    )
    {
        $this->checkOwnership($userId, $researchPlanId);

        $researchPlan = ResearchPlan::find($researchPlanId);

        $researchPlan->keywords()->detach($oldKeywordId);

        $newKeyword = Keyword::firstOrCreate([
            'keyword' => $newKeywordName
        ]);

        GenerateKeywordEmbeddingJob::dispatch($newKeyword->id);

        $researchPlan->keywords()
            ->syncWithoutDetaching([$newKeyword->id]);

        return $newKeyword;
    }

    /**
     * Detach a keyword from a research plan
     * 
     * @param int $userId The ID of the user
     * @param int $researchPlanId The ID of the research plan
     * @param int $keywordId The ID of the keyword to detach
     * @return void
     */
    public function detachKeywordFromResearchPlan(
        int $userId,
        int $researchPlanId,
        int $keywordId
    )
    {
        $this->checkOwnership($userId, $researchPlanId);

        $exists = Keyword::where('id', $keywordId)->exists();

        if (!$exists) {
            abort(404);
        }

        $researchPlan = ResearchPlan::find($researchPlanId);

        $researchPlan->keywords()->detach($keywordId);
    }
}
