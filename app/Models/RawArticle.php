<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'doi',
        'title',
        'authors',
        'keyword',
        'abstract',
        'issn_print',
        'issn_e',
        'tier',
        'citation_count',
        'publish_year',
        'source_db',
        'embedding',
    ];

    protected $casts = [
        'embedding' => 'array',
    ];

    public function countries()
    {
        return $this->belongsToMany(Country::class, 'raw_article_countries')->withTimestamps();
    }

    public function filteredArticles()
    {
        return $this->hasMany(FilteredArticle::class, 'raw_article_id', 'id');
    }
}
