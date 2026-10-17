# Deployment Guide — JDIH Kabupaten Banjarnegara

Panduan teknis penerapan (deployment), environment variables, dan strategi rollback untuk server produksi.

## 1. Deployment Targets
| Target | Tipe | Web Server | PHP / Node | Domain |
|---|---|---|---|---|
| **Production** | Cloud Server / VPS | Nginx 1.24+ (Reverse Proxy) + FastCGI | PHP 8.2+ FPM (Tanpa Node.js di server) | `jdih.banjarnegarakab.go.id` |
| **Development** | Localhost Workstation | Nginx / Artisan Serve | PHP 8.2+, Node 20+ (Vite) | `localhost:8000` / `jdih.test` |

## 2. Environment Mapping (.env)

| Variabel | Development | Production | Keterangan |
|---|---|---|---|
| `APP_ENV` | `local` | `production` | Wajib production di server |
| `APP_DEBUG` | `true` | `false` | Cegah kebocoran stack trace |
| `APP_URL` | `http://localhost:8000` | `https://jdih.banjarnegarakab.go.id` | URL canonical |
| `APP_TIMEZONE` | `Asia/Jakarta` | `Asia/Jakarta` | Waktu WIB lokal |
| `DB_CONNECTION` | `mysql` | `mysql` | MySQL/MariaDB |
| `DB_DATABASE` | `jdihdb1` | `jdihdb1` | Database produksi |
| `SESSION_SECURE_COOKIE`| `false` | `true` | Enforce HTTPS cookies |
| `GEMINI_API_KEYS` | `AIzaSy...` | `AIzaSy...,AIzaSy...` | API key Google Gemini (dipisahkan koma untuk rotasi) |
| `GEMINI_MODEL` | `gemini-2.5-flash` | `gemini-2.5-flash` | Model AI primer |
| `PYTHON_BIN` | `python` | `python3` | Jalur binary Python (opsional; otomatis dideteksi OS) |

## 3. Pre-Deploy Checklist (Di Komputer Pengembang Lokal)
- [x] Jalankan `npm run build` di workstation lokal untuk mengompilasi aset `public/build`.
- [x] Pastikan seluruh file di `public/build/` ter-commit ke git (`git add public/build/`).
- [x] Pastikan `public/sw.js` dan `public/manifest.json` ter-commit untuk dukungan Progressive Web App (PWA).
- [x] Pastikan symlink `public/storage` terhubung (`php artisan storage:link`) agar preview dokumen PDF tidak 404.
- [x] Pastikan `APP_DEBUG=false` pada `.env` server produksi.
- [x] Pastikan vhost Nginx memblokir file dotfiles (`.env`, `.git`) dan meneruskan `CF-Connecting-IP`.

## 4. Langkah Eksekusi di Server Produksi (SSH)
```bash
cd ~/htdocs/jdih.banjarnegarakab.go.id

# 1. Tarik pembaruan kode dan bundle aset yang sudah terkompilasi
git pull origin main

# 2. Update dependensi PHP tanpa paket dev
composer install --no-dev --optimize-autoloader

# 3. Jalankan migrasi database jika ada
php artisan migrate --force

# 4. Pastikan symlink storage aktif
php artisan storage:link

# 5. Bersihkan dan perbarui cache aplikasi
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 5. Rollback Plan
| Skenario | Aksi Pemulihan |
|---|---|
| Error pada rilis terbaru | `git reset --hard HEAD~1 && php artisan optimize:clear` |
| Gagal migrasi database | `php artisan migrate:rollback --step=1` |
| Kerusakan aset frontend | Revert commit frontend di lokal -> `npm run build` -> commit & push -> pull di server |
