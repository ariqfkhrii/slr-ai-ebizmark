<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FilteredArticle extends Model
{
    protected $primaryKey = 'filtered_article_id';

    protected $fillable = [
        'raw_article_id',
        'research_plan_id',
        'novelty_status',
        'article_status',
        'included',
        'retrieved',
        'ai_usage_status',
        'pdf_path',
    ];

    public function rawArticle()
    {
        return $this->belongsTo(RawArticle::class, 'raw_article_id', 'article_id');
    }

    public function researchPlan()
    {
        return $this->belongsTo(ResearchPlan::class, 'research_plan_id', 'research_plan_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'article_id', 'filtered_article_id');
    }
}