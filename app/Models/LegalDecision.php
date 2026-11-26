<?php

namespace App\Models;

use App\Http\Controllers\Api\JdihIntegrasiController;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class LegalDecision extends Model
{
    use LogsActivity;

    protected $fillable = [
        'document_type',
        'document_number',
        'year',
        'title',
        'teu',
        'court_type',
        'court_abbreviation',
        'court_place',
        'decision_date',
        'source',
        'subject',
        'status',
        'language',
        'legal_field',
        'location',
        'content',
        'file_path',
        'is_published',
    ];

    protected $appends = [
        'file',
    ];

    protected $casts = [
        'decision_date' => 'date',
        'year' => 'integer',
        'is_published' => 'boolean',
    ];

    /**
     * Bootstrap model hooks to keep JDIHN integration feed cache fresh.
     */
    protected static function booted(): void
    {
        $invalidateFeed = fn () => JdihIntegrasiController::clearFeedCache();
        static::saved($invalidateFeed);
        static::deleted($invalidateFeed);
    }

    /**
     * Accessor for encoded public storage URL when the PDF exists on disk.
     */
    public function getFileAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }

        $cleanPath = ltrim((string) $this->file_path, '/');
        if (!Storage::disk('public')->exists($cleanPath)) {
            return null;
        }

        $segments = explode('/', $cleanPath);
        return '/storage/' . implode('/', array_map('rawurlencode', $segments));
    }
}
