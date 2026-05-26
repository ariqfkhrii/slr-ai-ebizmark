<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $table = 'review';

    protected $primaryKey = 'review_id';

    protected $fillable = [
        'article_id',
        'country_id',
        'received_date',
        'accepted_date',
        'published_date',
    ];

    public function filteredArticle()
    {
        return $this->belongsTo(FilteredArticle::class, 'article_id', 'filtered_article_id');
    }

    public function articleClassification()
    {
        return $this->hasOne(ArticleClassification::class, 'review_id', 'review_id');
    }
}
