<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Keyword extends Model
{
    use HasFactory;
    
    protected $fillable = ['keyword', 'embedding'];

    protected $casts = [
        'embedding' => 'array',
    ];
    
    public function researchPlans()
    {
        return $this->belongsToMany(
            ResearchPlan::class,
            'research_plan_keyword',
            'keyword_id',
            'research_plan_id'
        )
        ->using(ResearchPlanKeyword::class)
        ->withPivot('article_count')
        ->withTimestamps();
    }
}
