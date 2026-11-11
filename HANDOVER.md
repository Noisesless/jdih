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

*   **Overhaul Mobile Navigation, Visual Alternating Rhythm & Modul Desa Terpadu (3 November 2026)**:
    *   **Overhaul Sticky Navigation Bawah (5 Tabs + 2 Action Sheet Drawers)**:
        - Mengganti navigasi 4 tab standar menjadi 5 elevated tabs: `Home`, `Peraturan` (trigger Action Sheet), `Cari` (elevated teal button), `Berita`, dan `Menu` (trigger Action Sheet).
        - *Drawer Peraturan*: Memberikan akses instan ke Perda, Perbup, SK Bupati, Produk Hukum Desa, Putusan, Monografi, dan Semua Katalog Dokumen.
        - *Drawer Menu*: Mengarahkan ke Statistik Dokumen (`/mobile/statistik`), Konsultasi/Aspirasi (`/mobile#aspirasi`), Modal Survei IKM native, Profil Lembaga, Portal JDIHN, dan Linktree.
    *   **Kombinasi Warna Ritmik Selang-Seling (8 Sektor) pada `Mobile/Home.tsx`**:
        - Mengeliminasi tampilan monoton/plain dengan menerapkan kontras bergradasi selang-seling: Sektor 1 Hero Navy/Teal, Sektor 2 Soft Canvas Kategori, Sektor 3 Mint Infografis, Sektor 4 Pure White Produk Hukum, Sektor 5 Midnight Slate Statistik, Sektor 6 Slate Warta JDIH, Sektor 7 Cyan Video Edukasi, dan Sektor 8 Tautan Lembaga.
    *   **Pembuatan Halaman Khusus Mobile `Mobile/ProdukHukumDesa.tsx`**:
        - Membangun antarmuka mobile-first khusus untuk produk hukum desa terintegrasi 63 OpenSID dengan filter kecamatan, desa, kategori pills, pencarian instan, dan status sinkronisasi.
        - Menambahkan deteksi otomatis User-Agent mobile pada `ProdukHukumDesaController@index` sehingga pengguna mobile otomatis mendapatkan tampilan mobile tanpa kehilangan sticky bottom bar.
    *   **Penyatuan Tombol "Lihat" dan "Unduh" Menjadi 1 Aksi Terpadu**:
        - Menyederhanakan kolom aksi dokumen pada desktop (`Hukum/ProdukHukumDesa.tsx`) dan mobile (`Mobile/ProdukHukumDesa.tsx`) dari sebelumnya 2 tombol redundan menjadi 1 tombol elegan *"Lihat / Unduh"*.
    *   **Resolusi Thumbnail Video Audiovisual Mobile**:
        - Memperbaiki mapping data backend `home.videos.mobile` di `routes/web.php` dan menambahkan fallback cover resmi terverifikasi di server (`/images/covers/cover_perbup_54_2025.webp`) dengan handler `onError` otomatis.
    *   **Pusat Profil Kelembagaan All-in-One (`Mobile/InfoJdih.tsx`)**:
        - Mengintegrasikan konten profil kelembagaan (Visi Misi, Dasar Hukum, Tupoksi Bagian Hukum, dan SOP) ke dalam komponen expandable accordion interaktif langsung di dalam antarmuka mobile.
    *   **Build & Deployment Produksi**:
        - Dikompilasi via `npm run build` bebas error dan dideploy ke server Nargaroth dengan verifikasi HTTP 200 OK.

