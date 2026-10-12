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

## [ ] Fase 7: Sinkronisasi Keterkaitan Antar-Peraturan (Mencabut & Mengubah)
- [ ] Buat Artisan Command Auto-Linker (`php artisan jdih:link-relations`) untuk menautkan otomatis 179+ relasi (16 pencabutan & 163 perubahan) dari teks judul peraturan ke tabel `legal_document_relations`
- [ ] Perbarui status keberlakuan dokumen yang dicabut dari `'Berlaku'` menjadi `'Dicabut'` / `'Tidak Berlaku'` serta isi catatan `status_note` secara otomatis
- [ ] Perbaiki accessor `getRelatedAttribute()` & `getReferencedByAttribute()` di `LegalDocument.php` agar menyertakan nilai `relation_type` dari pivot table untuk frontend Inertia
- [ ] Implementasikan Model Observer / Event pada `LegalDocumentRelation`: otomatis update status dokumen target saat admin menambah relasi pencabutan di Filament Admin
- [ ] Sinkronisasi data keterkaitan ke JDIHN Pusat: sertakan array `peraturan_terkait` pada payload `formatDocumentForSync` di `JdihSyncController`
