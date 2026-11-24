<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LegalDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class JdihIntegrasiController extends Controller
{
    public const CACHE_VERSION_KEY = 'jdihn_integrasi_feed_ver';

    /**
     * Public pull-based JSON feed endpoint for JDIHN (connect.jdihn.go.id)
     * and JDIH Provinsi Jawa Tengah crawler integration.
     */
    public function index(Request $request): JsonResponse
    {
        $baseUrl = rtrim($request->getSchemeAndHttpHost() ?: config('app.url'), '/');
        $version = (int) Cache::get(self::CACHE_VERSION_KEY, 1);
        $cacheKey = 'jdihn_integrasi_feed_v1_' . $version . '_' . md5($baseUrl);

        $payload = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($baseUrl) {
            return $this->buildFeedPayload($baseUrl);
        });

        return response()->json($payload, 200, [
            'Content-Type' => 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
            'Cache-Control' => 'public, max-age=300',
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Invalidate cached JDIHN integration feed when documents or categories change.
     */
    public static function clearFeedCache(): void
    {
        try {
            Cache::put(self::CACHE_VERSION_KEY, (int) microtime(true), now()->addDay());
        } catch (\Throwable $e) {
            // Ignore cache driver failures silently so admin CRUD is never blocked.
        }
    }

    /**
     * Build the standardized JDIHN / ILDIS JSON feed array for all published legal documents.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function buildFeedPayload(string $baseUrl): array
    {
        $publicDisk = Storage::disk('public');

        $documents = LegalDocument::query()
            ->select([
                'id',
                'category_id',
                'title',
                'document_number',
                'year',
                'document_type',
                'entity',
                'teu',
                'abbreviation',
                'status',
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
                'page_count',
                'language',
                'publisher_place',
                'updated_at',
            ])
            ->with('category:id,name,slug,code')
            ->orderByDesc('id')
            ->get();

        $rows = [];

        foreach ($documents as $doc) {
            $categorySlug = $doc->category?->slug ?: 'peraturan-daerah';

            $fileDownload = '-';
            $urlDownload = '-';
            if (filled($doc->file_path)) {
                $cleanPath = ltrim((string) $doc->file_path, '/');
                if (is_file($publicDisk->path($cleanPath))) {
                    $fileDownload = basename($cleanPath);
                    $urlDownload = $baseUrl . '/storage/' . $this->encodeStoragePath($cleanPath);
                }
            }

            $urlAbstrak = '';
            if (filled($doc->abstract_file_path)) {
                $cleanAbstractPath = ltrim((string) $doc->abstract_file_path, '/');
                if (is_file($publicDisk->path($cleanAbstractPath))) {
                    $urlAbstrak = $baseUrl . '/storage/' . $this->encodeStoragePath($cleanAbstractPath);
                }
            }

            $subject = $this->formatSubject($doc->subject);
            $tanggalPenetapan = $doc->published_at?->format('Y-m-d');
            $tanggalPengundangan = $doc->promulgated_at?->format('Y-m-d') ?? $tanggalPenetapan ?? '-';

            $rows[] = [
                'idData' => (string) $doc->id,
                'tahun_pengundangan' => (string) ($doc->year ?? ''),
                'tanggal_penetapan' => $tanggalPenetapan,
                'tanggal_pengundangan' => $tanggalPengundangan,
                'jenis' => $doc->category?->name ?? (filled($doc->document_type) ? (string) $doc->document_type : 'Peraturan'),
                'noPeraturan' => filled($doc->document_number) ? (string) $doc->document_number : '-',
                'judul' => (string) $doc->title,
                'noPanggil' => '-',
                'singkatanJenis' => filled($doc->abbreviation) ? (string) $doc->abbreviation : ($doc->category?->code ?? '-'),
                'tempatTerbit' => filled($doc->publisher_place)
                    ? (string) $doc->publisher_place
                    : (filled($doc->place_of_enactment) ? (string) $doc->place_of_enactment : 'Banjarnegara'),
                'penerbit' => filled($doc->entity) && $doc->entity !== '-'
                    ? (string) $doc->entity
                    : 'Pemerintah Kabupaten Banjarnegara',
                'deskripsiFisik' => $doc->page_count ? $doc->page_count . ' hlm' : '-',
                'sumber' => filled($doc->source) ? (string) $doc->source : '-',
                'subjek' => $subject,
                'isbn' => '-',
                'status' => filled($doc->status) ? (string) $doc->status : 'Berlaku',
                'bahasa' => filled($doc->language) ? (string) $doc->language : 'Indonesia',
                'bidangHukum' => filled($doc->legal_field)
                    ? (string) $doc->legal_field
                    : (filled($doc->govt_field) ? (string) $doc->govt_field : '-'),
                'teuBadan' => filled($doc->teu) && $doc->teu !== '-'
                    ? (string) $doc->teu
                    : 'Pemerintah Kabupaten Banjarnegara',
                'nomorIndukBuku' => '-',
                'abstrak' => filled($doc->abstract) ? (string) $doc->abstract : '',
                'last_updated' => $doc->updated_at?->format('Y-m-d H:i:s') ?? '',
                'urlAbstrak' => $urlAbstrak,
                'urlDetailPeraturan' => "{$baseUrl}/{$categorySlug}/{$doc->id}",
                'fileDownload' => $fileDownload,
                'urlDownload' => $urlDownload,
                'operasi' => '4',
                'display' => '1',
            ];
        }

        return $rows;
    }

    /**
     * Encode each storage path segment safely while preserving directory slashes.
     */
    protected function encodeStoragePath(string $path): string
    {
        return implode('/', array_map('rawurlencode', explode('/', $path)));
    }

    /**
     * Normalize subject field (JSON array or plain string) into JDIHN string format.
     */
    protected function formatSubject(mixed $subject): string
    {
        if (blank($subject) || $subject === '-') {
            return '';
        }

        if (is_array($subject)) {
            return implode(' - ', array_filter($subject, fn ($item) => filled($item)));
        }

        $decoded = json_decode((string) $subject, true);
        if (is_array($decoded)) {
            return implode(' - ', array_filter($decoded, fn ($item) => filled($item)));
        }

        return trim((string) $subject);
    }
}
