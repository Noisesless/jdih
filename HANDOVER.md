# Handover Document: JDIH Kabupaten Banjarnegara

Dokumen historis serah terima dan catatan operasional sistem JDIH Kabupaten Banjarnegara.

## 1. Status Sesi Terakhir (12 Oktober 2026)

### Sesi Bagian 1: Security, Audit Trail & Server Hardening
*   **Timezone Hardening**: Konfigurasi `config/app.php` diperbarui menggunakan `Asia/Jakarta` (WIB) sehingga timestamp audit log dan database akurat.
*   **Audit Trail Terpusat**: Event listener `Login` & `Logout` di `AppServiceProvider` mencatat setiap autentikasi ke tabel `activity_logs`.
*   **Akun Admin Operasional**: Akun dinas `admin.jdih@banjarnegarakab.go.id` telah ditambahkan melalui migrasi `2026_10_12_100000_create_dinas_admin_user.php`.
*   **Vhost Security Template**: Nginx vhost template dikonfigurasi untuk memblokir akses publik ke file `.env` & dotfiles serta meneruskan IP asli via Cloudflare (`CF-Connecting-IP`).
*   **Brainvibes Docs Blueprint**: Folder `/.docs/` dilengkapi dengan 9 file blueprint arsitektur, API, database, routes, deployment, issues, dependency-graph, design-system, dan quality-review.

### Sesi Bagian 2: AI Offline Engine, Bugfix Server CLI & Responsive Overhaul
*   **Native PHP Offline Legal RAG Engine**: Dibuatkan `App\Services\OfflineLegalRagService` yang mampu melakukan pencarian semantik dan rekomendasi dasar hukum 100% in-process via Eloquent & text matching tanpa subprocess Python maupun dependensi internet eksternal.
*   **Resolusi CLI Shell Error di Linux Server**: Menghilangkan error `sh: 1: python: not found` pada server produksi dengan menambahkan dynamic OS binary detection (`python3` pada Linux, `python` pada Windows) dan error masking di `AiAssistantController.php` agar pesan teknis tidak bocor ke bubble chat pengguna.
*   **Google Gemini Multi-Key & Model Fallback**: `GeminiService.php` dikonfigurasi dengan rotasi multi-API-key (`GEMINI_API_KEYS`), bypass SSL cURL internal (`withoutVerifying()`), serta fallback model pool (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).
*   **Responsive Laptop-First 1366×768 Overhaul**:
    *   Mengatasi isu konten terpotong dan tab navigasi meluap pada layar laptop standar instansi (1366×768) serta tampilan dengan Windows scaling 125% (~1092px).
    *   File diperbarui: `PublicLayout.tsx`, `Welcome.tsx`, `DetailDokumen.tsx`, `DaftarDokumen.tsx`.
    *   Menerapkan horizontal scrollbar pada tab peraturan, container proporsional `max-w-[1366px]`, dan dynamic viewport height `min-h-[calc(100vh-140px)]`.
*   **Precompiled Assets Deployment Protocol**: Mengingat server produksi `nargaroth` tidak memiliki Node.js/NPM, aset frontend di-bundle di komputer pengembang via Vite (`public/build`) dan di-commit langsung ke repository Git.
### Sesi Bagian 3: Hardening CloudPanel & Isolasi Document Root
*   **Isolasi Web Root ke `/public`**: Melalui CloudPanel (Sites -> Settings -> Root Directory), Document Root resmi diarahkan ke `/home/jdih1bna/htdocs/jdih.banjarnegarakab.go.id/public`.
*   **Penyempurnaan Vhost Nginx Dua Layer**:
    *   Layer Reverse Proxy (Port 80/443) & Backend FastCGI (Port 8080) dilengkapi rule penolakan HTTP 404 ketat untuk file ekstensi sensitif: `\.env|\.git|composer\.(json|lock)|package(-lock)?\.json|\.lock|\.sql|\.bak|\.log|\.sh|\.md|web\.config`.
    *   Routing Laravel di port 8080 dibakukan menggunakan `location / { try_files $uri $uri/ /index.php?$query_string; }`.
    *   Aset statis dilengkapi `try_files $uri =404;` untuk efisiensi beban backend.
*   **Verifikasi Status Akses**:
    *   `https://jdih.banjarnegarakab.go.id/todo.md` -> HTTP 404 (Terisolasi total).
    *   `https://jdih.banjarnegarakab.go.id/docs/SECURITY-AUDIT-REPORT.md` -> HTTP 404 (Terisolasi total).
    *   `https://jdih.banjarnegarakab.go.id/` -> HTTP 200 (Berjalan normal).
    *   `https://jdih.banjarnegarakab.go.id/admin` -> HTTP 200 (Filament Admin berjalan normal).
