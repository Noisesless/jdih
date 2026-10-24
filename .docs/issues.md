# Issues Tracker — JDIH Kabupaten Banjarnegara

Daftar isu teknis, bug yang telah diselesaikan, dan pemantauan perbaikan sistem.

## 🟢 Resolved Issues (Riwayat Perbaikan)

| ID | Tanggal | Modul | Gejala Masalah | Solusi yang Diterapkan | Status |
|---|---|---|---|---|---|
| **ISSUE-001** | 2026-10-12 | Auth / Audit | Akun admin khusus dinas belum tersedia di database produksi | Dibuatkan migrasi `2026_10_12_100000_create_dinas_admin_user.php` untuk `admin.jdih@banjarnegarakab.go.id` | ✅ RESOLVED |
| **ISSUE-002** | 2026-10-12 | Timezone / DB | Jam di `activity_logs` selisih 7 jam (tercatat 04:40 bukan 11:40) | Diubah ke `Asia/Jakarta` (WIB) pada `config/app.php` dan `.env.example` | ✅ RESOLVED |
| **ISSUE-003** | 2026-10-12 | Filament / Audit | Sesi login admin tercatat 2 kali di tabel `activity_logs` | Dihapus pemanggilan manual di `Filament/Pages/Auth/Login.php` dan dipusatkan ke Event Listener | ✅ RESOLVED |
| **ISSUE-004** | 2026-10-12 | Nginx / Security | File `.env` berisiko diunduh karena rule vhost hanya memblokir `.ht*` | Dikonfigurasi Nginx location `~ /\.(?!well-known)` dan block list file `.env` return 404 | ✅ RESOLVED |
| **ISSUE-005** | 2026-10-12 | Network / Proxy | Kolom `ip_address` di log audit mencatat IP Cloudflare | Ditambahkan header `proxy_set_header X-Real-IP $http_cf_connecting_ip;` pada vhost Nginx | ✅ RESOLVED |
| **ISSUE-006** | 2026-09-11 | Auth / Security | Captcha custom matematika di Filament login redundan | Dihapus karena Filament v3 sudah memiliki rate-limiting bawaan (5 attempts/min) | ✅ RESOLVED |
| **ISSUE-007** | 2026-08-09 | QR Code | Kerentanan SSRF pada generator QR Code | Divalidasi host whitelist dan protokol URL sebelum generate SVG | ✅ RESOLVED |
| **ISSUE-008** | 2026-10-12 | AI Assistant / CLI | Output shell `sh: 1: python: not found` bocor ke bubble chat pengguna di server Linux | Dibuatkan Native PHP Offline Legal RAG Engine (`OfflineLegalRagService.php`), deteksi dinamis `python3`/`python`, serta error masking sanitizer | ✅ RESOLVED |
| **ISSUE-009** | 2026-10-12 | UI / Responsive | Tampilan terpotong dan tab peraturan meluap pada laptop resolusi 1366×768 (Windows scaling 125% ~1092px) | Diterapkan standar laptop-first, container `max-w-[1366px]`, horizontal scroll tab navigasi, dan height adaptif `min-h-[calc(100vh-140px)]` | ✅ RESOLVED |
| **ISSUE-011** | 2026-10-17 | UI / Search | Tombol "Cari Dokumen" di sidebar `DetailDokumen.tsx` tidak aktif / tidak ada event handler | Ditambahkan form submit, state `searchQuery`, dan navigasi Inertia `router.get('/katalog', { namaDokumen: query })` | ✅ RESOLVED |
| **ISSUE-012** | 2026-10-17 | Dev Server / Assets | Browser gagal memuat seluruh aset Vite (`net::ERR_CONNECTION_CLOSED`) di server lokal | `AppServiceProvider.php` diperbaiki agar `URL::forceScheme('https')` hanya aktif di domain publik dan dikecualikan untuk `localhost`/`127.0.0.1`/`*.test` | ✅ RESOLVED |
| **ISSUE-013** | 2026-10-17 | Mobile / PWA | Versi mobile (`/mobile/dokumen/{id}`) belum memiliki fitur Asisten AI dan PWA belum terpasang Service Worker | Diimplementasikan drawer chat AI bottom-sheet di `Mobile/DetailDokumen.tsx`, dibuat `public/sw.js`, didaftarkan di `app.blade.php`, dan diselaraskan `public/manifest.json` | ✅ RESOLVED |
| **ISSUE-014** | 2026-10-17 | PDF Preview / Storage | Viewer PDF desktop memunculkan "Browser Anda tidak mendukung preview PDF langsung" karena symlink `public/storage` belum terhubung dan URL storage mengarah ke domain luar | Dijalankan `php artisan storage:link`, dibuat accessor `getFileAttribute()` mengembalikan path relatif `/storage/...` yang ter-encode, dan ditambahkan `iframe` fallback di dalam `<object>` | ✅ RESOLVED |
| **ISSUE-015** | 2026-10-24 | Security / Sanitasi | Residu berkas ad-hoc debug/test (`check_doc.php`, `fix_*.php`, folder `scratch/`, file audit di `public/`) dan kekhawatiran eksposur terhadap CVE PHP2Shell & CVE Laravel | Dilakukan sanitasi penuh: 24 berkas pengujian & duplikat dihapus dari Git, folder `scratch/` dibersihkan, laporan dipindah ke `docs/`, dan verifikasi kebal terhadap CVE-2026-114509 serta mitigasi PHP2Shell terdokumentasi | ✅ RESOLVED |

## 🔴 Open Issues
*(Saat ini tidak ada isu kritis yang belum terselesaikan)*

