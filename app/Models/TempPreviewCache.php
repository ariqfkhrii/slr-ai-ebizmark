<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TempPreviewCache extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'batch_id',
        'raw_article_id',
        'cache_key',
        'created_at',
    ];

    public function rawArticle()
    {
        return $this->belongsTo(RawArticle::class);
    }
}
