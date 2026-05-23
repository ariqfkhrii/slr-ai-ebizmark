<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchPlan extends Model
{
    use HasFactory;

    protected $primaryKey = 'research_plan_id';

    protected $fillable = [
        'title',
        'scopus_quantity',
        'pubmed_quantity',
        'extraction_count',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function keywords()
    {
        return $this->belongsToMany(
            Keyword::class,
            'research_plan_keyword',
            'research_plan_id',
            'keyword_id'
        )
        ->using(ResearchPlanKeyword::class)
        ->withPivot('article_count')
        ->withTimestamps();
    }
}