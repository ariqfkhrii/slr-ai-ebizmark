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
        'pdf_path',
        'article_status',
    ];

    protected $casts = [
        'included' => 'boolean',
        'retrieved' => 'boolean',
        'novelty_status' => 'boolean',
        'ai_usage_status' => 'boolean',
    ];

    public function researchPlan()
    {
        return $this->belongsTo(ResearchPlan::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'article_id', 'id');
    }

    public function rawArticle()
    {
        return $this->belongsTo(RawArticle::class);
    }
}