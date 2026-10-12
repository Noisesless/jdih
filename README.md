# JDIH Kabupaten Banjarnegara

[![Laravel Version](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![Filament Version](https://img.shields.io/badge/Filament-v3-yellow.svg)](https://filamentphp.com)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-React-purple.svg)](https://inertiajs.com)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue.svg)](https://php.net)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](#-mobile-pwa-experience)

Portal Jaringan Dokumentasi dan Informasi Hukum (JDIH) Kabupaten Banjarnegara yang modern, terintegrasi, responsif, dan inovatif. Aplikasi ini dirancang untuk memberikan transparansi produk hukum daerah kepada masyarakat dengan standar Permenkumham Nomor 8 Tahun 2019.

---

## ✨ Fitur Unggulan

### 🛡️ Audit Trail & Keamanan Tingkat Tinggi
- **Pencatatan Aktivitas Otomatis**: Setiap aksi login, logout, dan modifikasi dokumen hukum tercatat secara real-time di tabel `activity_logs`.
- **WIB Timezone Ready**: Seluruh pencatatan waktu sistem menggunakan zona waktu `Asia/Jakarta` (WIB / UTC+7).
- **Hardened Web Server**: Blokir akses publik ke file sensitif (`.env`, `.git`, composer, dll.) dengan respon 404 langsung di level Nginx.
- **Cloudflare Real IP Passthrough**: Deteksi dan rekaman IP publik asli pengguna yang akurat melalui header Cloudflare.

### 👥 Manajemen Hak Akses Multi-Admin
- **Admin Utama & Admin Dinas**: Tersedia akun administrator operasional untuk Bagian Hukum (`admin.jdih@banjarnegarakab.go.id`) dengan migrasi otomatis.
- **Filament v3 Backoffice**: Antarmuka dashboard modern, intuitif, dan cepat untuk input serta kurasi peraturan daerah.

### 🎪 Dynamic Hero Slider & Branding
- **Slider Manajemen Penuh**: Admin dapat menambah dan mengatur urutan slide hero, headline, deskripsi, hingga kutipan hukum.
- **Aset Teroptimasi**: Format WebP digunakan pada logo dan gambar untuk memangkas ukuran beban hingga 87%.

### 🗳️ Dialog Publik, Aspirasi & AI Chatbot
- **Partisipasi Masyarakat**: Form konsultasi publik dan kolom aspirasi masyarakat terhadap rancangan peraturan.
- **AI Legal Assistant**: Didukung Groq Llama 3.1 untuk menjawab pertanyaan hukum umum secara cepat dan interaktif.

### 📊 Statistik & Rekap IKM
- **Visualisasi Data Interaktif**: Tren produk hukum tahunan, klasifikasi dokumen, dan laporan Indeks Kepuasan Masyarakat (IKM) yang dapat diekspor ke PDF dan CSV.

---

## 🚀 Tech Stack

- **Backend**: Laravel 11 (PHP 8.2+)
- **Admin Panel**: Filament v3
- **Frontend**: React 18 with Inertia.js
- **Styling**: Tailwind CSS & Framer Motion
- **Database**: MySQL / MariaDB
- **Web Server**: Nginx + FastCGI (Varnish/Cloudflare Compatible)

---

## 🚢 Prosedur Pembaruan & Deployment (Server Production)

Aplikasi ini menggunakan alur **Local Build** sehingga server produksi tidak perlu menjalankan dependensi Node.js:

### 1. Build di Komputer Lokal
```bash
npm run build
git add .
git commit -m "feat: build asset & update fitur"
git push origin main
```

### 2. Update di Server Produksi (SSH)
```bash
cd ~/htdocs/jdih.banjarnegarakab.go.id

git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
```

---

## 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 JDIH Kabupaten Banjarnegara. Seluruh hak cipta dilindungi undang-undang.
