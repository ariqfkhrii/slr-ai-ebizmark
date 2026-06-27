<?php

namespace App\Services;

use App\Models\FilteredArticle;

class FilteredArticleService
{
    public function getAllArticles(int $planId)
    {
        return FilteredArticle::query()
            ->where('research_plan_id', $planId)
            ->with([
                'rawArticle:id,doi,title,authors,keyword,abstract,tier,citation_count,publish_year'
            ])
            ->get();
    }

    public function getPaginatedArticles(int $planId, ?int $keywordId, int $size)
    {
        return FilteredArticle::query()
            ->where('research_plan_id', $planId)
            ->when($keywordId, function ($query, $keywordId) {
                return $query->where('keyword_id', $keywordId);
            })
            ->with('rawArticle:id,doi,title,authors,keyword,abstract,tier,citation_count,publish_year')
            ->paginate($size);
    }

    public function updateIncludedStatus(int $id, bool $included)
    {
        $filteredArticle = FilteredArticle::findOrFail($id);
        
        $filteredArticle->update([
            'included' => $included
        ]);

        return $filteredArticle;
    }

    public function updateAllIncludedStatus(int $researchPlanId, bool $included)
    {
        FilteredArticle::query()
            ->where('research_plan_id', $researchPlanId)
            ->update([
                'included' => $included,
            ]);
    }
}
