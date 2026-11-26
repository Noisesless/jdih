# Tech Stack & Dependencies — JDIH Kabupaten Banjarnegara

Inventaris stack teknologi aktual dari `composer.json`, `composer.lock`, dan `package.json` (tersinkron antara Dev, GitHub, dan Production).

## 1. Runtime & Core Stack

| Komponen | Versi Terpasang | Keterangan |
|---|---|---|
| **PHP (Production FPM)** | `8.5.12 NTS` | `/etc/php/8.5/fpm` (`php8.5-fpm`) |
| **PHP (Dev Local Tool)** | `8.5.13 NTS` | Terisolasi di `.tools/php/` (`use-php.ps1`, di-gitignore) |
| **Laravel Framework** | `v12.72.0` | Patch keamanan CVE tersinkron |
| **Filament Admin Panel** | `v5.11.2` | Termasuk `actions`, `forms`, `infolists`, `notifications`, `schemas`, `tables`, `widgets` |
| **Livewire** | `v4.4.8` | Engine interaktif panel admin Filament & CAPTCHA login |
| **Inertia.js (Laravel / React)** | `^2.0` | Jembatan SPA server-driven Laravel ↔ React |
| **React & TypeScript** | React `18.2.0` / TS `^5.0.2` | Antarmuka portal desktop & mobile PWA |
| **Vite & Tailwind CSS** | Vite `^7.0.7` / Tailwind `^3.2.1` | Bundling lokal ke `public/build/` |
| **Database** | MySQL 8 / MariaDB | Engine InnoDB (`utf8mb4_unicode_ci`) |

## 2. Production PHP Dependencies (`composer.lock`)

| Paket | Versi Terkunci | Fungsi |
|---|---|---|
| `laravel/framework` | `v12.72.0` | Core framework MVC & routing |
| `filament/filament` | `v5.11.2` | Panel backoffice admin & resource CRUD |
| `livewire/livewire` | `v4.4.8` | Komponen dinamis Filament |
| `inertiajs/inertia-laravel` | `^2.0` | Adapter backend Inertia.js |
| `guzzlehttp/guzzle` | `7.16.1` | HTTP client (integrasi OpenSID & Gemini API) |
| `league/commonmark` | `2.10.7` | Parser Markdown aman (output RAG/AI) |
| `symfony/http-foundation` | `v7.4.23` | HTTP Request/Response & Trusted Proxies |
| `symfony/html-sanitizer` | `v8.1.11` | Sanitasi HTML |
| `simplesoftwareio/simple-qrcode` | Terpasang | Generator SVG QR Code lokal |
| `tightenco/ziggy` | Terpasang | Helper routing Laravel di frontend React |

## 3. Frontend Production Dependencies (`package.json`)

| Paket | Constraint | Fungsi |
|---|---|---|
| `@inertiajs/react` | `^2.0.0` | Client router & page renderer |
| `react` / `react-dom` | `^18.2.0` | UI library |
| `lucide-react` | `^1.8.0` | Icon family resmi antarmuka portal |
| `recharts` | `^3.8.1` | Grafik statistik regulasi & visitor |
| `framer-motion` | `^12.38.0` | Animasi drawer mobile & transisi interaktif |
| `dompurify` | `^3.4.17` | Sanitasi DOM XSS di sisi klien (chat AI) |
| `react-markdown` / `remark-gfm` | `^10.1.0` / `^4.0.1` | Rendering jawaban AI Assistant |
| `axios` | `^1.11.0` | HTTP request form & chat |

## 4. Development & Tooling Dependencies (`require-dev` / `devDependencies`)
- **PHP Dev:** `phpunit/phpunit` (`11.5.55`), `laravel/pint` (`v1.29.1`), `laravel/breeze` (`v2.4.1`), `nunomaduro/collision` (`v8.9.3`), `mockery/mockery` (`1.6.15`).
- **JS Dev:** `vite` (`^7.0.7`), `typescript` (`^5.0.2`), `@vitejs/plugin-react` (`^4.2.0`), `tailwindcss` (`^3.2.1`), `concurrently` (`^9.0.1`).
