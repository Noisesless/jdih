<?php

namespace App\Services;

use App\Models\LegalDocument;
use App\Models\PdfChunk;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RagService
{
    protected GeminiService $gemini;
    protected int $maxChunks;
    protected int $chunkSize;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
        $this->maxChunks = (int) config('services.gemini.max_chunks', 5);
        $this->chunkSize = (int) config('services.gemini.chunk_size', 500);
    }

    /**
     * Generate embedding for a text using Google Gemini Embedding API dengan failover pool.
     */
    public function generateEmbedding(string $text): ?array
    {
        return $this->gemini->embedContent($text);
    }

    /**
     * Search for relevant chunks using cosine similarity.
     */
    public function searchRelevantChunks(int $documentId, string $query, int $limit = 5): array
    {
        $chunks = PdfChunk::byDocument($documentId)->get();
        
        if ($chunks->isEmpty()) {
            return [];
        }

        // Generate embedding for the query
        $queryEmbedding = $this->generateEmbedding($query);
        
        if (!$queryEmbedding) {
            return [];
        }

        // Calculate similarity for each chunk
        $similarities = $chunks->map(function ($chunk) use ($queryEmbedding) {
            $similarity = PdfChunk::cosineSimilarity($queryEmbedding, $chunk->embedding);
            return [
                'chunk_id' => $chunk->id,
                'content' => $chunk->content,
                'similarity' => $similarity,
                'chunk_index' => $chunk->chunk_index,
            ];
        })
        ->sortByDesc('similarity')
        ->take($limit)
        ->values()
        ->toArray();

        return $similarities;
    }

    /**
     * Build context from relevant chunks for the prompt.
     */
    public function buildContextFromChunks(array $similarities, string $query): string
    {
        if (empty($similarities)) {
            return "Tidak ada konten PDF yang relevan dengan pertanyaan.";
        }

        $context = "=== KONTEN DOKUMEN RELEVAN ===\n\n";
        
        foreach ($similarities as $i => $sim) {
            $relevance = $sim['similarity'] > 0.5 ? '(Sangat Relevan)' : 
                        ($sim['similarity'] > 0.3 ? '(Relevan)' : '(Kurang Relevan)');
            
            $context .= "[Chunk {$sim['chunk_index']}] {$relevance}\n";
            $context .= str_repeat('-', 60) . "\n";
            $context .= $sim['content'] . "\n\n";
        }

        $context .= "=== AKHIR KONTEN DOKUMEN ===";

        return $context;
    }

    /**
     * Process a document: extract text, chunk, and generate embeddings.
     * Note: This is a placeholder - actual PDF extraction needs a PDF library
     */
    public function processDocumentForRag(int $documentId): array
    {
        $document = LegalDocument::findOrFail($documentId);
        
        // Check if already processed
        $existingChunks = PdfChunk::where('legal_document_id', $documentId)->count();
        if ($existingChunks > 0) {
            return [
                'success' => true,
                'message' => "Dokumen '{$document->title}' sudah diproses. {$existingChunks} chunks ditemukan.",
                'chunks' => $existingChunks,
            ];
        }

        // Get PDF file path
        $filePath = storage_path("app/public/{$document->file_path}");
        
        if (!file_exists($filePath)) {
            return [
                'success' => false,
                'message' => "File PDF tidak ditemukan: {$document->file_path}",
            ];
        }

        // Extract text from PDF (using simple approach)
        $text = $this->extractTextFromPdf($filePath);
        
        if (empty($text)) {
            // Try abstract as fallback
            $text = $document->abstract ?? '';
        }

        if (empty($text)) {
            return [
                'success' => false,
                'message' => "Tidak ada teks yang dapat diekstrak dari dokumen.",
            ];
        }

        // Chunk the text
        $chunks = $this->chunkText($text, $this->chunkSize);
        
        // Process each chunk
        $processed = 0;
        $failed = 0;

        foreach ($chunks as $index => $chunkText) {
            try {
                // Create chunk record
                $pdfChunk = PdfChunk::create([
                    'legal_document_id' => $documentId,
                    'chunk_index' => $index + 1,
                    'content' => $chunkText,
                    'status' => 'processing',
                ]);

                // Generate embedding
                $embedding = $this->generateEmbedding($chunkText);
                
                if ($embedding) {
                    $pdfChunk->update([
                        'embedding' => $embedding,
                        'embedding_dimension' => count($embedding),
                        'status' => 'completed',
                    ]);
                    $processed++;
                } else {
                    $pdfChunk->update([
                        'status' => 'failed',
                        'error_message' => 'Failed to generate embedding',
                    ]);
                    $failed++;
                }
            } catch (\Exception $e) {
                Log::error('RAG chunk processing failed: ' . $e->getMessage());
                $failed++;
            }
        }

        return [
            'success' => true,
            'message' => "Proses selesai. {$processed} chunks berhasil, {$failed} gagal.",
            'chunks' => $processed,
            'failed' => $failed,
            'total_text_length' => strlen($text),
        ];
    }

    /**
     * Extract text from PDF file (basic implementation).
     * For production, consider using a proper PDF library.
     */
    protected function extractTextFromPdf(string $filePath): string
    {
        // Path Traversal Prevention: Validate and resolve the real path
        // Only allow paths within the storage/app/public directory
        $allowedBase = realpath(storage_path('app/public'));
        if ($allowedBase === false) {
            return '';
        }

        // Resolve the actual path after all symlinks and .. resolution
        $realPath = realpath($filePath);
        if ($realPath === false || !str_starts_with($realPath, $allowedBase)) {
            Log::warning('RAG: Blocked potential path traversal attempt', [
                'requested' => $filePath,
                'real_path' => $realPath,
                'allowed_base' => $allowedBase,
            ]);
            return '';
        }

        // Verify the file exists and is a PDF
        if (!is_file($realPath) || strtolower(pathinfo($realPath, PATHINFO_EXTENSION)) !== 'pdf') {
            return '';
        }

        // Check if pdftotext is available (poppler-utils)
        if (exec('pdftotext -v 2>&1', $output, $returnCode) && $returnCode === 0) {
            $tempFile = tempnam(sys_get_temp_dir(), 'pdf_');
            exec("pdftotext \"" . escapeshellarg($realPath) . "\" \"" . escapeshellarg($tempFile) . "\" 2>&1");
            $text = file_get_contents($tempFile);
            unlink($tempFile);
            return trim($text ?? '');
        }

        // Fallback: return abstract if available
        return '';
    }

    /**
     * Split text into chunks of specified size.
     */
    protected function chunkText(string $text, int $chunkSize): array
    {
        $words = preg_split('/(\s+)/', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
        $chunks = [];
        $currentChunk = '';

        foreach ($words as $word) {
            if (strlen($currentChunk . $word) > $chunkSize && strlen($currentChunk) > 0) {
                $chunks[] = trim($currentChunk);
                $currentChunk = $word;
            } else {
                $currentChunk .= $word;
            }
        }

        if (trim($currentChunk) !== '') {
            $chunks[] = trim($currentChunk);
        }

        // Ensure minimum chunk count
        if (empty($chunks)) {
            $chunks[] = substr($text, 0, $chunkSize);
        }

        return $chunks;
    }
}