---

## 2. Kredensial & Lingkungan
*   **URL Produksi**: `https://jdih.banjarnegarakab.go.id`
*   **Panel Admin**: `https://jdih.banjarnegarakab.go.id/admin`
*   **Akses Administrator**: Dikelola secara terpusat oleh Bagian Hukum Setda Kabupaten Banjarnegara (Kredensial disimpan aman pada Password Vault internal instansi).


---

## 3. Protokol Deployment (Server Tanpa Node.js / NPM)

### Di Komputer Lokal (Sebelum Push):
```bash
# Kompilasi aset frontend ke public/build
npm run build

# Commit dan push bundle build ke git
git add public/build/
git commit -m "build: compile production frontend assets"
git push origin main
```

### Di Server Produksi (SSH):
```bash
cd ~/htdocs/jdih.banjarnegarakab.go.id

# 1. Tarik pembaruan kode dan bundle aset
git pull origin main

# 2. Update paket PHP jika ada perubahan composer
composer install --no-dev --optimize-autoloader

# 3. Jalankan migrasi database (jika ada migrasi baru)
php artisan migrate --force

# 4. Bersihkan cache aplikasi agar template dan aset baru langsung terbaca
php artisan optimize:clear
```

---

## 4. Status Sesi Terkini (17 Oktober 2026)

### Sesi Bagian 3: Aktivasi Pencarian, Dynamic Scheme, AI Mobile & PWA Engine
*   **Aktivasi Widget Pencarian Dokumen Desktop**:
    *   Form dan tombol "Cari Dokumen" pada sidebar `DetailDokumen.tsx` telah diaktifkan dengan event submit dan integrasi Inertia `router.get` ke `/katalog?namaDokumen=...`.
*   **Dynamic HTTPS Scheme Guard (`AppServiceProvider.php`)**:
    *   Mengatasi error `net::ERR_CONNECTION_CLOSED` pada dev server lokal dengan mengecualikan `localhost`, `127.0.0.1`, dan `*.test` dari pemaksaan `URL::forceScheme('https')`. Domain server produksi tetap aman dengan pemaksaan HTTPS otomatis.
*   **Aktivasi Fitur Pintar "Tanya Asisten AI JDIH" pada Mobile**:
    *   Menambahkan tombol kartu pintar gradien Teal `#0d9488` dan drawer modal *bottom-sheet* interaktif (tinggi 85vh) pada `resources/js/Pages/Mobile/DetailDokumen.tsx`.
    *   Mendukung perbincangan real-time, format Markdown, dan terhubung langsung ke backend `/ai/ask`.
*   **Kesiapan Standar PWA (Progressive Web App)**:
    *   Membuat Service Worker `public/sw.js` dengan strategi caching *network-first navigation* dan offline fallback.
    *   Mendaftarkan Service Worker pada template induk `resources/views/app.blade.php`.
    *   Memperbarui `public/manifest.json`: menyelaraskan `start_url` ke `/mobile`, `theme_color` ke `#0d9488`, `background_color` ke `#ffffff`, dan menambahkan shortcut navigasi mobile.
*   **Resolusi Error PDF Viewer "Browser Anda tidak mendukung preview PDF langsung"**:
    *   Menghubungkan symlink `public/storage` ke `storage/app/public` via `php artisan storage:link`.
    *   Memperbaiki accessor `getFileAttribute()` dan `getAbstractFileAttribute()` pada `LegalDocument.php` agar menghasilkan path relatif `/storage/...` yang ter-encode per segmen (`rawurlencode`), mencegah ketergantungan pada domain luar `https://jdih.rapidnet.id` yang menghasilkan 404.
    *   Menambahkan fallback `<iframe>` di dalam tag `<object>` pada `DetailDokumen.tsx` untuk kompatibilitas peramban desktop yang lebih luas.
    *   Mengalihkan rute unduhan `/dokumen/{id}/unduh` menggunakan `Storage::disk('public')->download($path)` langsung tanpa redirect eksternal.
*   **Kompilasi Aset Frontend Produksi**:
    *   Menjalankan `npm run build` sehingga seluruh bundle di `public/build/` terkompilasi mutakhir dan siap di-deploy langsung ke server tanpa Node.js.

---

## 5. Status Sesi Terkini (24 Oktober 2026)

