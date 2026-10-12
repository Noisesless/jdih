# Handover Document: Pengembangan Portal JDIH Banjarnegara

Dokumen ini berisi ringkasan progres pengembangan sistem JDIH Banjarnegara, isu-isu teknis yang telah diselesaikan, konfigurasi keamanan, akun administratif, serta panduan untuk pengembang selanjutnya. Aplikasi ini dibangun dengan stack **Laravel 11, Filament v3, Inertia.js, React, dan Tailwind CSS**.

---

## 1. Ringkasan Fitur & Perbaikan Terbaru (Oktober 2026)

### A. Audit Trail & Pencatatan Aktivitas (Activity Log)
*   **Event Listener Terpusat**: Login dan Logout pengguna otomatis tercatat di tabel `activity_logs` melalui `App\Providers\AppServiceProvider` menggunakan event `Illuminate\Auth\Events\Login` dan `Illuminate\Auth\Events\Logout`.
*   **Zona Waktu WIB (Asia/Jakarta)**: Timezone default aplikasi diatur ke `Asia/Jakarta` (`UTC+7`) di `config/app.php` dan `.env.example`, sehingga seluruh timestamp database (`created_at`, `updated_at`, activity log) sinkron dengan waktu lokal.
*   **Pencegahan Duplikasi Log**: Menghilangkan logging ganda di `Filament/Pages/Auth/Login.php` sehingga setiap sesi autentikasi tercatat tepat satu kali.

### B. Akun Administratif Sistem
*   **Admin Utama**:
    *   Email: `admin@jdih.test` (atau akun admin awal yang terdaftar)
*   **Admin Dinas (Bagian Hukum)**:
    *   Email: `admin.jdih@banjarnegarakab.go.id`
    *   Dibuat otomatis via migration: `database/migrations/2026_10_12_100000_create_dinas_admin_user.php`
    *   Tersedia juga di seeder: `database/seeders/DatabaseSeeder.php`

### C. Keamanan Nginx Vhost & Cloudflare Integration
*   **Proteksi Dotfiles (.env, .git)**: Blokir total akses publik ke file `.env`, `.git`, `composer.lock`, dll., dengan mengembalikan response `404 Not Found / Deny All` pada layer web server Nginx.
*   **Cloudflare Real IP**: Penambahan header `CF-Connecting-IP` dan `X-Real-IP` pada reverse proxy Nginx agar IP publik asli pengguna tercatat di `activity_logs` (bukan IP proxy Cloudflare).
*   **Custom SSL Pemda**: Kompatibel dengan sertifikat SSL Cloudflare Origin CA / Pemda setempat menggunakan placeholder `{{ssl_certificate}}` dan `{{ssl_certificate_key}}`.

### D. Fitur & Modul Utama Sebelumnya
*   **Integrasi AI Assistant (Groq API)**: Menggunakan model `llama-3.1-8b-instant` dengan proteksi bypass SSL di server jika diperlukan.
*   **Dynamic Hero Slider**: Pengelolaan subtitle, judul, kutipan hukum, serta switch statistik langsung via Filament.
*   **Forum Dialog Publik & Aspirasi**: Menampung feedback draft peraturan hukum dan konsultasi publik.
*   **Visualisasi Data & Statistik**: Grafik tren dokumen per tahun, jenis dokumen, dan rekap IKM (CSV & PDF).
*   **Optimasi Gambar & Logo**: Aset logo WebP memangkas ukuran aset hingga 87% untuk loading cepat.

---

## 2. Panduan Operasional & Deployment (Server Production)

### A. Langkah Update Rutin (SSH)
Setiap kali ada pembaruan kode di GitHub:
```bash
cd ~/htdocs/jdih.banjarnegarakab.go.id

git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
```

### B. Manajemen Storage & Media
1.  **Filament Disk Configuration**:
    *   Setiap kali menggunakan komponen `FileUpload` di Form Builder Filament, **wajib** menambahkan `->disk('public')`.
    *   Setiap kali menggunakan `ImageColumn` di Table Builder Filament, **wajib** menambahkan `->disk('public')`.
2.  **Storage Link**:
    *   Pastikan symlink storage terpasang:
        ```bash
        php artisan storage:link
        ```

### C. Konfigurasi Environment (.env) Kritis
Pastikan variabel berikut terdefinisi di file `.env` produksi:
```env
APP_NAME="JDIH Kabupaten Banjarnegara"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://jdih.banjarnegarakab.go.id
APP_TIMEZONE=Asia/Jakarta
APP_LOCALE=id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jdihdb1
DB_USERNAME=jdihdb1
DB_PASSWORD=xxxxxxxxx

GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxx
```

### D. Frontend Compilation (Vite & React)
Aplikasi menggunakan arsitektur **Local Build**. Seluruh pembaruan di `resources/js` harus di-build di lokal terlebih dahulu:
```bash
npm run build
git add public/build resources/js
git commit -m "feat: build latest assets"
git push origin main
```
Di server produksi tidak perlu menjalankan Node.js / `npm run build`, cukup lakukan `git pull`.