*   **Penyempurnaan Statistik Dokumen & Pencatatan Trafik Pengunjung Portal (Desktop & Mobile) (3 November 2026)**:
    *   **Perbaikan Card "Dokumen per Jenis" di `Mobile/Statistik.tsx`**:
        - Mengatasi kendala data tidak tampil akibat kontainer terlalu sempit dan dataKey `short` undefined pada rute mobile.
        - Memperbesar kontainer grafik dari `h-[250px]` menjadi `h-[340px]` dan margin bawah lega (`bottom: 65px`) agar label rotasi -45° terbaca jelas tanpa terpotong.
        - Menyediakan toggle filter interaktif `[Top 8 | Semua]` di header card untuk kenyamanan navigasi layar ponsel.
        - Menambahkan `minPointSize={4}` pada komponen `Bar` agar kategori dengan jumlah sedikit tetap terlihat jelas.
    *   **Pencatatan Trafik Pengunjung Otomatis (`RecordVisitor` Middleware)**:
        - Membuat middleware non-blocking `RecordVisitor` di `bootstrap/app.php` untuk mencatat pengunjung unik harian dan hits secara aman tanpa membebani database (throttling 60 detik via cache).
        - Membuat migrasi tabel `visitors` (`database/migrations/2026_11_03_160000_create_visitors_table.php`) dengan unique key `(ip_address, visited_date)` dan tracking hits.
        - Menghitung indikator pengguna aktif online (sliding window 5 menit via cache) dan agregasi total pembaca dokumen hukum (`view_count`).
    *   **Penambahan Card Statistik Pengunjung pada Desktop & Mobile**:
        - Desktop (`Pages/Statistik.tsx`): Menambahkan card section "Statistik Pengunjung & Akses Portal" dengan 4 metrik utama (Hari Ini, Bulan Ini, Total Kunjungan, Dokumen Dibaca) serta badge live status "Online Saat Ini".
        - Mobile (`Pages/Mobile/Statistik.tsx`): Menambahkan card terpadu "Pengunjung Portal" di bawah ringkasan utama dengan metrik hari ini, bulan ini, total kunjungan, dokumen dibaca, dan live online indicator.
    *   **Penyelarasan Endpoint Backend (`routes/web.php`)**:
        - Memperkenalkan helper terpusat `getStatistikPayload()` yang digunakan bersama oleh rute desktop (`/statistik`) dan mobile (`/mobile/statistik`).
        - Menjamin ketersediaan properti `name`, `short`, `jumlah`, `href`, `color`, serta array metrik `visitorStats` pada kedua platform.

---

## 8. Status Sesi Terkini (5 November 2026)

### Sesi Bagian 7: Simplifikasi Microcopy Statistik, Dinamisasi CSP Dev vs Produksi, & Investigasi Regulasi
*   **Penyederhanaan Microcopy Card Pengunjung (Pragmatic Anti-Bloat Output)**:
    *   Mengevaluasi dan membersihkan teks berlebihan (*slop copy*) pada Card Pengunjung di desktop (`Statistik.tsx`) dan mobile (`Mobile/Statistik.tsx`).
    *   Menghilangkan label pelengkap yang redundan seperti *"Aktivitas pengguna tercatat"*, *"1 Hits"*, *"Pengunjung Unik"*, *"Sejak Berdiri"*, dan *"Pembacaan Produk"*.
    *   Tampilan kartu menjadi lebih bersih, minimalis, dan langsung menampilkan angka metrik utama.
*   **Dinamisasi Content Security Policy (`SecurityHeaders.php` — ISSUE-022)**:
    *   Mengatasi issue browser CSP yang memblokir skrip Vite HMR (`http://127.0.0.1:5173`) saat dev server lokal dijalankan.
    *   Menambahkan deteksi host lokal dinamis (`$isLocalHost = in_array($host, ['127.0.0.1', 'localhost', '::1']) || str_ends_with($host, '.test') || file_exists(public_path('hot'))`).
    *   Ketika diakses dari lokal, CSP secara dinamis mengizinkan origin Vite `http://127.0.0.1:5173` dan WebSocket HMR `ws://127.0.0.1:5173`.
    *   Ketika diakses dari lingkungan produksi (`jdih.banjarnegarakab.go.id`), CSP tetap menerapkan aturan ketat (*strict CSP*) serta HSTS enforcement.
