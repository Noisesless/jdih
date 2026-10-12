# Dependency Graph — JDIH Kabupaten Banjarnegara

Dokumen analisis dependensi berkas penting pada codebase JDIH Kabupaten Banjarnegara.

## 🔴 Critical Files (Paling Banyak Di-import / Dampak Global — Hati-Hati Saat Modifikasi)

| File | Tipe | Alasan & Keterikatan |
|---|---|---|
| `app/Providers/AppServiceProvider.php` | Service Provider | Mendaftarkan Event Listener Login/Logout Audit Trail, Vite macro, HTTPS scheme force |
| `app/Models/User.php` | Model Auth | Mengimplementasikan `FilamentUser`, autentikasi sesi, relasi ke `activity_logs` |
| `app/Models/LegalDocument.php` | Core Model | Model produk hukum utama yang berelasi ke Category, Relations, Chunks RAG |
| `config/app.php` | Global Config | Mengatur Timezone (`Asia/Jakarta`), Locale, Providers, dan Encryption Key |
| `app/Http/Middleware/HandleInertiaRequests.php` | Inertia Middleware | Menyediakan data global props (auth user, logo, menu) ke seluruh halaman React |

## 🟡 High-Impact Files (Ubah = Efek Luas ke Modul Tertentu)

| File | Depends On | Used By | Impact Level |
|---|---|---|---|
| `app/Models/ActivityLog.php` | User Model, Request | AppServiceProvider, Filament Log View | Sedang-Tinggi |
| `app/Filament/Resources/LegalDocumentResource.php` | LegalDocument, Filament Form/Table | Panel Admin Kurasi | Tinggi |
| `resources/js/Layouts/AppLayout.jsx` | React, Inertia | Seluruh Halaman Public Frontend | Tinggi |
| `routes/web.php` | Semua Controller | Seluruh Permintaan HTTP Web | Sangat Tinggi |

## 🟢 Leaf Files (Aman Diubah — Minimal Side Effect ke File Lain)

| File | Purpose |
|---|---|
| `resources/js/Components/HeroSection.jsx` | Tampilan visual slider hero beranda |
| `resources/js/Components/Footer.jsx` | Tampilan footer dan informasi kontak |
| `database/seeders/DummyDataSeeder.php` | Data uji coba saat migrasi lokal |
| `app/Console/Commands/PolishJdihData.php` | Script one-shot perapian data lama |
