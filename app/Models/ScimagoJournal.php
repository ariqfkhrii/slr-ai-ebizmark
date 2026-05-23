<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScimagoJournal extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_id',
        'title',
        'issn_print',
        'issn_e',
        'best_quartile',
    ];
}
