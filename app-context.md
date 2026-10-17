# APP CONTEXT — JDIH KABUPATEN BANJARNEGARA
# Last Updated: 2026-10-17
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
https_scheme_guard = "Otomatis paksa HTTPS di produksi, bypass pada localhost / 127.0.0.1 / *.test via AppServiceProvider"

[AI_ASSISTANT]
primary_llm = "Google Gemini API via GeminiService.php (Multi-Key Pool rotation, withoutVerifying SSL)"
fallback_pool = "gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash"
offline_rag = "App\Services\OfflineLegalRagService.php (100% Native PHP in-process, tanpa dependensi python/subprocess/shell)"
cli_helper = "rag_search.py (Dynamic OS detection: python3 on Linux, python on Windows)"
error_sanitizer = "CLI execution failure masked; fallback mulus ke OfflineLegalRagService tanpa leak pesan terminal"
desktop_ui = "Aktif pada DetailDokumen.tsx (modal popup)"
mobile_ui = "Aktif pada Mobile/DetailDokumen.tsx (bottom-sheet drawer 85vh)"

[PWA_AND_MOBILE]
manifest = "public/manifest.json (start_url: /mobile, theme: #0d9488, bg: #ffffff)"
service_worker = "public/sw.js (network-first navigation, cache fallback, auto-cleanup)"
registration = "resources/views/app.blade.php"
mobile_routes = "/mobile, /mobile/pencarian, /mobile/dokumen/{id}, /mobile/berita, /mobile/info"

[RESPONSIVE_STANDARDS]
primary_desktop = "1366x768 (Standar Laptop Layanan Pemerintahan & Display 125% scaling ~1092px)"
mobile_target = "Android 3M (360px, 393px, 412px)"
container_rule = "max-w-[1366px] mx-auto px-4 lg:px-6"
viewport_rule = "min-h-[calc(100vh-140px)] prevent vertical clipping"

[DEPLOYMENT]
server_nature = "Linux Server tanpa Node.js / NPM"
flow = "Local Vite Build (public/build) -> commit git -> pull di server -> composer install -> migrate -> optimize:clear"
storage = "Symlink public/storage -> storage/app/public via php artisan storage:link"
disk_default = "Filament forms & tables harus eksplisit ->disk('public')"

[FASE_STATUS]
active_fase = "Fase 7 (Audit Relasi Keterkaitan Peraturan & Finalisasi Stabilitas)"
pending_task = "todo.md: Sinkronisasi 179 regulasi tanpa relasi & accessor pivot relation_type"
