<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RawArticle extends Model
{
    protected $fillable = [
        'doi',
        'title',
        'author',
        'keyword',
        'abstract',
        'issn_print',
        'issn_e',
        'tier',
        'citation_count',
        'publish_year',
        'source_db',
    ];

    public function countries()
    {
        return $this->belongsToMany(Country::class, 'raw_article_countries')->withTimestamps();
    }
}
