<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ProdukHukumDesaController extends Controller
{
    /**
     * Display the Village Legal Products page.
     */
    public function index()
    {
        $villages = \App\Models\Village::where('is_active', true)
            ->orderBy('kecamatan')
            ->orderBy('name')
            ->get()
            ->groupBy('kecamatan')
            ->map(function ($items, $kec) {
                return [
                    'kecamatan' => $kec,
                    'desa' => $items->map(fn($v) => [
                        'name' => $v->name,
                        'url' => $v->url
                    ])
                ];
            })
            ->values();

        $userAgent = request()->header('User-Agent', '');
        $isMobile = preg_match('/Mobile|Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i', $userAgent) 
                    || request()->query('mode') === 'mobile' 
                    || request()->is('mobile/*');

        if ($isMobile) {
            return Inertia::render('Mobile/ProdukHukumDesa', [
                'villagesMapping' => $villages
            ]);
        }

        return Inertia::render('Hukum/ProdukHukumDesa', [
            'villagesMapping' => $villages
        ]);
    }

    /**
     * Proxy request to fetch data from village OpenSID API.
     * SSRF Prevention: Only allows registered villages, blocks private IPs, whitelists endpoints.
     */
    public function proxy(Request $request)
    {
        $villageUrl = $request->query('url');
        $endpoint = $request->query('endpoint', '/internal_api/produk-hukum');

        if (!$villageUrl) {
            return response()->json(['error' => 'Village URL is required'], 400);
        }

        // SSRF Prevention #1: Only allow URLs registered in the database (whitelist approach)
        // Normalisasi trailing slash: "https://desa.id" dan "https://desa.id/" dianggap sama
        $village = \App\Models\Village::where('is_active', true)
            ->where(function ($q) use ($villageUrl) {
                $q->where('url', $villageUrl)
                  ->orWhere('url', rtrim($villageUrl, '/') . '/')
                  ->orWhere('url', rtrim($villageUrl, '/'));
            })
            ->first();

        if (!$village) {
            return response()->json(['error' => 'URL desa tidak terdaftar atau tidak valid.'], 403);
        }

        // SSRF Prevention #2: Block private/internal IP addresses after DNS resolution
        $parsedUrl = parse_url($villageUrl);
        $host = $parsedUrl['host'] ?? '';

        if ($this->isPrivateOrInternalIp($host)) {
            return response()->json(['error' => 'Akses ke IP privat/internal tidak diizinkan.'], 403);
        }

        // SSRF Prevention #3: Whitelist allowed endpoints to prevent path traversal
        // Sub-path dari endpoint yang diizinkan juga boleh (mis. produk-hukum/kategori)
        $normalizedEndpoint = trim($endpoint, '/');
        $allowedEndpoints = [
            'internal_api/produk-hukum',
            'internal_api/informasi-umum',
            'internal_api/transparansi-publik',
        ];

        $isAllowedEndpoint = false;
        foreach ($allowedEndpoints as $allowed) {
            if ($normalizedEndpoint === $allowed || strpos($normalizedEndpoint, $allowed . '/') === 0) {
                $isAllowedEndpoint = true;
                break;
            }
        }

        if (!$isAllowedEndpoint) {
            return response()->json(['error' => 'Endpoint tidak diizinkan.'], 403);
        }

        try {
            $query = $request->except(['url', 'endpoint']);
            // Add timeout and limit connection to avoid slow loris attacks
            $response = Http::timeout(10)
                ->withOptions(['verify' => false])
                ->get($villageUrl . '/' . $normalizedEndpoint, $query);

            $data = $response->json();

            // Apply filtering and prioritization for document list endpoint
            if ($normalizedEndpoint === 'internal_api/produk-hukum' && isset($data['data'])) {
                $filteredData = collect($data['data'])->filter(function ($item) {
                    $title = strtoupper($item['attributes']['nama'] ?? '');
                    $category = strtoupper($item['attributes']['kategori'] ?? '');

                    // Privacy Filter: Hide SK (Surat Keputusan) documents
                    $isSK = (strpos($title, 'SK ') !== false) ||
                            (strpos($title, 'SK-') !== false) ||
                            (strpos($title, ' SK') !== false) ||
                            ($title === 'SK') ||
                            (strpos($category, 'SK') !== false);

                    return !$isSK;
                })->values();

                // Prioritization: Move "Perkades" to the top
                $sortedData = $filteredData->sort(function ($a, $b) {
                    $titleA = strtolower($a['attributes']['nama'] ?? '');
                    $titleB = strtolower($b['attributes']['nama'] ?? '');

                    $keywords = ['perkades', 'peraturan kepala desa', 'peraturan kades'];
                    $hasKeywordA = false;
                    $hasKeywordB = false;

                    foreach ($keywords as $kw) {
                        if (strpos($titleA, $kw) !== false) $hasKeywordA = true;
                        if (strpos($titleB, $kw) !== false) $hasKeywordB = true;
                    }

                    if ($hasKeywordA && !$hasKeywordB) return -1;
                    if (!$hasKeywordA && $hasKeywordB) return 1;

                    return 0;
                })->values()->all();

                $data['data'] = $sortedData;
            }

            return response()->json($data, $response->status());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data dari server desa.'], 502);
        }
    }

    /**
     * Check if a hostname resolves to a private or internal IP address.
     */
    protected function isPrivateOrInternalIp(string $host): bool
    {
        // Block localhost variations
        $localhostVariants = ['localhost', 'localhost.localdomain'];
        if (in_array(strtolower($host), $localhostVariants)) {
            return true;
        }

        // Resolve hostname to IP
        $ip = gethostbyname($host);
        if ($ip === $host) {
            // DNS resolution failed
            return true;
        }

        // Block all private/reserved IPv4 ranges
        $privateRanges = [
            '10.0.0.0/8',
            '100.64.0.0/10',
            '127.0.0.0/8',
            '169.254.0.0/16',
            '172.16.0.0/12',
            '192.0.0.0/24',
            '192.0.2.0/24',
            '192.88.99.0/24',
            '192.168.0.0/16',
            '198.18.0.0/15',
            '198.51.100.0/24',
            '203.0.113.0/24',
            '224.0.0.0/4',
            '240.0.0.0/4',
        ];

        foreach ($privateRanges as $range) {
            if ($this->ipInRange($ip, $range)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if an IPv4 address is within a CIDR range.
     */
    protected function ipInRange(string $ip, string $range): bool
    {
        [$subnet, $bits] = explode('/', $range);
        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);
        $mask = -1 << (32 - (int)$bits);

        return ($ipLong & $mask) === ($subnetLong & $mask);
    }
}
