# Routes Specification — JDIH Kabupaten Banjarnegara

Dokumen pemetaan seluruh rute aktif, controller, status autentikasi, dan rantai middleware di JDIH Banjarnegara.

## 1. Frontend Routes (Public Portal)

| Route Path | File / Handler | Page Title | Auth | Status |
|---|---|---|---|---|
| `/` | `Closure -> Inertia::render('Home')` | Beranda Portal JDIH | Public | Active |
| `/peraturan` | `Closure -> Inertia::render('Peraturan/Index')` | Katalog Produk Hukum | Public | Active |
| `/peraturan/{id}` | `Closure -> Inertia::render('Peraturan/Show')` | Detail & Unduh Peraturan | Public | Active |
| `/berita` | `Closure -> Inertia::render('Berita/Index')` | Berita & Artikel Hukum | Public | Active |
| `/berita/{slug}` | `Closure -> Inertia::render('Berita/Show')` | Baca Berita | Public | Active |
| `/profil` | `Closure -> Inertia::render('Profil/Index')` | Profil JDIH Banjarnegara | Public | Active |
| `/statistik` | `Closure -> Inertia::render('Statistik/Index')` | Statistik & Grafik Produk Hukum | Public | Active |
| `/aspirasi` | `Closure -> Inertia::render('Aspirasi/Index')` | Forum Konsultasi & Aspirasi | Public | Active |
| `/desa` | `ProdukHukumDesaController@index` | Integrasi Produk Hukum Desa | Public | Active |
| `/qrcode` | `Closure -> SVG Stream` | QR Code Generator Aman (SSRF Guard)| Public | Active |
| `/dokumen/{id}/unduh` | `Storage::disk('public')->download($path)` | Unduh Langsung PDF Dokumen / Abstrak | Public | Active |

## 2. Mobile & PWA Routes (`/mobile/*`)

| Route Path | File / Handler | Page Title | Auth | Status |
|---|---|---|---|---|
| `/mobile` | `Closure -> Inertia::render('Mobile/Home')` | Beranda Mobile JDIH | Public | Active |
| `/mobile/pencarian` | `Closure -> Inertia::render('Mobile/Pencarian')` | Pencarian Dokumen Mobile | Public | Active |
| `/mobile/dokumen/{id}` | `Closure -> Inertia::render('Mobile/DetailDokumen')` | Detail Dokumen + Fitur Pintar AI | Public | Active |
| `/mobile/berita` | `Closure -> Inertia::render('Mobile/Berita')` | Warta Hukum Mobile | Public | Active |
| `/mobile/info` | `Closure -> Inertia::render('Mobile/InfoJdih')` | Informasi JDIH Mobile | Public | Active |

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

## 3. API & Async Routes

| Method | Route Path | Handler | Auth | Purpose |
|---|---|---|---|---|
| `POST` | `/api/chat-ai` | `AiAssistantController@chat` | Public (Rate-limit) | Tanya Jawab AI Hukum |
| `POST` | `/api/aspirations` | `Closure -> Store Aspiration` | Public | Submit Formulir Aspirasi |
| `GET` | `/api/jdihn/sync` | `Closure -> JDIHN Export` | API Key | Sinkronisasi JDIHN Nasional |

## 4. Middleware Chain

| Middleware | Applied To | Purpose |
|---|---|---|
| `App\Http\Middleware\SecurityHeaders` | Global (All Web Routes) | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| `Illuminate\Routing\Middleware\SubstituteBindings` | Global Web | Route model binding injection |
| `App\Http\Middleware\HandleInertiaRequests` | Web Public | Shared state Inertia (auth user, flash messages) |
| `Filament\Http\Middleware\Authenticate` | `/admin/*` | Verifikasi sesi Filament login & proteksi akses |
