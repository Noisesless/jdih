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
- [x] AI Chatbot Legal Assistant bertenaga Groq Llama 3.1

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

## [/] Fase 6: Dokumentasi Sistem & Monitoring Berkelanjutan
- [x] Sinkronisasi dokumentasi Blueprint Brainvibes (`/.docs/` 9 file + `prd.md` + `todo.md` + `handover.md` + `app-context.md`)
- [ ] Monitoring integritas data sinkronisasi API JDIHN secara berkala
- [ ] Pengujian performa beban berkas PDF volume besar di server produksi
