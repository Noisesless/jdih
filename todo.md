# TODO LIST — JDIH KABUPATEN BANJARNEGARA

Daftar progres pekerjaan dan roadmap operasional sistem JDIH Kabupaten Banjarnegara.

## [x] Fase 1: Perancangan Identitas & Konversi Sistem
- [x] Migrasi database MySQL warisan (MyISAM) ke InnoDB utf8mb4
- [x] Setup pondasi Laravel 11, Filament v3, dan Inertia React
- [x] Pembuatan skema relasi dokumen hukum dan metadata standar JDIHN

## [x] Fase 2: Pengembangan Fitur Publik & Katalog
- [x] Landing page modern dengan Dynamic Hero Slider
- [x] Fitur pencarian multi-kriteria dokumen hukum (kategori, tahun, nomor, status)
- [x] Penampil abstrak dan dokumen PDF legalitas hukum
- [x] Forum Dialog Publik dan Form Aspirasi Masyarakat
- [x] AI Chatbot Legal Assistant bertenaga Groq Llama 3.1 & Google Gemini

## [x] Fase 3: Pengembangan Backoffice & Filament Admin
- [x] Resource manajemen Dokumen Hukum (Perda, Perbup, SK, dll.)
- [x] Resource manajemen Berita, Artikel, dan Galeri Foto/Video
- [x] Manajemen Hero Banner dan Slider Konten
- [x] Modul Survei dan Rekap Indeks Kepuasan Masyarakat (IKM)
- [x] Modul Integrasi Produk Hukum Desa & JDIHN Sync

## [x] Fase 4: Audit Keamanan & Hardening
- [x] Audit celah keamanan OWASP Top 10
- [x] Perbaikan SSRF pada QR Code generator
- [x] Implementasi Security Headers Middleware
- [x] Hardening Nginx vhost: blokir total file `.env`, `.git`, composer.lock, dll.
- [x] Setup Cloudflare Real IP passthrough (`CF-Connecting-IP` / `X-Real-IP`)

## [x] Fase 5: Audit Trail & Manajemen Akses Pengguna
- [x] Event Listener terpusat `Login` dan `Logout` di `AppServiceProvider`
- [x] Koreksi Timezone baku ke `Asia/Jakarta` (WIB / UTC+7) di `config/app.php`
- [x] Pencegahan duplikasi pencatatan log pada login admin
- [x] Pembuatan akun admin operasional dinas: `admin.jdih@banjarnegarakab.go.id` via migration

## [x] Fase 6: Mesin AI Hybrid, Responsivitas & Dokumentasi Sistem
- [x] Implementasi Native PHP Offline Legal RAG Engine & Dynamic OS Python Detection (bebas dari error CLI `python: not found` di Linux server)
- [x] Optimasi Responsivitas Laptop-First 1366×768 (dan scaling 125% ~1092px) pada layout dan katalog dokumen publik
- [x] Setup precompiled frontend assets deployment workflow untuk server tanpa Node.js/NPM
- [x] Sinkronisasi dokumentasi Blueprint Brainvibes (`/.docs/` 9 file + `prd.md` + `todo.md` + `handover.md` + `app-context.md`)

## [x] Fase 6.1: Optimasi PWA, Mobile AI, Viewer PDF & Dynamic Environment
- [x] Aktivasi widget pencarian dokumen di sidebar `DetailDokumen.tsx` dengan integrasi Inertia `router.get` ke `/katalog`
- [x] Dynamic HTTPS Scheme Guard di `AppServiceProvider.php` (mencegah `ERR_CONNECTION_CLOSED` pada dev server lokal)
- [x] Integrasi Fitur Pintar "Tanya Asisten AI JDIH" pada Mobile Detail Dokumen (`Mobile/DetailDokumen.tsx`) dengan drawer bottom-sheet 85vh
- [x] Pembuatan PWA Service Worker (`public/sw.js`) dan pendaftaran di `app.blade.php` untuk offline fallback dan kriteria installability
- [x] Sinkronisasi `public/manifest.json` (`start_url: /mobile`, theme `#0d9488`, background `#ffffff`)
- [x] Resolusi error PDF viewer "Browser Anda tidak mendukung preview PDF langsung": symlink `public/storage`, perbaikan accessor URL relatif `/storage/...` ter-encode di `LegalDocument.php`, dan penambahan `iframe` fallback di dalam `<object>`
- [x] Pembaruan rute unduh dokumen (`/dokumen/{id}/unduh`) menjadi direct streaming download via `Storage::disk('public')->download($path)`

