<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    use LogsActivity;

    protected $fillable = [
        'title',
        'document_number',
        'year',
        'category_id',
        'document_type',
        'entity',
        'teu',
        'abbreviation',
        'status',
        'status_note',
        'related_regulations_text',
        'implementing_regulations',
        'abstract',
        'abstract_file_path',
        'file_path',
        'published_at',
        'promulgated_at',
        'place_of_enactment',
        'source',
        'subject',
        'govt_field',
        'legal_field',
        'legal_form',
        'page_count',
        'language',
        'location',
        'signer',
        'author',
        'publisher_place',
        'judicial_review',
        'result_judicial_review',
        'initiator',
        'view_count',
        'download_count',
    ];

    protected $appends = [
        'file',
        'abstract_file',
        'download_url',
        'subject_text',
        'related',
        'referenced_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'promulgated_at' => 'datetime',
        'view_count' => 'integer',
        'download_count' => 'integer',
        'page_count' => 'integer',
    ];

    /**
     * Get the category that owns the document.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Documents that this document relates to (e.g., this document repeals them).
     */
    public function relatedDocuments()
    {
        return $this->belongsToMany(LegalDocument::class, 'legal_document_relations', 'main_document_id', 'related_document_id')
            ->withPivot('relation_type')
            ->withTimestamps();
    }

    /**
     * Documents that relate to this document (e.g., they repeal this document).
     */
    public function referencedByDocuments()
    {
        return $this->belongsToMany(LegalDocument::class, 'legal_document_relations', 'related_document_id', 'main_document_id')
            ->withPivot('relation_type')
            ->withTimestamps();
    }

    /**
     * Get the comments for the document.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Accessor for full file URL.
     */
    public function getFileAttribute()
    {
        if (!$this->file_path) return null;
        
        // Safety check: only return URL if file actually exists on disk
        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($this->file_path)) {
            return null;
        }

        $segments = explode('/', ltrim($this->file_path, '/'));
        $encoded = implode('/', array_map('rawurlencode', $segments));
        return '/storage/' . $encoded;
    }

    /**
     * Accessor for full abstract file URL.
     */
    public function getAbstractFileAttribute()
    {
        if (!$this->abstract_file_path) return null;

        // Safety check
        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($this->abstract_file_path)) {
            return null;
        }

        $segments = explode('/', ltrim($this->abstract_file_path, '/'));
        $encoded = implode('/', array_map('rawurlencode', $segments));
        return '/storage/' . $encoded;
    }

    /**
     * Accessor for download URL.
     */
    public function getDownloadUrlAttribute()
    {
        return $this->file;
    }

    /**
     * Accessor for subject text.
     */
    public function getSubjectTextAttribute()
    {
        if (!$this->subject) return '-';
        if (is_array($this->subject)) return implode(' - ', $this->subject);
        
        $decoded = json_decode($this->subject, true);
        if (is_array($decoded)) return implode(' - ', $decoded);
        
        return $this->subject;
    }

    /**
     * Accessor for related documents in frontend format.
     */
    public function getRelatedAttribute()
    {
        if (!$this->relationLoaded('relatedDocuments')) return [];
        
        return $this->relatedDocuments->map(fn($doc) => [
            'id' => $doc->id,
            'slug' => $doc->category->slug ?? 'katalog',
            'type' => $doc->category->name ?? 'Dokumen',
            'number' => $doc->document_number,
            'year' => $doc->year,
            'title' => $doc->title,
        ]);
    }

    /**
     * Accessor for documents that reference this one.
     */
    public function getReferencedByAttribute()
    {
        if (!$this->relationLoaded('referencedByDocuments')) return [];
        
        return $this->referencedByDocuments->map(fn($doc) => [
            'id' => $doc->id,
            'slug' => $doc->category->slug ?? 'katalog',
            'type' => $doc->category->name ?? 'Dokumen',
            'number' => $doc->document_number,
            'year' => $doc->year,
            'title' => $doc->title,
        ]);
    }
}
