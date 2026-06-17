<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AutoReporting extends Model
{
    use HasFactory;

    protected $fillable = [
        'research_plan_id',
        'chapter',
        'title',
        'detail',
        'generated_content',
        'word_count',
        'order_no',
        'status',
    ];

    protected $casts = [
        'word_count' => 'integer',
        'order_no'   => 'integer',
    ];

    public function researchPlan()
    {
        return $this->belongsTo(ResearchPlan::class, 'research_plan_id', 'research_plan_id');
    }
}
