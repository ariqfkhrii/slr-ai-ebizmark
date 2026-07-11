<?php

namespace App\Models;

use App\Enums\ArticleTempStatus;
use Illuminate\Database\Eloquent\Model;

class ArticleMetadataTemp extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'batch_id',
        'raw_article_id',
        'status',
        'cache_key',
        'created_at',
    ];

    protected $casts = [
        'status' => ArticleTempStatus::class,
    ];

    public function rawArticle()
    {
        return $this->belongsTo(RawArticle::class);
    }
}