## [x] Fase 6.2: Sanitasi Repositori Produksi & Audit Keamanan Terkini
- [x] Pembersihan total 24 berkas uji, ad-hoc, debug di root (`check_*.php`, `test*.php`, `fix_*.php`, `dummy.pdf`, `build_output.txt`)
- [x] Pembersihan folder `scratch/` dan hardening direktori `public/` (menghapus file audit celah keamanan dari web root publik)
- [x] Reorganisasi berkas laporan teknis & matriks pemenuhan Permenkumham ke direktori terpusat `/docs/`
- [x] Verifikasi kekebalan aplikasi terhadap CVE-2026-114509 (Laravel TokenGuard Auth Bypass) pada framework v12.69.2
- [x] Konfirmasi mitigasi dan patch runtime server terhadap ancaman PHP2Shell (CVE-2026-109618/19)
- [x] Hardening CloudPanel: Pemindahan Document Root ke direktori `/public` dan penyempurnaan Vhost Nginx dua layer (memblokir file `.md`, `.sql`, `.bak`, `.log`, `.sh`, `.env`, dotfiles) serta routing resmi Laravel. Verifikasi faktual: `todo.md` & `/docs/` terisolasi 100% (HTTP 404).

## [x] Fase 6.3: Mobile Overhaul, Integrasi 63 Desa OpenSID & Analytics Pengunjung (Selesai 3-5 Nov 2026)
- [x] Overhaul sticky bottom bar mobile: 5 elevated tabs + 2 action sheet drawers (`framer-motion`)
- [x] Kontras visual 8-sektor selang-seling di `Mobile/Home.tsx`
- [x] Halaman mobile-first `Mobile/ProdukHukumDesa.tsx` dan penyatuan tombol aksi "Lihat / Unduh"
- [x] Integrasi OpenSID Nargaroth: loopback `/etc/hosts`, rewrite global Nginx `/internal_api/`, sanitasi rate limit `apiasmara.php`, cron harian pembersihan inode `/tmp`
- [x] Perbaikan grafik "Dokumen per Jenis" mobile (`h-[340px]`, offset 65px, toggle filter Top 8 vs Semua)
- [x] Middleware `RecordVisitor` & migrasi tabel `visitors` (pelacakan pengunjung harian, hits, online realtime)
- [x] Simplifikasi microcopy Card Pengunjung (menghilangkan kata-kata berlebihan/slop copy)
- [x] Dinamisasi CSP di `SecurityHeaders.php` (mendukung local dev Vite HMR dan strict di produksi)

## [x] Fase 6.4: Pengerasan Autentikasi Admin, CAPTCHA Dinamis, Tiered Rate Limiting & Real IP Audit Logging (Selesai 11 Nov 2026)
- [x] Implementasi CAPTCHA Inline SVG anti-scraping dengan verifikasi `hash_equals` dan anti-replay cache pada form Login Filament Admin (`app/Filament/Pages/Auth/Login.php`)
- [x] Tiered Rate Limiter bertahap pada Login: Level 1 Akun/Email (5x/menit) dan Level 2 Jaringan IP (25x/menit) untuk mencegah lockout IP kantor Pemda
- [x] Bypass masking Cloudflare/Tunnel via `AppServiceProvider::getClientIp()` dan `trustProxies('*')` di `bootstrap/app.php`
- [x] Pelabelan terstruktur counter publik (`view_count` & `download_count`) menjadi `Pengunjung (Tamu)` dengan keterangan transparan di `LogsActivity.php`
- [x] Visualisasi kolom Keterangan di Admin `ActivityLogResource` serta pembaruan kredensial dev admin baru di `DatabaseSeeder.php`

## [ ] Fase 7: Sinkronisasi Keterkaitan Antar-Peraturan (Mencabut & Mengubah)
- [ ] Buat Artisan Command Auto-Linker (`php artisan jdih:link-relations`) untuk menautkan otomatis 179+ relasi (16 pencabutan & 163 perubahan) dari teks judul peraturan ke tabel `legal_document_relations`
- [ ] Perbarui status keberlakuan dokumen yang dicabut dari `'Berlaku'` menjadi `'Dicabut'` / `'Tidak Berlaku'` serta isi catatan `status_note` secara otomatis
- [ ] Perbaiki accessor `getRelatedAttribute()` & `getReferencedByAttribute()` di `LegalDocument.php` agar menyertakan nilai `relation_type` dari pivot table untuk frontend Inertia
- [ ] Implementasikan Model Observer / Event pada `LegalDocumentRelation`: otomatis update status dokumen target saat admin menambah relasi pencabutan di Filament Admin
- [ ] Sinkronisasi data keterkaitan ke JDIHN Pusat: sertakan array `peraturan_terkait` pada payload `formatDocumentForSync` di `JdihSyncController`
