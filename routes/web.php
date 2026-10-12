<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProdukHukumDesaController;
use App\Http\Controllers\AiAssistantController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LegalConsultationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

// ---------------------------------------------------------------
// HOME
// ---------------------------------------------------------------
Route::get('/qrcode', function (\Illuminate\Http\Request $request) {
    $url = $request->get('url', '/');
    
    // Validasi: hanya allow URL eksternal yang aman atau path relatif
    if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://') && !str_starts_with($url, '/')) {
        $url = '/';
    }
    
    // Jika external URL, validate host dari internal network
    if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
        $host = parse_url($url, PHP_URL_HOST);
        $appHost = parse_url(config('app.url'), PHP_URL_HOST);
        if (!$host || !$appHost || strcasecmp($host, $appHost) !== 0 || !filter_var($url, FILTER_VALIDATE_URL)) {
            $url = '/';
        }
    }
    
    // Jika URL path relatif, tambahkan domain aplikasi
    if (str_starts_with($url, '/')) {
        $url = url($url);
    }

    \Illuminate\Support\Facades\Log::info('Generating QR Code for URL: ' . $url);

    try {
        // Cek apakah class facade bisa diakses
        if (!class_exists('\SimpleSoftwareIO\QrCode\Facades\QrCode')) {
            throw new \Exception('QrCode Facade class not found');
        }

        $qrcode = \SimpleSoftwareIO\QrCode\Facades\QrCode::size(150)
            ->format('svg')
            ->margin(1)
            ->generate($url);

        return response($qrcode, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=3600'
        ]);
    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\Log::error('QR Code Error: ' . $e->getMessage());
        
        // Return fallback SVG placeholder
        $fallbackSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#f1f5f9"/><text x="75" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#64748b">QR Error</text></svg>';
        
        return response($fallbackSvg, 200, [
            'Content-Type' => 'image/svg+xml',
            'X-Error' => 'true'
        ]);
    }
})->name('qrcode')->middleware('throttle:30,1');

// ---------------------------------------------------------------
// IKM REPORTS (ADMIN)
// ---------------------------------------------------------------
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/ikm/download', [\App\Http\Controllers\IkmReportController::class, 'download'])->name('admin.ikm.download');
    Route::get('/admin/ikm/print', [\App\Http\Controllers\IkmReportController::class, 'print'])->name('admin.ikm.print');
    Route::get('/admin/laporan-tahunan', function() {
        return Inertia::render('Admin/LaporanTahunan');
    })->name('admin.laporan-tahunan');
    Route::post('/admin/laporan-tahunan', [\App\Http\Controllers\AnnualReportController::class, 'store'])->name('admin.laporan-tahunan.store');
    Route::get('/admin/laporan-tahunan/download', [\App\Http\Controllers\AnnualReportController::class, 'download'])->name('admin.laporan-tahunan.download');
});