### Sesi Bagian 4: Sanitasi Repositori Produksi & Pembersihan File Ad-hoc/Test/Temp
*   **Pembersihan File Uji & Ad-Hoc di Root**:
    *   Menghapus seluruh file debug/test: `check_doc.php`, `check_problematic.php`, `test2.php`, `test_map.php`, `test_pie.php`, `dummy.pdf`.
    *   Menghapus script perbaikan ad-hoc satu kali: `fix_issues.php`, `fix_missing_files.php`, `link_abstracts.php`, `optimize_logo.php`, `deploy_jdih_updates.php`.
    *   Menghapus log dan dump data lama: `build_output.txt`, `belum-ada-file.txt`, `index-jdih-asli.txt`.
    *   Menghapus duplikat lama `manifest.json` di root (SSOT aktif berada di `public/manifest.json`).
*   **Hardening Keamanan Publik (`public/`)**:
    *   Menghapus `public/security-audit.md` dan `public/security-audit-fix.md` dari web root publik guna mencegah kebocoran informasi teknis audit celah keamanan ke publik.
*   **Pembersihan Direktori `scratch/`**:
    *   Menghapus folder `scratch/` (berisi 19 file temporary HTML dump dan skrip CJS pengujian).
*   **Reorganisasi Berkas Laporan**:
    *   Memindahkan berkas laporan ke folder dokumentasi resmi `docs/`: `Matriks_Ceklis_JDIH.xlsx`, `laporan-upgrade-jdih.md`, dan `laporan-pengembangan.md`.
*   **Sinkronisasi GitHub**:
    *   Seluruh perubahan telah di-commit (`0185dba`) dan di-push ke remote `origin main`.

---

## 6. Status Sesi Terkini (24 Oktober 2026)

### Sesi Bagian 5: Audit Kepatuhan Keamanan OWASP Top 10:2025 & Hardening Produksi
*   **Audit Kepatuhan SP Registry & OWASP Top 10:2025**:
    *   Melakukan pemindaian faktual terhadap 26 Security Patterns (SP) Brainvibes dan menerbitkan laporan komprehensif di `/.docs/security-audit.md`.
*   **Remediasi Supply Chain Dependencies (VULN-001 & VULN-002)**:
    *   Memperbaiki vulnerabilitas Critical pada paket `shell-quote` dan High pada `vite` serta `source-map-js` via `npm audit fix`.
    *   Status kerentanan NPM saat ini: **0 Critical, 0 High**.
*   **Perlindungan XSS via DOMPurify (VULN-003)**:
    *   Memasang pustaka `dompurify` dan menyematkan sanitasi pada seluruh render `dangerouslySetInnerHTML` di `resources/js/Pages/Informasi/DetailBerita.tsx`, `resources/js/Pages/Mobile/DetailBerita.tsx`, dan `resources/js/Pages/Hukum/DetailDokumen.tsx`.
*   **Perlindungan Mass Assignment (VULN-004)**:
    *   Mengganti `protected $guarded = [];` pada model `app/Models/Katalog.php` dengan deklarasi eksplisit `protected $fillable = [...]` 9 kolom basis data.
*   **Pengetatan Otorisasi Admin Panel (VULN-006)**:
    *   Memperketat method `canAccessPanel()` pada `app/Models/User.php` sehingga hanya email resmi dinas pemda (`@banjarnegarakab.go.id`, `@jdih.test`) dan administrator terdaftar yang diizinkan mengakses Filament backoffice.
*   **Kompilasi Aset Produksi**:
    *   Menjalankan `npm run build` sehingga seluruh bundle di `public/build/` terkompilasi bersih tanpa error dan siap di-deploy langsung ke server Linux tanpa Node.js.

---

## 7. Status Sesi Terkini (2 November 2026)

### Sesi Bagian 6: Hardening Produksi, Rekonfigurasi Backup WireGuard & Audit Security Patterns
*   **Profil SSH & Otomasi Infrastruktur**:
    *   Membuat konfigurasi `~/.ssh/config` lokal untuk host `nargaroth` (port `64001`) dan `freenas` (port `55001` via ProxyJump over WireGuard `10.200.200.2`).
    *   Mengintegrasikan keyless authentication antar-server Linux (`nargaroth` $\rightarrow$ `freenas`) via key `ed25519`.
*   **Restorasi & Perbaikan Remote Backup CloudPanel**:
    *   Memperbaiki konfigurasi CloudPanel (`db.sq3` & `rclone.conf`) yang sebelumnya gagal dengan *permission denied* ke host lama. Target diarahkan langsung ke FreeNAS WireGuard (`10.200.200.2:55001`, user `root`, directory `/mnt/data/backup/nargaroth`).
    *   Memperbaiki bug syntax escaping `awk` di script cron FreeNAS `/mnt/data/backup/.wg/daily-incremental-sync.sh` baris 40 & 48.
