<?php

namespace App\Models;

use App\Models\RawArticle;
use App\Models\ResearchPlan;
use Illuminate\Database\Eloquent\Model;

class FilteredArticle extends Model
{
    protected $fillable = [
        'research_plan_id',
        'raw_article_id',
        'included',
        'retrieved',
        'novelty_status',
        'ai_usage_status',
        'article_status',
    ];

    public function researchPlan()
    {
        return $this->belongsTo(ResearchPlan::class);
    }

    public function rawArticle()
    {
        return $this->belongsTo(RawArticle::class);
    }
}
