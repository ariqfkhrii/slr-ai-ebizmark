<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Keyword extends Model
{
    protected $fillable = ['keyword'];

    public function researchPlans()
    {
        return $this->belongsToMany(ResearchPlan::class)
            ->using(ResearchPlanKeyword::class)
            ->withPivot('article_count')
            ->withTimestamps();
    }
}
