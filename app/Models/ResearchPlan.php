<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

    protected $appends = [
        'scopus_quantity',
        'pubmed_quantity'
    ];

    public function getScopusQuantityAttribute(): int
    {
        return DB::table('filtered_articles')
            ->join('raw_articles', 'filtered_articles.raw_article_id', '=', 'raw_articles.id')
            ->where('filtered_articles.research_plan_id', $this->research_plan_id)
            ->where('raw_articles.source_db', 'scopus')
            ->count();
    }

    public function getPubmedQuantityAttribute(): int
    {
        return DB::table('filtered_articles')
            ->join('raw_articles', 'filtered_articles.raw_article_id', '=', 'raw_articles.id')
            ->where('filtered_articles.research_plan_id', $this->research_plan_id)
            ->where('raw_articles.source_db', 'pubmed')
            ->count();
    }

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
