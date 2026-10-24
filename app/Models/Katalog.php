<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Katalog extends Model
{
    // SECURITY FIX: [VULN-004] (SP-005 Mass Assignment Protection)
    protected $fillable = [
        'category',
        'document_number',
        'date_stipulated',
        'date_promulgated',
        'title',
        'description',
        'source',
        'status',
        'publish_year',
    ];
}
