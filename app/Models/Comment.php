<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use LogsActivity;

    protected $fillable = [
        'legal_document_id',
        'name',
        'email',
        'phone',
        'comment',
        'is_approved',
    ];

    /**
     * Sembunyikan data kontak pribadi masyarakat dari serialisasi publik (Inertia/API).
     */
    protected $hidden = [
        'email',
        'phone',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    /**
     * Get the document that the comment belongs to.
     */
    public function legalDocument(): BelongsTo
    {
        return $this->belongsTo(LegalDocument::class);
    }
}