*   **Pemeriksaan Fisik Dokumen Perbup THR & Gaji Ketiga Belas Tahun 2026**:
    *   Melakukan audit terhadap dokumen hukum ID `1430` (Peraturan Bupati Nomor 5 Tahun 2026).
    *   Menemukan bahwa secara teknis dokumen tercatat di database dan file fisiknya ada di server (`produk_hukum/2026/jdih banjarnegara (3).pdf`, 17,1 KB).
    *   Namun isi file PDF tersebut merupakan lembar pembatasan (*placeholder notice*) bertuliskan *"Dokumen Tidak Dapat Diakses Dari Website Silahkan Hubungi Staff JDIH Banjarnegara"*, yang menandakan naskah lengkap belum dibuka untuk umum oleh Bagian Hukum Setda.
*   **Sinkronisasi Berkas Dokumentasi SSOT (`/.docs/`) & App Context**:
    *   Menyelaraskan `database.md`, `architecture.md`, `routes.md`, `dependency-graph.md`, `issues.md` (ISSUE-022 & ISSUE-023), `quality_review.md`, `app-context.md`, dan `handover.md`.

---

## 9. Status Sesi Terkini (11 November 2026)

### Sesi Bagian 8: Penguatan Autentikasi Admin, CAPTCHA Dinamis, Tiered Rate Limiter, & Real IP Audit Logging
*   **Komponen CAPTCHA Inline SVG Anti-Bot (`Login.php`)**:
    *   Menerapkan tantangan matematika dinamis yang dirender sebagai badge grafis SVG bergaya JDIH Teal (`#0d9488`).
    *   Menangkal serangan DOM text scraping, timing attacks (`hash_equals`), dan replay attacks melalui cache single-use token (`used_captcha`).
    *   Dilengkapi tombol aksi refresh instan tanpa reload halaman dan auto-regenerate saat validasi/kredensial gagal.
*   **Tiered Rate Limiter Bertahap (Email Dulu, Baru IP Bersama)**:
    *   Mengatasi isu *office lockout* di mana puluhan staf admin Pemda berbagi satu IP publik yang sama.
    *   **Tahap 1 (Akun/Email)**: Membatasi maksimal 5 percobaan gagal per menit untuk email tertentu. Rekan admin lain di IP yang sama tetap dapat login normal.
    *   **Tahap 2 (IP Bersama)**: Membatasi maksimal 25 percobaan gagal per menit per IP jaringan untuk menangkal brute-force masif atau *credential stuffing*.
*   **Resolusi Real IP Klien (Bypass Masking Cloudflare / Tunnel)**:
    *   Mengaktifkan `$middleware->trustProxies(at: '*')` pada `bootstrap/app.php`.
    *   Membuat fungsi pembaca IP asli `AppServiceProvider::getClientIp()` yang memprioritaskan `CF-Connecting-IP`, `X-Real-IP`, dan `X-Forwarded-For` dengan sanitasi `FILTER_VALIDATE_IP`.
    *   Diterapkan ke event `Login`, `Logout`, `Failed`, `ActivityLog::log()`, dan `RecordVisitor`.
*   **Pemisahan & Pelabelan Counter Publik di Log Aktivitas (`LogsActivity.php`)**:
    *   Menghilangkan kebingungan log "Diubah" tanpa nama pengguna yang sebelumnya dipicu oleh pembacaan publik (`view_count`/`download_count`).
    *   Metrik publik kini dicatat secara terpisah dan terhormat sebagai `Pengunjung (Tamu)` dengan keterangan spesifik (misal: `Kunjungan publik (view_count: 1126 → 1127)`).
    *   Kolom Keterangan pada `ActivityLogResource` ditampilkan secara default dan dapat dicari (*searchable*).
*   **Pembaruan Kredensial Dev Admin**:
    *   Password akun pengembang `admin@jdih.test` diperbarui dan diselaraskan pada database serta `database/seeders/DatabaseSeeder.php`.

---

## 10. Status Sesi Terkini (11 November 2026 - Bagian 2)

