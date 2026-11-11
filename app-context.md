# APP CONTEXT — JDIH KABUPATEN BANJARNEGARA
# Last Updated: 2026-11-11
# State Snapshot untuk Vibes Coding Workflow / Antigravity IDE
# Status: Production Clean & Sanitized

[APP]
name = "JDIH Kabupaten Banjarnegara"
slug = "jdih-banjarnegara"
type = "Web Portal & Admin Backoffice"
stack = "Laravel 12 (v12.69.2) + Filament + Inertia.js (React) + Tailwind CSS + MySQL"
php_version = "8.5.12 (Production) / 8.2+ (Minimum Requirement)"
production_url = "https://jdih.banjarnegarakab.go.id"
timezone = "Asia/Jakarta (UTC+7)"
locale = "id"

[AUTH & ROLES]
admin_primary = "admin@jdih.test"
admin_dinas = "admin.jdih@banjarnegarakab.go.id"
admin_migration = "database/migrations/2026_10_12_100000_create_dinas_admin_user.php"
panel_access = "Dibatasi ke email resmi dinas (@banjarnegarakab.go.id, @jdih.test, atau admin terdaftar via canAccessPanel)"

[AUDIT_LOGS]
model = "App\Models\ActivityLog"
table = "activity_logs"
listener = "App\Providers\AppServiceProvider (Event::listen Login & Logout)"
tracked_events = "User Login, User Logout, Model CRUD (LegalDocument, etc.)"
real_ip_support = "Cloudflare CF-Connecting-IP, X-Real-IP, & X-Forwarded-For forwarded via AppServiceProvider::getClientIp + trustProxies(*) di bootstrap/app.php"

[SECURITY]
nginx_hardened = "Dotfiles (.env, .git, etc.) diblokir return 404"
ssl_setup = "Cloudflare Origin CA / Custom SSL Pemda via Nginx vhost"
rate_limiting = "Tiered Limiter: 5x/min per email (akun), 25x/min per IP (kantor), CAPTCHA anti-bot gate, route throttle pada auth/AI/surveys"
https_scheme_guard = "Otomatis paksa HTTPS di produksi, bypass pada localhost / 127.0.0.1 / *.test via AppServiceProvider"
csp_dynamic = "SecurityHeaders mengizinkan Vite dev HMR 127.0.0.1:5173 di lokal, strict CSP + HSTS di produksi"
header_dedup = "Nginx single layer emission SP-023 via proxy_hide_header"
server_cloaking = "SP-031 Server: JDIH-Portal via Nginx header override"

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
mobile_routes = "/mobile, /mobile/pencarian, /mobile/dokumen/{id}, /mobile/berita, /mobile/produk-hukum-desa, /mobile/statistik, /mobile/info"
sticky_navigation = "5 Elevated Tabs (Home, Peraturan [Drawer], Cari [Teal Action], Berita, Menu [Drawer])"
action_drawers = "Drawer Peraturan (Perda, Perbup, SK, Desa, Putusan, Monografi) & Drawer Menu (Statistik, Aspirasi, IKM Modal, Profil, JDIHN, Linktree)"
home_rhythm = "8-Sektor Selang-Seling (Hero Navy, Kategori Soft Canvas, Infografis Mint, Regulasi White, Statistik Midnight, Berita Slate, Video Cyan, Tautan White)"
village_mobile = "Mobile/ProdukHukumDesa.tsx (OpenSID selector, Category Pills, unified 'Lihat / Unduh' button)"
info_mobile = "Mobile/InfoJdih.tsx (All-in-one profile with expandable accordions: Visi Misi, Dasar Hukum, Tupoksi, SOP)"
infographic_ui = "Mobile optimized w-[155px], aspect-[3/4] portrait poster, fullscreen lightbox modal"
desktop_redirect = "Auto-redirect desktop access on /mobile to /"

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

[OPENSID_INTEGRATION]
status = "Aktif & Hardened (Inter-Server Nargaroth)"
nginx_global_rewrite = "/internal_api/ -> /index.php/internal_api/$1 pada /etc/nginx/global_settings (mewarisi ke seluruh vhost OpenSID)"
hosts_resolution = "/etc/hosts pada Nargaroth me-resolve *.desa.id ke 103.255.133.227 (bypass Cloudflare bot-challenge secara lokal & aman SSRF)"
apiasmara_hardening = "Rate limit 10 req/min per IP via sliding window (/tmp/rate_limit_asmara), strict CORS (posyandu & jdih only), hash_equals timing attack defense"
jdih_db_villages_synced = "63 desa terverifikasi & aktif di jdihdb1.villages (is_active = 1, dari total 112 desa terdaftar)"
rate_limiting = "JDIH proxy rate limited via throttle:30,1 pada /api/produk-hukum-desa"
tmp_maintenance = "Pembersihan harian /etc/cron.daily/cleanup-opensid-sessions terpasang (Inode /tmp stabil di 20%)"

[VISITOR_ANALYTICS]
middleware = "App\Http\Middleware\RecordVisitor"
table = "visitors (ip_address, visited_date, hits, user_agent, unique ip+date)"
throttling = "60s per IP via cache"
online_tracking = "Cache sliding window 5 min (active_online_visitors)"
ui_desktop = "Card section Statistik Pengunjung & Akses Portal pada Pages/Statistik.tsx (Hari Ini, Bulan Ini, Total Kunjungan, Dokumen Dibaca, Online Live)"
ui_mobile = "Card Pengunjung Portal pada Mobile/Statistik.tsx (4 Metrik + Online Live Badge)"
chart_mobile_fix = "Container h-[340px], bottom margin 65px, toggle filter Top 8 vs Semua, minPointSize=4"

[FASE_STATUS]
active_fase = "Fase 7 (Audit Keamanan Selesai & Stabilisasi Dependensi)"
security_audit = "OWASP Top 10:2025 Audit selesai (.docs/security-audit.md). VULN-001, VULN-003, VULN-004, VULN-006 resolved."
pending_task = "Sinkronisasi 179 regulasi tanpa relasi & accessor pivot relation_type"
