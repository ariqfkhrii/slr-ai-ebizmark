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
        'source_database',
        'scopus_quantity',
        'pubmed_quantity',
        'extraction_count',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getRouteKeyName(): string
    {
        return 'research_plan_id';
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

    public function classificationSetup()
    {
        return $this->hasOne(ClassificationSetup::class, 'research_plan_id', 'research_plan_id');
    }

    public function filteredArticles()
    {
        return $this->hasMany(FilteredArticle::class, 'research_plan_id', 'research_plan_id');
    }

    public function autoReportings()
    {
        return $this->hasMany(AutoReporting::class, 'research_plan_id', 'research_plan_id');
    }
}
