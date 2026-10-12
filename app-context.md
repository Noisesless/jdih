# APP CONTEXT — JDIH KABUPATEN BANJARNEGARA
# Last Updated: 2026-10-12
# State Snapshot untuk Vibes Coding Workflow / Antigravity IDE

[APP]
name = "JDIH Kabupaten Banjarnegara"
slug = "jdih-banjarnegara"
type = "Web Portal & Admin Backoffice"
stack = "Laravel 11 + Filament v3 + Inertia.js (React) + Tailwind CSS + MySQL"
php_version = "8.2+"
production_url = "https://jdih.banjarnegarakab.go.id"
timezone = "Asia/Jakarta (UTC+7)"
locale = "id"

[AUTH & ROLES]
admin_primary = "admin@jdih.test"
admin_dinas = "admin.jdih@banjarnegarakab.go.id"
admin_migration = "database/migrations/2026_10_12_100000_create_dinas_admin_user.php"
panel_access = "Semua user terdaftar dapat mengakses panel /admin via FilamentUser contract"

[AUDIT_LOGS]
model = "App\Models\ActivityLog"
table = "activity_logs"
listener = "App\Providers\AppServiceProvider (Event::listen Login & Logout)"
tracked_events = "User Login, User Logout, Model CRUD (LegalDocument, etc.)"
real_ip_support = "Cloudflare CF-Connecting-IP & X-Real-IP forwarded"

[SECURITY]
nginx_hardened = "Dotfiles (.env, .git, etc.) diblokir return 404"
ssl_setup = "Cloudflare Origin CA / Custom SSL Pemda via Nginx vhost"
rate_limiting = "Filament default 5 attempts/minute pada /admin/login"

[DEPLOYMENT]
flow = "Local build (npm run build) -> push git -> pull di server -> migrate -> optimize:clear"
storage = "Symlink public/storage -> storage/app/public via php artisan storage:link"
disk_default = "Filament forms & tables harus eksplisit ->disk('public')"
