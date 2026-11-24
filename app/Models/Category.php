<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use LogsActivity;

    /**
     * Bootstrap model hooks to invalidate the JDIHN integration feed cache when categories change.
     */
    protected static function booted(): void
    {
        $invalidateFeed = fn () => \App\Http\Controllers\Api\JdihIntegrasiController::clearFeedCache();
        static::saved($invalidateFeed);
        static::deleted($invalidateFeed);
    }

    protected $fillable = ['name', 'slug', 'code', 'description'];

    /**
     * Relasi: kategori memiliki banyak dokumen hukum.
     */
    public function legalDocuments()
    {
        return $this->hasMany(LegalDocument::class);
    }
}