### Sesi Bagian 9: Audit Eksploitasi & Penguatan Keamanan Komentar Katalog, Isian Wajib (Nama, Email, Telp/WA), & Proteksi Anti-Abuse
*   **Audit Keamanan Sistem Komentar Katalog (`CommentController.php`, `Comment.php`, `CommentResource.php`)**:
    *   **Anti-XSS & Input Sanitization (SP-002)**: Diterapkan sanitasi berlapis `strip_tags()` dan penyaringan null-byte/control character pada input nama, nomor telepon, dan teks komentar untuk menangkal potensi stored XSS.
    *   **Proteksi PII & Anti-Information Disclosure (SP-008)**: Menambahkan `protected $hidden = ['email', 'phone'];` pada model `Comment` dan membatasi proyeksi kolom publik pada `routes/web.php` ke `['id', 'legal_document_id', 'name', 'comment', 'created_at']` agar data kontak pribadi warga tidak bocor ke API publik atau inspeksi DOM.
    *   **Anti-Bot & Honeypot Trap (SP-022)**: Menyematkan field tersembunyi `b_hp_field` yang tak kasat mata bagi pengunjung manusia. Bot spammer yang otomatis mengisi seluruh field langsung ditolak dengan kode `HTTP 422 Unprocessable Content`.
    *   **Anti-Flooding & Duplicate Flood Guard (SP-024)**: Memperketat middleware route rate limit dari `throttle:30,1` menjadi `throttle:5,1` (maksimal 5 pengiriman/menit per IP) dan menolak submission duplikat dengan konten, email, dan dokumen yang sama dalam jendela waktu 5 menit (`HTTP 429`).
    *   **Enforced Moderation Status**: Mengunci nilai atribut `is_approved = false` secara mutlak di backend. Komentar tidak akan pernah tampil ke publik sampai disetujui secara sadar oleh admin di panel Filament.
*   **Penambahan Isian Wajib (Nama, Email, dan No. Telp / WhatsApp)**:
    *   Membuat migrasi `2026_11_11_120000_add_phone_to_comments_table.php` untuk menambahkan kolom `phone` (VARCHAR 30, nullable untuk backwards-compatibility data lawas) ke tabel `comments`.
    *   Menambahkan aturan validasi ketat di `CommentController`:
        - `name`: Wajib, string, min 2, max 100 karakter.
        - `email`: Wajib, email valid, max 150 karakter.
        - `phone`: Wajib, string, min 9, max 20 digit dengan regex telepon Indonesia/internasional (`/^(\+?[0-9\s\-\(\)]+)$/`).
        - `comment`: Wajib, string, min 5, max 1000 karakter.
*   **Penyelarasan Antarmuka Admin Filament (`CommentResource.php`)**:
    *   Menambahkan kolom `phone` bertanda label *Telp / WA* yang dapat dicari (*searchable*) dan disalin (*copyable*) ke dalam tabel dan infolist detail komentar.
    *   Menambahkan input `phone` pada form detail komentar dengan tipe tel.
*   **Penyempurnaan Formulir Frontend (`DetailDokumen.tsx`)**:
    *   Menyediakan 3 kolom masukan sejajar yang rapi dan responsif: Nama Lengkap, Alamat Email, dan No. Telp / WhatsApp.
    *   Menambahkan indikator required asterik merah (`*`) dan teks penjaminan privasi bahwa data email & telepon dijaga kerahasiaannya untuk validasi internal admin.
    *   Mengganti `alert()` bawaan browser dengan notifikasi inline state modern (sukses / error) dengan visual badge *ShieldCheck* dan *AlertTriangle*.
    *   Menambahkan status tombol pengiriman dengan animasi spinner (*"Mengirim..."*) serta disable button saat proses berlangsung untuk mencegah double-click / multiple request.
*   **Kompilasi Frontend & Build Produksi**:
    *   Aset frontend telah dikompilasi ulang secara bersih via `npm run build` (vite v7.3.7) tanpa error.
