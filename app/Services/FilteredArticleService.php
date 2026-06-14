<?php

namespace App\Services;

use App\Models\FilteredArticle;

class FilteredArticleService
{
    public function getPaginatedArticles(int $planId, ?int $keywordId, int $size)
    {
        return FilteredArticle::query()
            ->where('research_plan_id', $planId)
            ->when($keywordId, function ($query, $keywordId) {
                return $query->where('keyword_id', $keywordId);
            })
            ->with('rawArticle:id,title,publish_year,tier,doi') 
            ->paginate($size);
    }
}
