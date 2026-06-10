<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ResearchPlanKeyword extends Pivot
{
    protected $fillable = [
        'research_plan_id',
        'keyword_id',
        'article_count',
        'duplicate_count',
        'unmatched_tier_count',
        'missing_doi_count',
    ];

    public function researchPlan()
    {
        return $this->belongsTo(ResearchPlan::class);
    }

    public function keyword()
    {
        return $this->belongsTo(Keyword::class);
    }
}
