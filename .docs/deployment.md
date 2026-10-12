# Deployment Guide — JDIH Kabupaten Banjarnegara

Panduan teknis penerapan (deployment), environment variables, dan strategi rollback untuk server produksi.

## 1. Deployment Targets
| Target | Tipe | Web Server | PHP / Node | Domain |
|---|---|---|---|---|
| **Production** | Cloud Server / VPS | Nginx 1.24+ (Reverse Proxy) + FastCGI | PHP 8.2+ FPM (No Node.js on Server) | `jdih.banjarnegarakab.go.id` |
| **Development** | Localhost Workstation | Nginx / Artisan Serve | PHP 8.2+, Node 20+ (Vite) | `localhost:8000` / `jdih.test` |

## 2. Environment Mapping (.env)

| Variabel | Development | Production | Keterangan |
|---|---|---|---|
| `APP_ENV` | `local` | `production` | Wajib production di server |
| `APP_DEBUG` | `true` | `false` | Cegah kebocoran stack trace |
| `APP_URL` | `http://localhost` | `https://jdih.banjarnegarakab.go.id` | URL canonical |
| `APP_TIMEZONE` | `Asia/Jakarta` | `Asia/Jakarta` | Waktu WIB lokal |
| `DB_CONNECTION` | `mysql` | `mysql` | MySQL/MariaDB |
| `DB_DATABASE` | `jdihdb1` | `jdihdb1` | Database produksi |
| `SESSION_SECURE_COOKIE`| `false` | `true` | Enforce HTTPS cookies |
| `GROQ_API_KEY` | `gsk_...` | `gsk_...` | API key LLM AI |

## 3. Pre-Deploy Checklist
- [x] Jalankan `npm run build` di komputer lokal untuk mengompilasi aset `public/build`.
- [x] Pastikan `public/build` ter-commit ke git.
- [x] Pastikan `APP_DEBUG=false` pada `.env` server.
- [x] Pastikan vhost Nginx memblokir file dotfiles (`.env`, `.git`) dan meneruskan `CF-Connecting-IP`.

## 4. Langkah Eksekusi di Server Produksi (SSH)
```bash
cd ~/htdocs/jdih.banjarnegarakab.go.id

# 1. Tarik pembaruan
git pull origin main

# 2. Update dependensi PHP tanpa paket dev
composer install --no-dev --optimize-autoloader

# 3. Jalankan migrasi database
php artisan migrate --force

# 4. Pastikan symlink storage aktif
php artisan storage:link

# 5. Optimasi cache aplikasi
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
| Kerusakan aset frontend | Revert commit frontend di lokal -> `npm run build` -> push -> pull di server |
