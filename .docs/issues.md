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
| **ISSUE-010** | 2026-10-12 | Deployment / Assets | Server produksi Linux memunculkan `Command 'npm' not found` saat deploy | Workflow deploy dialihkan ke precompiled local bundle: build lokal `public/build/` dan di-track di Git repo | ✅ RESOLVED |

## 🔴 Open Issues
*(Saat ini tidak ada isu kritis yang belum terselesaikan)*
