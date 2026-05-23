<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function rawArticles()
    {
        return $this->belongsToMany(RawArticle::class, 'raw_article_countries')->withTimestamps();
    }
}