*   **Hardening Nginx Reverse Proxy (SP-023 & SP-031)**:
    *   Menerapkan *Single Layer Emission* di Nginx port 443 via `proxy_hide_header` untuk mengeliminasi duplikasi header `X-Frame-Options` dan `X-Content-Type-Options`.
    *   Menyamarkan fingerprint webserver menjadi `Server: JDIH-Portal` (SP-031 cloaking).
*   **Pembersihan Working Tree Produksi**:
    *   Mengarsipkan symlink warisan ke `/home/jdih1bna/backup_legacy_symlinks_20261102.tar.gz` dan membersihkan symlink rekursif di `storage/` serta stub di root.
    *   Sinkronisasi branch `main` produksi ke commit `886f829` (`working tree clean`).
*   **Optimalisasi Tampilan Infografis Mobile (`Mobile/Home.tsx`)**:
    *   Memperbaiki dimensi card infografis dari ukuran desktop `min-w-[280px]` menjadi ukuran proporsional mobile `w-[155px]` dengan poster aspect ratio `aspect-[3/4]` (menggantikan `aspect-[4/3]` landscape yang sebelumnya memotong gambar).
    *   Menambahkan interaktivitas *Fullscreen Lightbox Modal* saat card diklik, lengkap dengan tombol close (`X`), zoom preview, dan tombol unduh.
    *   Mengaktifkan scroll snapping (`snap-x snap-mandatory`) yang mulus pada perangkat mobile.
    *   Mengompilasi ulang aset bundle produksi via `npm run build` dan menyinkronkan langsung ke server produksi.
*   **Penyelesaian Tabrakan Cache Berita & Proteksi Desktop (ISSUE-016)**:
    *   Memisahkan cache key berita menjadi `home.news.desktop` dan `home.news.mobile` dengan penambahan mapping ganda `image` & `thumbnail` serta *null-coalescing guard* `$n['image'] ?? $n['thumbnail'] ?? '/images/hero.webp'` pada `routes/web.php` untuk mencegah fatal error 500 (`Undefined array key "image"`).
    *   Menerapkan *Auto-Redirect* `302` di route `/mobile`: Pengguna yang membuka `/mobile` dari komputer/desktop otomatis dialihkan kembali ke beranda desktop `/`, menjaga isolasi tampilan desktop vs mobile.
*   **Penyempurnaan Grafik Statistik Mobile (ISSUE-017)**:
    *   Mengintegrasikan passing data agregasi `dataJenisMini` dan `dataTahunMini` di route `/mobile` ke dalam props `Inertia::render('Mobile/Home')`.
    *   Memperbaiki evaluasi fallback array data di `resources/js/Components/StatistikMiniSection.tsx`, menyelaraskan key data `year` + `tahun`, serta menambahkan prop `isMobileCompact` untuk tampilan mobile yang proporsional tanpa kontainer ganda.
*   **Konsolidasi SSOT Dokumentasi & Eliminasi Redundansi (`/.docs/`)**:
    *   Menyatukan folder `docs/` dan `.docs/` menjadi satu direktori kanonikal tunggal `/.docs/` sesuai arsitektur Single Source of Truth (SSOT) Vibes Coding Workflow.
    *   Memindahkan berkas aset penting dan bernilai unik dari `docs/`:
        - Konfigurasi Nginx vhost: `.docs/nginx/jdih.banjarnegarakab.go.id.conf`
        - Berkas Inovasi Produk Hukum Desa: `.docs/integrasi-desa/` (`API-PRODUK-HUKUM-DESA.md`, `INOVASI-UNIK-INTEGRASI-DESA.md`, `DATA-DUKUNG-INOVASI-JDIH.md`)
        - Matriks Pemenuhan Regulasi: `.docs/permenkumham/` (`CEKLIS_PEMENUHAN_PERMENKUMHAM_8_2019.md`, `Matriks_Ceklis_JDIH.xlsx`)
        - Laporan Resmi Historis Klien: `.docs/arsip-laporan/` (`laporan_migrasi_jdih.md`, `laporan_optimasi_database.md`, `laporan-upgrade-jdih.md`, `laporan-pengembangan.md`)
    *   Menghapus berkas duplikat/usang yang isinya telah tercakup penuh dalam SSOT 10 berkas blueprint (`.docs/security-audit.md`, `.docs/issues.md`, `.docs/quality_review.md`): `docs/SECURITY-AUDIT-REPORT.md`, `docs/securities.md`, `docs/laporan_pentest_jdih.md`, `docs/laporan-hardening-keamanan-oktober-2026.md`, `docs/BUG-FINDING-REPORT.md`, `docs/BUG.md`, `docs/analisa_akhir_aplikasi.md`, `docs/TEST-RESULTS.md`, `docs/NOTES_PENGEMBANGAN_DOKUMEN_HUKUM.md`, dan `docs/README.md`.
    *   Menghapus direktori `docs/` secara menyeluruh, membersihkan ~200KB duplikasi teks markdown dan meniadakan kebingungan navigasi dokumen.








