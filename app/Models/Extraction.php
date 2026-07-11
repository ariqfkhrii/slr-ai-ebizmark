<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Extraction extends Model
{
    use HasFactory;

    protected $table = 'extraction_result';

    protected $primaryKey = 'extraction_id';

    protected $fillable = [
        'review_id',
        'abstract',
        'introduction',
        'result',
        'conclusion',
        'recommendation',
        'novelty_gap',
        'future_research',
        'limitation',
        'confidence_score',
        'input_method',
        'validation_status',
    ];

    protected $casts = [
        'confidence_score' => 'decimal:2',
    ];
}