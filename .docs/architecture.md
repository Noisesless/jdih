# Arsitektur Sistem — JDIH Kabupaten Banjarnegara

Dokumen ini menjelaskan arsitektur makro, aliran data, dan interaksi antarkomponen pada sistem JDIH Kabupaten Banjarnegara.

```mermaid
graph TD
    Client[Publik / Browser] -->|HTTPS / Port 443| Cloudflare[Cloudflare CDN & SSL]
    Cloudflare -->|SSL Passthrough + CF-Connecting-IP| Nginx[Nginx Reverse Proxy & Hardening]
    
    subgraph "Web Server Layer"
        Nginx -->|Dotfile Filter 404| SecurityGate[Security Gate: Blokir .env & dotfiles]
        Nginx -->|Port 8080 FastCGI| PHP[PHP-FPM 8.2+]
    end

    subgraph "Application Core (Laravel 11)"
        PHP --> Inertia[Inertia.js Middleware & React 18 SPA]
        PHP --> Filament[Filament v3 Admin Panel]
        PHP --> AppService[AppServiceProvider: Audit Trail Listeners]
        PHP --> AiController[AiAssistantController: Sanitizer & Router]
    end

    subgraph "AI & Legal Knowledge Engine"
        AiController -->|Primary Tier: Multi-Key Pool| GeminiService[Google Gemini API: gemini-2.5-flash]
        AiController -->|Offline Fallback Tier: 100% In-Process| OfflineRAG[Native PHP OfflineLegalRagService]
        AiController -->|Local Subprocess Helper: python/python3| PythonRAG[rag_search.py script]
    end

    subgraph "Data & Storage Layer"
        AppService --> MySQL[(MySQL 8 / MariaDB: jdihdb1)]
        Filament --> MySQL
        Filament --> Storage[storage/app/public -> public/storage]
        OfflineRAG --> MySQL
    end
```

## 1. Lapisan Presentasi (Presentation Layer)
- **Frontend Publik**: React 18 dibungkus oleh Inertia.js untuk pengalaman Single Page Application (SPA) yang dinamis tanpa perlu membangun REST API terpisah untuk setiap view.
- **Styling**: Tailwind CSS dengan variasi tema modern sivik, typography Plus Jakarta Sans / Outfit, dan responsivitas laptop (1366×768 / scaling 125%) hingga ponsel (Android 3M).
- **Admin Panel**: Filament v3 yang terintegrasi secara modular dengan Form Builder, Table Builder, Notification, dan Actions.
- **Aset Frontend**: Terkompilasi mandiri via Vite (`public/build`) di lingkungan pengembang lokal sehingga server produksi dapat beroperasi tanpa Node.js.

## 2. Lapisan Logika & Bisnis (Business Logic Layer)
- **Framework**: Laravel 11 dengan struktur MVC yang bersih.
- **Audit Logging**: Event-driven menggunakan listener `Illuminate\Auth\Events\Login` dan `Logout` di `AppServiceProvider` yang merekam `user_id`, nama, email, aksi, guard, IP publik (`$http_cf_connecting_ip`), user-agent, dan waktu WIB.
- **RAG & AI Assistant**: Layanan asisten hukum multi-tier:
  1. *Primary*: Google Gemini API dengan rotasi multi-key pool (`GEMINI_API_KEYS`) dan fallback pool model.
  2. *Secondary / Offline*: `OfflineLegalRagService` 100% Native PHP in-process via Eloquent & text matching (bebas dari subprocess Python atau kegagalan koneksi luar).
  3. *Error Masking Sanitizer*: Menjamin pesan kegagalan CLI/server internal tidak bocor ke antarmuka publik.

## 3. Lapisan Database & Storage (Data Layer)
- **Database Engine**: MySQL 8 / MariaDB dengan engine InnoDB penuh dan collation `utf8mb4_unicode_ci`.
- **Media Storage**: Menggunakan disk `public` di bawah `storage/app/public/` yang terhubung via symlink ke `public/storage`.