*   **Integrasi & Hardening Modul Produk Hukum Desa — OpenSID Server Nargaroth (3 November 2026)**:
    *   **Hardening Keamanan API Kependudukan (`apiasmara.php`)**:
        - Menerapkan sliding-window rate limiting maksimal 10 request/menit per IP via `/tmp/rate_limit_asmara/` mengembalikan `HTTP 429 Too Many Requests`.
        - Membatasi header CORS (`Access-Control-Allow-Origin`) secara ketat hanya untuk `https://posyandu-sijenggung.smartdesa.net` dan `https://jdih.banjarnegarakab.go.id`.
        - Mengganti perbandingan kunci biasa dengan fungsi kebal timing attacks `hash_equals()`.
    *   **Global Nginx Rewrite untuk 98 Vhost OpenSID**:
        - Mengonfigurasi `/etc/nginx/global_settings` dengan directive rewrite `location /internal_api/ { rewrite ^/internal_api/(.*)$ /index.php/internal_api/$1 last; }` sehingga seluruh 98 vhost OpenSID otomatis dapat melayani request API produk hukum tanpa mengubah vhost satu per satu.
    *   **Inter-Server Loopback Resolution (`/etc/hosts`)**:
        - Memetakan seluruh domain `.desa.id` yang di-host lokal pada Nargaroth ke `103.255.133.227` pada `/etc/hosts`.
        - Mengeliminasi blokir Cloudflare Bot Challenge / Under Attack Mode secara lokal sekaligus tetap lolos validasi SSRF (`isPrivateOrInternalIp()`).
    *   **Sinkronisasi Database JDIH (`jdihdb1.villages`)**:
        - Mengoreksi URL Majatengah (ID 248) ke domain resmi `https://majatengah-banjarmangu.desa.id/` dan mengaktifkannya (`is_active = 1`).
        - Mendaftarkan dan mengaktifkan 14 desa lokal baru: Majatengah (Kalibening), Tribuana, Badakarya, Bondolharjo, Klapa, Gumingsir (Pagentan), Gumingsir (Wanadadi), Karangkemiri, Medayu, Plorengan, Pagergunung, Sampang, Madukara, Clapar.
        - Memverifikasi 20 endpoint desa target merespons `200 OK` via proxy JDIH.
    *   **Pemetaan Menyeluruh 78 Desa OpenSID Lainnya di Nargaroth**:
        - Mengaudit seluruh 78 vhost OpenSID tambahan di Nargaroth.
        - Mengidentifikasi 21 desa non-DB yang sudah memiliki dokumen Perdes terbit di OpenSID (siap diaktifkan ke JDIH kapan saja).
        - Menyusun dokumentasi lengkap SSOT pada `.docs/integrasi-desa/STATUS-INTEGRASI-DESA-NARGAROTH.md`.
    *   **Resolusi Inode `/tmp` Server Nargaroth & Otomasi Pemeliharaan Harian (ISSUE-018)**:
        - Mengidentifikasi akar masalah error `HTTP 500` (`No space left on device`) pada OpenSID karena kehabisan 100% Inode `tmpfs /tmp` (`1.048.576` files) akibat penumpukan 1M+ file sesi lawas CodeIgniter (`ci_session*`).
        - Menghapus 845.243 file sesi kadaluarsa (>24 jam) sehingga inode `/tmp` turun drastis ke 20% (tersedia 845.195 inode kosong).
        - Memasang skrip pemeliharaan otomatis harian `/etc/cron.daily/cleanup-opensid-sessions` agar file `ci_session*` kadaluarsa otomatis terhapus tanpa perlu intervensi manual.
        - Memvalidasi bahwa seluruh 63 desa terdaftar aktif di `jdihdb1.villages` kini merespons `200 OK` secara stabil dan cepat.