Route::post('/public-consultation', [\App\Http\Controllers\PublicConsultationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('public-consultation.store');
Route::post('/aspirations', [\App\Http\Controllers\AspirationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('aspirations.store');

Route::get('/', function () {
    // ⚡ Cache semua query berat — TTL 5 menit untuk konten dinamis, 10 menit untuk statistik
    $latestNews = \Illuminate\Support\Facades\Cache::remember('home.news', 300, function () {
        return \App\Models\News::where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->take(4)
            ->get()
            ->map(function ($article) {
                return [
                    'id'       => $article->id,
                    'slug'     => $article->slug,
                    'title'    => $article->title,
                    'date'     => $article->published_at ? $article->published_at->format('Y-m-d') : null,
                    'category' => $article->category ?? 'Berita',
                    'image'    => $article->image
                        ? (Str::startsWith($article->image, 'images/') ? '/' . $article->image : '/storage/' . $article->image)
                        : '/images/hero.webp',
                ];
            });
    });

    $banners = \Illuminate\Support\Facades\Cache::remember('home.banners', 60, function () {
        return \App\Models\Banner::where('is_active', true)->orderBy('sort_order', 'asc')->get()->map(fn($b) => [
            'id' => $b->id,
            'title' => $b->title,
            'subtitle' => $b->subtitle,
            'description' => $b->description,
            'image' => $b->image_path 
                ? (Str::startsWith($b->image_path, 'images/') ? '/' . $b->image_path : '/storage/' . $b->image_path)
                : '/images/hero.webp',
            'url' => $b->url,
            'show_stats' => $b->show_stats
        ]);
    });

    $infographics = \Illuminate\Support\Facades\Cache::remember('home.infographics', 60, function () {
        return \App\Models\Infographic::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(fn($item) => [
                'id'    => $item->id,
                'title' => $item->title,
                'image' => (Str::startsWith($item->image_path, '/') ? '' : '/storage/') . $item->image_path,
            ]);
    });

    $latestDocs = \Illuminate\Support\Facades\Cache::remember('home.latest_docs', 300, function () {
        return \App\Models\LegalDocument::with('category')
            ->orderBy('year', 'desc')
            ->orderByRaw('CAST(document_number AS UNSIGNED) DESC')
            ->orderBy('document_number', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($doc) {
                $categoryName = $doc->category ? $doc->category->name : 'PERATURAN';
                $categoryCode = $doc->category ? $doc->category->code : 'DOC';
                
                $subject = 'Umum';
                if ($doc->subject) {
                    if (is_array($doc->subject)) {
                        $subject = $doc->subject[0] ?? 'Umum';
                    } else {
                        $decoded = json_decode($doc->subject, true);
                        $subject = (is_array($decoded) && isset($decoded[0])) ? $decoded[0] : 'Umum';
                    }
                }
                
                return [
                    'id'      => $doc->id,
                    'type'    => $categoryName,
                    'code'    => $categoryCode,
                    'number'  => $doc->document_number,
                    'year'    => $doc->year,
                    'title'   => $doc->title,
                    'date'    => $doc->published_at ? $doc->published_at->format('Y-m-d') : null,
                    'subject' => $subject,
                    'slug'    => Str::slug($categoryName),
                ];
            });
    });

    $counts = \Illuminate\Support\Facades\Cache::remember('home.counts', 600, function () {
        $c = \App\Models\LegalDocument::select('category_id', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->mapWithKeys(fn($item) => [
                ($item->category ? $item->category->name : 'Tanpa Kategori') => $item->total
            ])
            ->toArray();
        $c['Putusan'] = \App\Models\LegalDecision::count();
        return $c;
    });

    $videos = \Illuminate\Support\Facades\Cache::remember('home.videos', 60, function () {
        return \App\Models\VideoContent::latest()
            ->take(3)
            ->get()
            ->map(function ($v) {
                $thumb = $v->thumbnail_path;
                if (!$thumb) {
                    if (str_contains($v->title, '54')) {
                        $thumb = 'covers/cover_perbup_54_2025.webp';
                    } elseif (str_contains(strtolower($v->title), 'tutorial')) {
                        $thumb = 'covers/cover_tutorial.webp';
                    } elseif (str_contains(strtolower($v->title), 'koperasi')) {
                        $thumb = 'covers/cover_koperasi.webp';
                    } else {
                        $thumb = 'covers/cover_perbup_54_2025.webp';
                    }
                }
                return [
                    'id'             => $v->id,
                    'title'          => $v->title,
                    'video_url'      => $v->video_url,
                    'thumbnail_path' => $thumb,
                    'image'          => '/images/' . $thumb,
                    'platform'       => $v->platform,
                    'year'           => $v->year,
                    'duration'       => $v->duration,
                ];
            });
    });

    $totalViews = \Illuminate\Support\Facades\Cache::remember('home.total_views', 300, function () {
        return \App\Models\LegalDocument::sum('view_count');
    });

    $publicDialogues = \App\Models\PublicDialogue::where('is_active', true)
        ->orderBy('created_at', 'desc')
        ->get();

    // Data untuk grafik mini di home
    $categories = \App\Models\Category::withCount('legalDocuments')->get();
    $dataJenisMini = $categories->map(fn($cat) => [
        'name'   => $cat->code ?? $cat->name,
        'jumlah' => $cat->legal_documents_count,
    ])->sortByDesc('jumlah')->take(8)->values();

    $dataTahunMini = \App\Models\LegalDocument::selectRaw('year, count(*) as jumlah')
        ->groupBy('year')
        ->orderBy('year', 'desc')
        ->limit(7)
        ->get()
        ->reverse()
        ->values();

    // Deteksi Mobile Sederhana
    $userAgent = request()->header('User-Agent', '');
    $isMobile = preg_match('/Mobile|Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i', $userAgent)
                && !preg_match('/iPad/i', $userAgent); // Anggap iPad sebagai desktop view jika perlu, atau biarkan tetap mobile

    // Override via query string tetap dipertahankan untuk pengujian
    if (request()->query('mode') === 'mobile') $isMobile = true;
    if (request()->query('mode') === 'desktop') $isMobile = false;

    if ($isMobile) {
        return Inertia::render('Mobile/Home', [
            'latestNews'      => collect($latestNews)->map(fn($n) => [
                'id' => $n['id'],
                'slug' => $n['slug'],
                'title' => $n['title'],
                'date' => $n['date'],
                'thumbnail' => $n['image']
            ])->toArray(),
            'infographics'    => $infographics,
            'latestDocs'      => $latestDocs,
            'videos'          => $videos,
            'banners'         => $banners,
            'publicDialogues' => $publicDialogues,
            'dataJenisMini'   => $dataJenisMini,
            'dataTahunMini'   => $dataTahunMini,
            'relatedLinks'    => [
                ['label' => 'Pemkab Banjarnegara', 'href' => 'http://banjarnegarakab.go.id', 'image' => '/images/pemerintah kab .webp'],
                ['label' => 'Kemendagri RI', 'href' => 'http://www.kemendagri.go.id', 'image' => '/images/kemendagri.webp'],
                ['label' => 'JDIHN', 'href' => 'https://www.jdihn.go.id', 'image' => '/images/jdihn.webp'],
            ],
            'stats' => [
                'total' => $totalViews,
                'perda' => $counts['Peraturan Daerah'] ?? 0,
                'perbup' => $counts['Peraturan Bupati'] ?? 0,
            ]
        ]);
    }

    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
        'news'           => $latestNews,
        'infographics'   => $infographics,
        'latestDocs'     => $latestDocs,
        'counts'         => $counts,
        'totalViews'     => $totalViews,
        'videos'         => $videos,
        'banners'        => $banners,
        'publicDialogues'=> $publicDialogues,
        'dataJenisMini'  => $dataJenisMini,
        'dataTahunMini'  => $dataTahunMini,
    ]);
});

// ---------------------------------------------------------------
// PRINT ROUTES (Admin only — hanya untuk user yang login)
// ---------------------------------------------------------------
Route::middleware(['auth'])->prefix('admin-print')->group(function () {

    // Print Produk Hukum
    Route::get('/legal-documents', function (\Illuminate\Http\Request $request) {
        $perPage = max(1, min(500, (int) ($request->per_page ?? 50)));
        $page    = max(1, (int) ($request->page ?? 1));

        $query = \App\Models\LegalDocument::with('category');

        if ($request->title)         $query->where('title', 'like', "%{$request->title}%");
        if ($request->document_number) $query->where('document_number', 'like', "%{$request->document_number}%");
        if ($request->year)          $query->where('year', $request->year);
        if ($request->category_id)   $query->where('category_id', $request->category_id);
        if ($request->status)        $query->where('status', $request->status);
        if ($request->has_file)      $query->whereNotNull('file_path')->where('file_path', '!=', '');

        $total      = $query->count();
        $totalPages = (int) ceil($total / $perPage);
        $offset     = ($page - 1) * $perPage;
        $documents  = $query->orderBy('year', 'desc')->orderBy('document_number', 'desc')
                            ->offset($offset)->limit($perPage)->get();

        $activeFilters = array_filter([
            'Judul'    => $request->title,
            'Nomor'    => $request->document_number,
            'Tahun'    => $request->year,
            'Status'   => $request->status,
            'Ada File' => $request->has_file ? 'Ya' : null,
        ]);

        return view('print.legal-documents', compact('documents', 'total', 'page', 'totalPages', 'offset', 'activeFilters'));
    })->name('admin.print.legal-documents');

    // Print Kategori
    Route::get('/categories', function () {
        $categories = \App\Models\Category::withCount('legalDocuments')->orderBy('name')->get();
        return view('print.categories', compact('categories'));
    })->name('admin.print.categories');

    // Print Putusan Hukum
    Route::get('/legal-decisions', function (\Illuminate\Http\Request $request) {
        $perPage = max(1, min(500, (int) ($request->per_page ?? 50)));
        $page    = max(1, (int) ($request->page ?? 1));

        $query = \App\Models\LegalDecision::query();

        if ($request->title)           $query->where('title', 'like', "%{$request->title}%");
        if ($request->document_number) $query->where('document_number', 'like', "%{$request->document_number}%");
        if ($request->year)            $query->where('year', $request->year);

        $total      = $query->count();
        $totalPages = (int) ceil($total / $perPage);
        $offset     = ($page - 1) * $perPage;
        $decisions  = $query->orderBy('year', 'desc')->offset($offset)->limit($perPage)->get();

        $activeFilters = array_filter([
            'Judul' => $request->title,
            'Nomor' => $request->document_number,
            'Tahun' => $request->year,
        ]);

        return view('print.legal-decisions', compact('decisions', 'total', 'page', 'totalPages', 'offset', 'activeFilters'));
    })->name('admin.print.legal-decisions');

});


// ---------------------------------------------------------------
Route::get('/katalog', function(\Illuminate\Http\Request $request) {
    $query = \App\Models\LegalDocument::with('category');

    $query->when($request->namaDokumen ?? $request->q, function($q, $val) {
        $keywords = explode(' ', $val);
        foreach ($keywords as $keyword) {
            if (empty($keyword)) continue;
            $q->where(function($sq) use ($keyword) {
                $sq->where('title', 'like', '%' . $keyword . '%')
                   ->orWhere('document_number', 'like', '%' . $keyword . '%')
                   ->orWhere('year', 'like', '%' . $keyword . '%')
                   ->orWhere('subject', 'like', '%' . $keyword . '%')
                   ->orWhere('abbreviation', 'like', '%' . $keyword . '%')
                   ->orWhereHas('category', function($cq) use ($keyword) {
                       $cq->where('name', 'like', '%' . $keyword . '%')
                          ->orWhere('code', 'like', '%' . $keyword . '%');
                   });
            });
        }
    });

    $query->when($request->nomor, function($q, $val) {
        $q->where('document_number', 'like', '%' . $val . '%');
    });

    $query->when($request->tahun, function($q, $val) {
        $q->where('year', $val);
    });

    $query->when($request->status, function($q, $val) {
        $q->where('status', $val);
    });

    $documents = $query->orderBy('year', 'desc')
        ->orderByRaw('CAST(document_number AS UNSIGNED) DESC')
        ->orderBy('document_number', 'desc')
        ->paginate(12)
        ->withQueryString()
        ->through(fn($doc) => [
            'id' => $doc->id,
            'number' => $doc->document_number,
            'nomor' => $doc->document_number,
            'title' => $doc->title,
            'year' => $doc->year,
            'date' => $doc->published_at ? $doc->published_at->format('Y-m-d') : $doc->created_at->format('Y-m-d'),
            'status' => $doc->status,
            'type' => $doc->category->name ?? 'Dokumen',
            'slug' => $doc->category->slug ?? 'katalog',
            'subject' => $doc->subject,
        ]);

    return Inertia::render('Hukum/DaftarDokumen', [
        'kategori' => 'katalog',
        'title'    => 'Katalog Dokumen',
        'code'     => 'CATALOG',
        'documents' => $documents,
        'filters'   => [
            'namaDokumen' => $request->namaDokumen ?? $request->q,
            'nomor'       => $request->nomor,
            'tahun'       => $request->tahun,
            'status'      => $request->status,
        ],
    ]);
});

// ---------------------------------------------------------------
// PROFIL
// ---------------------------------------------------------------
Route::get('/visi-misi', function() {
    return Inertia::render('Profil/VisiMisi', [
        'item' => \App\Models\ProfileItem::where('slug', 'visi-misi')->first()
    ]);
});
Route::get('/dasar-hukum', function() {
    return Inertia::render('Profil/DasarHukum', [
        'item' => \App\Models\ProfileItem::where('slug', 'dasar-hukum')->first()
    ]);
});
Route::get('/struktur-organisasi', function() {
    return Inertia::render('Profil/StrukturOrganisasi', [
        'item' => \App\Models\ProfileItem::where('slug', 'struktur-organisasi')->first()
    ]);
});
Route::get('/tupoksi-bag-hukum', function() {
    return Inertia::render('Profil/Tupoksi', [
        'item' => \App\Models\ProfileItem::where('slug', 'tupoksi')->first()
    ]);
});
Route::get('/anggota-jdih', function() {
    $members = \App\Models\JdihMember::orderBy('sort_order')->orderBy('id')->get()
        ->map(fn($m) => [
            'id'       => $m->id,
            'nama'     => $m->name,
            'url'      => $m->url,
            'kategori' => $m->category ?? 'Perangkat Daerah',
            'position' => $m->position,
        ]);
    return Inertia::render('Profil/AnggotaJdih', [
        'members' => $members
    ]);
});
Route::get('/kedudukan-dan-alamat', function() {
    return Inertia::render('Profil/KedudukanAlamat', [
        'item' => \App\Models\ProfileItem::where('slug', 'kedudukan-alamat')->first()
    ]);
});
Route::get('/sop', function() {
    return Inertia::render('Profil/Sop', [
        'item' => \App\Models\ProfileItem::where('slug', 'sop')->first()
    ]);
});
Route::get('/sarana-prasarana', function() {
    $infrastructures = [
        'ruangan' => \App\Models\Infrastructure::byCategory('ruangan')->active()->get()->map(fn($i) => $i->toArray())->toArray(),
        'perangkat_keras' => \App\Models\Infrastructure::byCategory('perangkat_keras')->active()->get()->map(fn($i) => $i->toArray())->toArray(),
        'perangkat_lunak' => \App\Models\Infrastructure::byCategory('perangkat_lunak')->active()->get()->map(fn($i) => $i->toArray())->toArray(),
        'jaringan' => \App\Models\Infrastructure::byCategory('jaringan')->active()->get()->map(fn($i) => $i->toArray())->toArray(),
    ];
    return Inertia::render('Profil/SaranaPrasarana', ['infrastructures' => $infrastructures]);
});

// ---------------------------------------------------------------
// KHUSUS PUTUSAN & KERJASAMA
// ---------------------------------------------------------------
Route::get('/putusan', function(\Illuminate\Http\Request $request) {
    $query = \App\Models\LegalDecision::where('is_published', true);
    
    $query->when($request->namaDokumen ?? $request->q, function($q, $val) {
        $q->where('title', 'like', '%' . $val . '%');
    });

    $query->when($request->nomor, function($q, $val) {
        $q->where('document_number', 'like', '%' . $val . '%');
    });

    $query->when($request->tahun, function($q, $val) {
        $q->where('year', $val);
    });

    $documents = $query->orderBy('year', 'desc')
        ->orderBy('document_number', 'desc')
        ->paginate(10)
        ->withQueryString()
        ->through(fn($doc) => [
            'id' => $doc->id,
            'nomor' => $doc->document_number,
            'title' => $doc->title,
            'year' => $doc->year,
            'court_type' => $doc->court_type,
            'status' => $doc->status,
            'jenis' => $doc->court_type ?? 'Putusan',
            'tanggal' => $doc->created_at->format('Y-m-d'),
            'abstrak' => Str::limit(strip_tags($doc->content), 200) ?: 'Putusan pengadilan terkait perkara hukum di wilayah Kabupaten Banjarnegara.',
        ]);

    return Inertia::render('Hukum/Putusan', [
        'documents' => $documents,
        'filters' => $request->all(),
    ]);
});

Route::get('/kerja-sama-daerah', function(\Illuminate\Http\Request $request) {
    $cat = \App\Models\Category::where('slug', 'kerja-sama-daerah')->firstOrFail();
    $query = \App\Models\LegalDocument::where('category_id', $cat->id);
    
    $documents = $query->latest('published_at')
        ->get()
        ->map(fn($doc) => [
            'id' => $doc->id,
            'nomor' => $doc->document_number,
            'judul' => $doc->title,
            'pihak' => $doc->entity ?? 'Pemerintah Kabupaten Banjarnegara',
            'jenis' => $doc->document_type ?? 'Kerja Sama',
            'tanggal' => $doc->published_at?->format('Y-m-d') ?? $doc->created_at->format('Y-m-d'),
        ]);

    return Inertia::render('Hukum/KerjaSama', [
        'documents' => $documents,
    ]);
});

// ---------------------------------------------------------------
// LAYANAN HUKUM & LAINNYA
// ---------------------------------------------------------------
Route::get('/bantuan-hukum', fn() => Inertia::render('Layanan/BantuanHukum'))->name('layanan.bankum');
Route::get('/konsultasi-hukum', fn() => Inertia::render('Layanan/KonsultasiHukum'))->name('layanan.konsultasi');
Route::post('/konsultasi-hukum', [LegalConsultationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('layanan.konsultasi.store');
Route::get('/bankum', fn() => redirect('/bantuan-hukum'));

Route::get('/produk-hukum-desa',       [ProdukHukumDesaController::class, 'index']);
Route::get('/api/produk-hukum-desa',   [ProdukHukumDesaController::class, 'proxy'])
    ->middleware('throttle:30,1');

// Dialog Publik & Aspirasi
Route::get('/dialog-publik', [\App\Http\Controllers\PublicDialogueController::class, 'index'])->name('dialog-publik.index');
Route::get('/dialog-publik/{slug}', [\App\Http\Controllers\PublicDialogueController::class, 'show'])->name('dialog-publik.show');
Route::post('/dialog-publik/{id}/respond', [\App\Http\Controllers\PublicDialogueController::class, 'storeResponse'])
    ->middleware('throttle:10,1') // 10 requests per minute
    ->name('dialog-publik.respond');

Route::post('/ai/ask', [AiAssistantController::class, 'ask'])
    ->middleware('throttle:20,1') // 20 requests per minute (AI lebih mahal)
    ->name('ai.ask');
Route::post('/comments', [CommentController::class, 'store'])
    ->middleware('throttle:30,1') // 30 requests per minute
    ->name('comments.store');
Route::post('/community-satisfaction', [\App\Http\Controllers\CommunitySatisfactionController::class, 'store'])
    ->middleware('throttle:5,1') // 5 requests per minute (survey)
    ->name('ikm.store');

// ---------------------------------------------------------------
// INFORMASI
// ---------------------------------------------------------------
Route::get('/statistik', function () {
    $categories = \App\Models\Category::withCount('legalDocuments')->get();

    $dataJenis = $categories->map(fn($cat) => [
        'name'   => $cat->name,
        'short'  => $cat->code,
        'jumlah' => $cat->legal_documents_count,
        'href'   => "/{$cat->slug}",
        'color'  => '#0d9488'
    ]);

    // ⚡ Putusan disimpan di tabel terpisah (legal_decisions), tambahkan manual
    $putusanCount = \App\Models\LegalDecision::count();
    if ($putusanCount > 0) {
        $dataJenis->push([
            'name'   => 'Putusan Pengadilan',
            'short'  => 'PUT',
            'jumlah' => $putusanCount,
            'href'   => '/putusan',
            'color'  => '#0d9488'
        ]);
    }

    $dataTahun = \App\Models\LegalDocument::selectRaw('year, count(*) as jumlah')
        ->groupBy('year')
        ->orderBy('year', 'desc')
        ->limit(11)
        ->get()
        ->reverse()
        ->values();

    $dataPie = $dataJenis->sortByDesc('jumlah')->take(4)->values();
    $othersCount = $dataJenis->sortByDesc('jumlah')->slice(4)->sum('jumlah');

    if ($othersCount > 0) {
        $dataPie->push([
            'name'  => 'Lainnya',
            'value' => $othersCount,
            'color' => '#94a3b8'
        ]);
    }

    $ikm = \App\Models\CommunitySatisfaction::all();
    $ikmScore = 0;
    if ($ikm->count() > 0) {
        $totalIkm = 0; $countIkm = 0;
        foreach ($ikm as $r) {
            foreach (['u1','u2','u3','u4','u5','u6','u7','u8','u9'] as $u) {
                if ($r->$u) { $totalIkm += $r->$u; $countIkm++; }
            }
        }
        $ikmScore = $countIkm > 0 ? round(($totalIkm / $countIkm) * 25, 2) : 0;
    }

    $processedDataJenis = $dataJenis->values();
    $processedDataPie = $dataPie->map(fn($item) => [
        'name'  => $item['name'],
        'value' => $item['jumlah'] ?? $item['value'],
        'color' => $item['color']
    ]);
    $totalCount = $dataJenis->sum('jumlah');

    // Deteksi Mobile
    $userAgent = request()->header('User-Agent', '');
    $isMobile = preg_match('/Mobile|Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i', $userAgent) || request()->query('mode') === 'mobile';

    if ($isMobile) {
        return Inertia::render('Mobile/Statistik', [
            'dataJenis' => $processedDataJenis,
            'dataTahun' => $dataTahun,
            'dataPie'   => $processedDataPie,
            'total'     => $totalCount,
            'ikmScore'  => $ikmScore
        ]);
    }

    return Inertia::render('Statistik', [
        'dataJenis' => $processedDataJenis,
        'dataTahun' => $dataTahun,
        'dataPie'   => $processedDataPie,
        'total'     => $totalCount,
        'ikmScore'  => $ikmScore
    ]);
});


Route::get('/berita',          function() {
    return Inertia::render('Informasi/Berita', [
        'news' => \App\Models\News::latest()->paginate(9)
    ]);
});

// Legacy News Redirect
Route::get('/artikel/detail/{slug}', function($slug) {
    return redirect()->route('berita.detail', ['slug' => $slug]);
});
// Renderer Detail Berita Mobile (dipakai route /mobile/berita/{slug} dan route desktop saat UA mobile)
$renderMobileBeritaDetail = function ($slug) {
    $prefixImage = function ($path) {
        if (!$path) return null;
        if (\Illuminate\Support\Str::startsWith($path, 'http')) return $path;
        return \Illuminate\Support\Str::startsWith($path, 'images/') ? '/' . $path : '/storage/' . $path;
    };

    $post = \App\Models\News::where('status', 'published')
        ->where(function ($q) use ($slug) {
            $q->where('slug', $slug);
            if (is_numeric($slug)) {
                $q->orWhere('id', $slug);
            }
        })
        ->firstOrFail();

    $related = \App\Models\News::where('status', 'published')
        ->where('id', '!=', $post->id)
        ->latest('published_at')
        ->take(4)
        ->get()
        ->map(fn($n) => [
            'id'        => $n->id,
            'slug'      => $n->slug,
            'title'     => $n->title,
            'date'      => $n->published_at ? $n->published_at->translatedFormat('d F Y') : '-',
            'thumbnail' => $prefixImage($n->image),
            'category'  => $n->category ?? 'Berita',
        ]);

    return Inertia::render('Mobile/DetailBerita', [
        'post' => [
            'id'       => $post->id,
            'slug'     => $post->slug,
            'title'    => $post->title,
            'content'  => $post->content,
            'category' => $post->category ?? 'Berita',
            'date'     => $post->published_at ? $post->published_at->translatedFormat('d F Y') : '-',
            'image'    => $prefixImage($post->image),
        ],
        'related' => $related,
    ]);
};

Route::get('/berita/{slug}', function($slug) use ($renderMobileBeritaDetail) {
    // Deteksi Mobile
    $userAgent = request()->header('User-Agent', '');
    $isMobile = preg_match('/Mobile|Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i', $userAgent);
    if (request()->query('mode') === 'mobile') $isMobile = true;
    if (request()->query('mode') === 'desktop') $isMobile = false;

    if ($isMobile) {
        return $renderMobileBeritaDetail($slug);
    }

    $post = \App\Models\News::where('slug', $slug)->firstOrFail();
    $related = \App\Models\News::where('id', '!=', $post->id)
        ->where('status', 'published')
        ->latest()
        ->take(4)
        ->get();

    return Inertia::render('Informasi/DetailBerita', [
        'post' => $post,
        'relatedNews' => $related
    ]);
})->name('berita.detail');
Route::get('/galeri', function() {
    $items = \App\Models\GalleryItem::latest('date')
        ->get()
        ->map(fn($item) => [
            'id' => $item->id,
            'title' => $item->title,
            'image' => asset('storage/' . $item->image_path),
            'date' => $item->date ? $item->date->format('Y-m-d') : null,
        ]);

    return Inertia::render('Informasi/Galeri', [
        'items' => $items
    ]);
});
Route::get('/video', function() {
    $items = \App\Models\VideoContent::latest()
        ->get()
        ->map(fn($item) => [
            'id' => $item->id,
            'title' => $item->title,
            'video_url' => $item->video_url,
            'thumbnail_path' => $item->thumbnail_path,
            'platform' => $item->platform,
            'year' => $item->year,
            'duration' => $item->duration,
            'description' => $item->description,
        ]);

    return Inertia::render('Informasi/Video', [
        'items' => $items
    ]);
});
Route::get('/unduh', function () {
    return Inertia::render('Informasi/Download', [
        'files' => \App\Models\KatalogDownload::orderBy('created_at', 'desc')->get()
    ]);
})->name('unduh');

// ---------------------------------------------------------------
// TRACKING & PROFILE
// ---------------------------------------------------------------
Route::get('/dokumen/{id}/unduh', function (int $id) {
    $document = \App\Models\LegalDocument::findOrFail($id);
    if (!$document->file_path) abort(404);
    $document->increment('download_count');
    return redirect()->away(Storage::disk('public')->url($document->file_path));
})->name('dokumen.unduh');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get("/putusan/{id}", function(int $id) {
    $doc = \App\Models\LegalDecision::findOrFail($id);
    return Inertia::render('Hukum/DetailPutusan', [
        'document' => $doc
    ]);
});

// ---------------------------------------------------------------
// MOBILE APP ROUTES
// ---------------------------------------------------------------
Route::prefix('mobile')->group(function () use ($renderMobileBeritaDetail) {

    // Landing Mobile
    Route::get('/', function () {
        $latestNews = \Illuminate\Support\Facades\Cache::remember('home.news', 300, function () {
            return \App\Models\News::where('status', 'published')
                ->orderBy('published_at', 'desc')->take(4)->get()
                ->map(fn($a) => [
                    'id'        => $a->id,
                    'slug'      => $a->slug,
                    'title'     => $a->title,
                    'date'      => $a->published_at?->format('d M Y'),
                    'thumbnail' => $a->image ? (\Illuminate\Support\Str::startsWith($a->image, 'images/') ? '/'.$a->image : '/storage/'.$a->image) : null,
                ]);
        });
        $latestDocs = \Illuminate\Support\Facades\Cache::remember('home.latest_docs', 300, function () {
            return \App\Models\LegalDocument::with('category')->orderBy('year','desc')
                ->orderByRaw('CAST(document_number AS UNSIGNED) DESC')->limit(5)->get()
                ->map(fn($d) => ['id'=>$d->id,'type'=>$d->category->name??'PERATURAN','code'=>$d->category->code??'DOC','number'=>$d->document_number,'year'=>$d->year,'title'=>$d->title,'slug'=>$d->category->slug??'katalog']);
        });
        $counts = \Illuminate\Support\Facades\Cache::remember('home.counts', 600, function () {
            $c = \App\Models\LegalDocument::select('category_id',\Illuminate\Support\Facades\DB::raw('count(*) as total'))->groupBy('category_id')->with('category')->get()->mapWithKeys(fn($i)=>[$i->category->name??'unknown'=>$i->total])->toArray();
            $c['Putusan'] = \App\Models\LegalDecision::count();
            return $c;
        });
        $videos = \Illuminate\Support\Facades\Cache::remember('home.videos', 600, fn() =>
            \App\Models\VideoContent::latest()->take(3)->get()->map(fn($v)=>['id'=>$v->id,'title'=>$v->title,'href'=>$v->video_url,'image'=>$v->thumbnail_path?'/storage/'.$v->thumbnail_path:null])
        );
        $infographics = \Illuminate\Support\Facades\Cache::remember('home.infographics', 600, function () {
            return \App\Models\Infographic::latest()->take(5)->get()
                ->map(fn($i) => [
                    'id'    => $i->id,
                    'title' => $i->title,
                    'image' => $i->image_path ? (\Illuminate\Support\Str::startsWith($i->image_path, 'infographics/') ? '/storage/'.$i->image_path : $i->image_path) : null,
                ]);
        });
        return Inertia::render('Mobile/Home', [
            'latestNews'   => $latestNews,
            'latestDocs'   => $latestDocs,
            'videos'       => $videos,
            'infographics' => $infographics,
            'relatedLinks' => [],
            'stats'        => ['total'=>array_sum($counts),'perda'=>$counts['Peraturan Daerah']??0,'perbup'=>$counts['Peraturan Bupati']??0],
        ]);
    })->name('mobile.home');

    // Pencarian Dokumen
    Route::get('/pencarian', function (\Illuminate\Http\Request $request) {
        $categories = \App\Models\Category::orderBy('name')->get()->map(fn($c)=>['id'=>$c->id,'name'=>$c->name,'slug'=>$c->slug,'code'=>$c->code??'']);
        $query = \App\Models\LegalDocument::with('category');
        if ($request->q) {
            foreach (explode(' ', $request->q) as $kw) {
                if (!$kw) continue;
                $query->where(fn($q)=>$q->where('title','like',"%$kw%")->orWhere('document_number','like',"%$kw%")->orWhere('subject','like',"%$kw%"));
            }
        }
        if ($request->kategori) { $cat=\App\Models\Category::where('slug',$request->kategori)->first(); if($cat) $query->where('category_id',$cat->id); }
        if ($request->tahun)    $query->where('year',$request->tahun);
        $documents = $query->orderBy('year','desc')->orderByRaw('CAST(document_number AS UNSIGNED) DESC')
            ->paginate(10)->withQueryString()
            ->through(fn($d)=>['id'=>$d->id,'type'=>$d->category->name??'Dokumen','code'=>$d->category->code??'DOC','slug'=>$d->category->slug??'katalog','number'=>$d->document_number,'year'=>$d->year,'title'=>$d->title,'status'=>$d->status,'has_file'=>!empty($d->file_path)]);
        $years = \App\Models\LegalDocument::selectRaw('year')->distinct()->orderBy('year','desc')->pluck('year');
        return Inertia::render('Mobile/Pencarian', ['documents'=>$documents,'categories'=>$categories,'years'=>$years,'filters'=>['q'=>$request->q,'kategori'=>$request->kategori,'tahun'=>$request->tahun]]);
    })->name('mobile.pencarian');

    // Detail Dokumen
    Route::get('/dokumen/{id}', function (int $id) {
        $doc = \App\Models\LegalDocument::with('category')->findOrFail($id);
        $doc->increment('view_count');
        $doc->refresh();
        return Inertia::render('Mobile/DetailDokumen', ['document'=>[
            'id'                      => $doc->id,
            'title'                   => $doc->title,
            'number'                  => $doc->document_number,
            'year'                    => $doc->year,
            'type'                    => $doc->category->name ?? 'Dokumen',
            'code'                    => $doc->category->code ?? 'DOC',
            'slug'                    => $doc->category->slug ?? 'katalog',
            'status'                  => $doc->status,
            'status_note'             => $doc->status_note,
            'date'                    => $doc->published_at ? $doc->published_at->format('d F Y') : null,
            'promulgated_at'          => $doc->promulgated_at ? $doc->promulgated_at->format('d F Y') : null,
            'place_of_enactment'      => $doc->place_of_enactment,
            'subject'                 => $doc->subject,
            'abstract'                => strip_tags($doc->abstract ?? ''),
            'related_regulations_text'=> strip_tags($doc->related_regulations_text ?? ''),
            'implementing_regulations'=> strip_tags($doc->implementing_regulations ?? ''),
            'teu'                     => $doc->teu,
            'abbreviation'            => $doc->abbreviation,
            'entity'                  => $doc->entity,
            'signer'                  => $doc->signer,
            'initiator'               => $doc->initiator,
            'source'                  => $doc->source,
            'govt_field'              => $doc->govt_field,
            'legal_field'             => $doc->legal_field,
            'document_type'           => $doc->document_type,
            'language'                => $doc->language,
            'page_count'              => $doc->page_count,
            'location'                => $doc->location,
            'has_file'                => !empty($doc->file_path),
            'has_abstract_file'       => !empty($doc->abstract_file_path),
            'view_count'              => $doc->view_count,
            'download_count'          => $doc->download_count,
        ]]);
    })->whereNumber('id')->name('mobile.dokumen');

    // Berita
    Route::get('/berita', function (\Illuminate\Http\Request $request) {
        $news = \App\Models\News::where('status','published')
            ->when($request->q,fn($q,$v)=>$q->where('title','like',"%$v%"))
            ->orderBy('published_at','desc')->paginate(12)->withQueryString()
            ->through(fn($a)=>['id'=>$a->id,'slug'=>$a->slug,'title'=>$a->title,'date'=>$a->published_at?$a->published_at->format('d M Y'):null,'category'=>$a->category??'Berita','thumbnail'=>$a->image?(Str::startsWith($a->image,'images/')?'/'.$a->image:'/storage/'.$a->image):null,'excerpt'=>Str::limit(strip_tags($a->content??''),100)]);
        return Inertia::render('Mobile/Berita', ['news'=>$news,'filters'=>['q'=>$request->q]]);
    })->name('mobile.berita');

    // Detail Berita
    Route::get('/berita/{slug}', $renderMobileBeritaDetail)->name('mobile.berita.detail');

    // Info JDIH
    Route::get('/info', fn() => Inertia::render('Mobile/InfoJdih'))->name('mobile.info');
});

Route::get("/{category:slug}", function(string $slug, \Illuminate\Http\Request $request) {
    $cat = \App\Models\Category::where('slug', $slug)->first();
    if (!$cat) abort(404);

    $query = \App\Models\LegalDocument::where('category_id', $cat->id);

    $query->when($request->namaDokumen ?? $request->q, function($q, $val) {
        $keywords = explode(' ', $val);
        foreach ($keywords as $keyword) {
            if (empty($keyword)) continue;
            $q->where(function($sq) use ($keyword) {
                $sq->where('title', 'like', '%' . $keyword . '%')
                   ->orWhere('document_number', 'like', '%' . $keyword . '%')
                   ->orWhere('year', 'like', '%' . $keyword . '%')
                   ->orWhere('subject', 'like', '%' . $keyword . '%')
                   ->orWhere('abbreviation', 'like', '%' . $keyword . '%');
            });
        }
    });

    $query->when($request->nomor, function($q, $val) {
        $q->where('document_number', 'like', '%' . $val . '%');
    });

    $query->when($request->tahun, function($q, $val) {
        $q->where('year', $val);
    });

    $query->when($request->status, function($q, $val) {
        $q->where('status', $val);
    });

    $documents = $query->orderBy('year', 'desc')
        ->orderByRaw('CAST(document_number AS UNSIGNED) DESC')
        ->orderBy('document_number', 'desc')
        ->paginate(10)
        ->withQueryString()
        ->through(fn($doc) => [
            'id' => $doc->id,
            'number' => $doc->document_number,
            'nomor' => $doc->document_number,
            'title' => $doc->title,
            'year' => $doc->year,
            'date' => $doc->published_at?->format('Y-m-d') ?? $doc->created_at->format('Y-m-d'),
            'status' => $doc->status,
            'subject' => $doc->subject,
            'file_path' => $doc->file_path,
        ]);

    return Inertia::render('Hukum/DaftarDokumen', [
        'kategori' => $slug,
        'title'    => $cat->name,
        'code'     => $cat->code,
        'documents' => $documents,
        'filters'   => [
            'namaDokumen' => $request->namaDokumen ?? $request->q,
            'nomor'       => $request->nomor,
            'tahun'       => $request->tahun,
            'status'      => $request->status,
        ],
    ]);
});

Route::get("/{category:slug}/{id}", function(string $slug, int $id) {
    $doc = \App\Models\LegalDocument::with([
        'category', 
        'comments' => fn($q) => $q->where('is_approved', true)->latest(), 
        'relatedDocuments.category', 
        'referencedByDocuments.category'
    ])->findOrFail($id);
    
    $doc->increment('view_count');
    $doc->refresh();
    
    $popular = \App\Models\LegalDocument::with('category')
        ->orderBy('view_count', 'desc')
        ->take(5)
        ->get()
        ->map(fn($p) => [
            'id' => $p->id,
            'slug' => $p->category->slug ?? 'katalog',
            'type' => $p->category->name ?? 'Dokumen',
            'number' => $p->document_number,
            'year' => $p->year,
            'title' => $p->title,
        ]);

    return Inertia::render('Hukum/DetailDokumen', [
        'document' => $doc,
        'kategori' => $slug,
        'popular'  => $popular
    ]);
})->whereNumber('id');

// ---------------------------------------------------------------
// JDIHN INTEGRATION API
// ---------------------------------------------------------------
Route::prefix('api/jdihn')->middleware(['auth', 'throttle:60,1'])->group(function () {
    // Sync endpoints
    Route::post('/sync/documents', [App\Http\Controllers\Api\JdihSyncController::class, 'syncDocuments'])
        ->name('api.jdihn.sync.documents');
    Route::post('/sync/members', [App\Http\Controllers\Api\JdihSyncController::class, 'syncMembers'])
        ->name('api.jdihn.sync.members');
    
    // Settings
    Route::get('/settings', [App\Http\Controllers\Api\JdihSyncController::class, 'getSettings'])
        ->name('api.jdihn.settings');
    Route::post('/settings', [App\Http\Controllers\Api\JdihSyncController::class, 'updateSettings'])
        ->name('api.jdihn.settings.update');
    
    // Logs
    Route::get('/sync-logs', [App\Http\Controllers\Api\JdihSyncController::class, 'getSyncLogs'])
        ->name('api.jdihn.sync-logs');
});

