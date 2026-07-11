<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassificationSetup extends Model
{
    use HasFactory;

    protected $table = 'classification_setup';

    protected $primaryKey = 'id_setup';

    protected $fillable = [
        'research_plan_id',
        'category_1',
        'category_2',
        'category_3',
        'category_4',
        'category_5',
        'category_6',
        'theory',
    ];

    public function researchPlan()
    {
        return $this->belongsTo(ResearchPlan::class, 'research_plan_id', 'research_plan_id');
    }
}
