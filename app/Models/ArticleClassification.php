<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleClassification extends Model
{
    use HasFactory;

    protected $table = 'article_classification';

    protected $primaryKey = 'classification_id';

    protected $fillable = [
        'review_id',
        'research_method',
        'category_1',
        'category_2',
        'category_3',
        'category_4',
        'category_5',
        'category_6',
        'grand_theory',
    ];

    public function review()
    {
        return $this->belongsTo(Review::class, 'review_id', 'review_id');
    }
}
