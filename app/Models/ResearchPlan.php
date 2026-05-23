<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchPlan extends Model
{
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

    public function getRouteKeyName(): string
    {
        return 'research_plan_id';
    }
}