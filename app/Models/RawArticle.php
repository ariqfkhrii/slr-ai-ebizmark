<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RawArticle extends Model
{
    protected $primaryKey = 'article_id';

    protected $fillable = [
        'doi',
        'title',
        'issn',
        'abstract',
        'publish_year',
        'country_id',
        'tier',
        'citation_count',
    ];

    public function filteredArticles()
    {
        return $this->hasMany(FilteredArticle::class, 'raw_article_id', 'article_id');
    }
}