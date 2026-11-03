# Routes Specification — JDIH Kabupaten Banjarnegara

Dokumen pemetaan seluruh rute aktif, controller, status autentikasi, dan rantai middleware di JDIH Banjarnegara.

## 1. Frontend Routes (Public Portal)

| Route Path | File / Handler | Page Title | Auth | Status |
|---|---|---|---|---|
| `/` | `Closure -> Inertia::render('Home')` | Beranda Portal JDIH | Public | Active |
| `/katalog` | `Closure -> Inertia::render('Hukum/Index')` | Katalog Produk Hukum | Public | Active |
| `/{category:slug}` | `Closure -> Inertia::render('Hukum/DaftarDokumen')` | Daftar Dokumen per Kategori | Public | Active |
| `/dokumen/{id}` | `Closure -> Inertia::render('Hukum/Detail')` | Detail & Metadata Peraturan | Public | Active |
| `/berita` | `Closure -> Inertia::render('Informasi/Berita')` | Berita & Artikel Hukum | Public | Active |
| `/berita/{slug}` | `Closure -> Inertia::render('Informasi/DetailBerita')` | Baca Berita | Public | Active |
| `/visi-misi` s/d `/sop` | `Closure -> Inertia::render('Profil/*')` | Profil & Kelembagaan JDIH | Public | Active |
| `/statistik` | `Closure -> Inertia::render('Statistik')` / Mobile | Statistik & Grafik Produk Hukum, Trafik Pengunjung | Public | Active |
| `/produk-hukum-desa` | `ProdukHukumDesaController@index` | Integrasi Produk Hukum Desa (OpenSID) | Public | Active |
| `/api/produk-hukum-desa` | `ProdukHukumDesaController@proxy` | Reverse-Proxy OpenSID API (`throttle:30,1`, SSRF Guard) | Public | Active |
| `/qrcode` | `Closure -> SVG Stream` | QR Code Generator Aman (SSRF Guard)| Public | Active |
| `/dokumen/{id}/unduh` | `Storage::disk('public')->download($path)` | Unduh Langsung PDF Dokumen / Abstrak | Public | Active |

## 2. Mobile & PWA Routes (`/mobile/*`)

| Route Path | File / Handler | Page Title | Auth | Status |
|---|---|---|---|---|
| `/mobile` | `Closure -> Inertia::render('Mobile/Home')` | Beranda Mobile JDIH (8-Sektor Selang-Seling) | Public | Active |
| `/mobile/pencarian` | `Closure -> Inertia::render('Mobile/Pencarian')` | Pencarian Dokumen & Filter Kategori | Public | Active |
| `/mobile/dokumen/{id}` | `Closure -> Inertia::render('Mobile/DetailDokumen')` | Detail Dokumen + Fitur Pintar AI | Public | Active |
| `/mobile/berita` | `Closure -> Inertia::render('Mobile/Berita')` | Warta Hukum Mobile | Public | Active |
| `/mobile/berita/{slug}` | `Closure -> Inertia::render('Mobile/DetailBerita')` | Baca Berita Mobile | Public | Active |
| `/mobile/produk-hukum-desa` | `ProdukHukumDesaController@index` -> `Mobile/ProdukHukumDesa` | Produk Hukum Desa OpenSID (Unified Action) | Public | Active |
| `/mobile/statistik` | `Closure -> Inertia::render('Mobile/Statistik')` | Visualisasi Data, Tren Regulasi & Trafik Pengunjung | Public | Active |
| `/mobile/info` | `Closure -> Inertia::render('Mobile/InfoJdih')` | Informasi & Profil Interaktif (Accordion) | Public | Active |

## 3. Admin Backoffice Routes (Filament v3)

| Route Path | Handler | Auth Guard | Purpose |
|---|---|---|---|
| `/admin/login` | `Filament\Pages\Auth\Login` | Public (Web Guest) | Login Panel Admin |
| `/admin` | `Filament\Pages\Dashboard` | `auth:web` + `canAccessPanel` | Dashboard Utama Admin |
| `/admin/legal-documents` | `LegalDocumentResource` | `auth:web` | Manajemen Perda, Perbup, SK |
| `/admin/categories` | `CategoryResource` | `auth:web` | Manajemen Kategori Hukum |
| `/admin/news` | `NewsResource` | `auth:web` | Manajemen Berita & Media |
| `/admin/banners` | `BannerResource` | `auth:web` | Manajemen Slider Hero Beranda |
| `/admin/surveys` | `SurveyResource` | `auth:web` | Rekap Survei IKM |
| `/admin/aspirations` | `AspirationResource` | `auth:web` | Manajemen Aspirasi Warga |
| `/admin/activity-logs` | `ActivityLogResource` | `auth:web` | Pemantauan Audit Trail |

## 4. API & Async Routes

| Method | Route Path | Handler | Auth | Purpose |
|---|---|---|---|---|
| `POST` | `/api/chat-ai` | `AiAssistantController@chat` | Public (Rate-limit) | Tanya Jawab AI Hukum |
| `POST` | `/public-consultation` | `Closure -> Store Consultation` | Public | Submit Formulir Aspirasi & Konsultasi |
| `POST` | `/api/ikm` | `Closure -> Store IKM` | Public | Submit Penilaian Survei IKM |
| `GET` | `/api/jdihn/sync` | `Closure -> JDIHN Export` | API Key | Sinkronisasi JDIHN Nasional |

## 5. Middleware Chain

| Middleware | Applied To | Purpose |
|---|---|---|
| `App\Http\Middleware\SecurityHeaders` | Global (All Web Routes) | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| `Illuminate\Routing\Middleware\SubstituteBindings` | Global Web | Route model binding injection |
| `App\Http\Middleware\HandleInertiaRequests` | Web Public | Shared state Inertia (auth user, flash messages) |
| `Filament\Http\Middleware\Authenticate` | `/admin/*` | Verifikasi sesi Filament login & proteksi akses |
