<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JdihSyncLog;
use App\Models\LegalDecision;
use App\Models\LegalDocument;
use App\Providers\AppServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
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
        $startedAt = microtime(true);
        $baseUrl = rtrim($request->getSchemeAndHttpHost() ?: config('app.url'), '/');
        $version = (int) Cache::get(self::CACHE_VERSION_KEY, 1);
        $cacheKey = 'jdihn_integrasi_feed_v1_' . $version . '_' . md5($baseUrl);
        $cacheHit = Cache::has($cacheKey);

        $payload = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($baseUrl) {
            return $this->buildFeedPayload($baseUrl);
        });

        if ($request->isMethod('GET')) {
            $this->recordPullSyncLog($request, count($payload), $cacheHit, $startedAt);
        }

        return response()->json($payload, 200, [
            'Content-Type' => 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
            'Cache-Control' => 'public, max-age=300',
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Record incoming pull-based sync requests from JDIHN Pusat, JDIH Jateng,
     * and public monitors into jdih_sync_logs for visibility in /admin/jdih-sync.
     */
    protected function recordPullSyncLog(Request $request, int $documentCount, bool $cacheHit, float $startedAt): void
    {
        try {
            $clientIp = AppServiceProvider::getClientIp() ?: (string) $request->ip();
            $ua = (string) ($request->userAgent() ?? '');

            [$triggeredBy, $clientLabel, $dedupeSeconds] = match (true) {
                stripos($ua, 'jdihn-integration-console') !== false || $clientIp === '103.145.96.150' => [
                    'jdihn_pusat',
                    'JDIHN Pusat (connect.jdihn.go.id)',
                    5,
                ],
                stripos($ua, 'JDIH Jateng') !== false || $clientIp === '103.107.245.244' => [
                    'jdih_jateng',
                    'JDIH Provinsi Jawa Tengah',
                    10,
                ],
                stripos($ua, 'SPLP-') !== false || $clientIp === '103.134.19.173' => [
                    'splp_monitor',
                    'SPLP Availability Monitor',
                    60,
                ],
                default => [
                    'public_pull',
                    'Akses Feed / Browser',
                    60,
                ],
            };

            $dedupeKey = 'jdih_pull_log_' . md5($triggeredBy . '|' . $clientIp . '|' . $request->getPathInfo());
            if (!Cache::add($dedupeKey, 1, $dedupeSeconds)) {
                return;
            }

            $durationMs = round((microtime(true) - $startedAt) * 1000, 1);

            JdihSyncLog::create([
                'sync_type' => 'integrasi',
                'direction' => 'inbound',
                'status' => 'success',
                'total_records' => $documentCount,
                'success_records' => $documentCount,
                'failed_records' => 0,
                'triggered_by' => $triggeredBy,
                'api_token_name' => "{$clientLabel} ({$clientIp})",
                'payload' => [
                    'endpoint' => $request->getPathInfo(),
                    'method' => $request->method(),
                    'client_ip' => $clientIp,
                    'user_agent' => substr($ua, 0, 255),
                    'cache_hit' => $cacheHit,
                ],
                'response' => [
                    'http_status' => 200,
                    'total_documents' => $documentCount,
                    'duration_ms' => $durationMs,
                ],
                'synced_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to record JDIHN pull sync log: ' . $e->getMessage());
        }
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
                'created_at',
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
            $fallbackDate = ($doc->created_at && (int) $doc->created_at->format('Y') === (int) $doc->year)
                ? $doc->created_at->format('Y-m-d')
                : (($doc->year && (int) $doc->year >= 1900 && (int) $doc->year <= (int) date('Y') + 1)
                    ? sprintf('%04d-01-01', (int) $doc->year)
                    : ($doc->created_at?->format('Y-m-d') ?? date('Y-m-d')));

            $tanggalPenetapan = $doc->published_at?->format('Y-m-d')
                ?? $doc->promulgated_at?->format('Y-m-d')
                ?? $fallbackDate;
            $tanggalPengundangan = $doc->promulgated_at?->format('Y-m-d')
                ?? $doc->published_at?->format('Y-m-d')
                ?? $fallbackDate;

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

        // Sertakan Putusan Pengadilan (tabel legal_decisions) dengan offset ID agar tidak bertabrakan dengan LegalDocument.
        $decisions = LegalDecision::query()
            ->where('is_published', true)
            ->orderByDesc('id')
            ->get();

        foreach ($decisions as $decision) {
            $fileDownload = '-';
            $urlDownload = '-';
            $resolvedPath = $decision->resolvePublicFilePath();
            if ($resolvedPath !== null) {
                $fileDownload = basename($resolvedPath);
                $urlDownload = $baseUrl . '/storage/' . $this->encodeStoragePath($resolvedPath);
            }

            $decisionDate = $decision->decision_date?->format('Y-m-d')
                ?? (($decision->year && (int) $decision->year >= 1900 && (int) $decision->year <= (int) date('Y') + 1)
                    ? sprintf('%04d-01-01', (int) $decision->year)
                    : ($decision->created_at?->format('Y-m-d') ?? date('Y-m-d')));

            $rows[] = [
                'idData' => (string) (900000 + (int) $decision->id),
                'tahun_pengundangan' => (string) ($decision->year ?? ''),
                'tanggal_penetapan' => $decisionDate,
                'tanggal_pengundangan' => $decisionDate,
                'jenis' => filled($decision->document_type) ? (string) $decision->document_type : 'Putusan',
                'noPeraturan' => filled($decision->document_number) ? (string) $decision->document_number : '-',
                'judul' => (string) $decision->title,
                'noPanggil' => '-',
                'singkatanJenis' => filled($decision->court_abbreviation) ? (string) $decision->court_abbreviation : 'PUT',
                'tempatTerbit' => filled($decision->court_place) ? (string) $decision->court_place : 'Banjarnegara',
                'penerbit' => filled($decision->court_type) ? (string) $decision->court_type : 'Pengadilan',
                'deskripsiFisik' => '-',
                'sumber' => filled($decision->source) ? (string) $decision->source : '-',
                'subjek' => filled($decision->subject) ? (string) $decision->subject : '',
                'isbn' => '-',
                'status' => filled($decision->status) && $decision->status !== '-' ? (string) $decision->status : 'Inkracht',
                'bahasa' => filled($decision->language) ? (string) $decision->language : 'Bahasa Indonesia',
                'bidangHukum' => filled($decision->legal_field) ? (string) $decision->legal_field : 'Hukum Tata Usaha Negara',
                'teuBadan' => filled($decision->teu) ? (string) $decision->teu : (filled($decision->court_type) ? (string) $decision->court_type : 'Pengadilan'),
                'nomorIndukBuku' => '-',
                'abstrak' => filled($decision->content) ? (string) $decision->content : '',
                'last_updated' => $decision->updated_at?->format('Y-m-d H:i:s') ?? '',
                'urlAbstrak' => '',
                'urlDetailPeraturan' => "{$baseUrl}/putusan/{$decision->id}",
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
