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
*   **Audit Keterkaitan Antar-Peraturan**: Menemukan 179 regulasi yang mencabut/mengubah peraturan lain namun tabel relasi masih kosong (0 baris). Celah ini telah didokumentasikan di `todo.md` untuk penanganan terpisah.

---

## 2. Kredensial & Lingkungan
*   **URL Produksi**: `https://jdih.banjarnegarakab.go.id`
*   **Panel Admin**: `https://jdih.banjarnegarakab.go.id/admin`
*   **Admin Utama**: `admin@jdih.test`
*   **Admin Dinas**: `admin.jdih@banjarnegarakab.go.id` (Password: `JDIH#Banjarnegara26`)

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

