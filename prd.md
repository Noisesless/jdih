<!-- ════════════════════════════════════════════════════════════════════════════
     🔒 CORE IDENTITY LOCK — JDIH KABUPATEN BANJARNEGARA
     Single Source of Truth identitas proyek ini.
     ════════════════════════════════════════════════════════════════════════════ -->

## 🔒 CORE IDENTITY LOCK (IMMUTABLE AFTER PRD APPROVAL)

| Parameter Identitas | Nilai Terkunci | Status |
| :--- | :--- | :--- |
| **Nama Aplikasi** | `JDIH Kabupaten Banjarnegara` | 🔒 IMMUTABLE |
| **Tipe Aplikasi** | `Portal Informasi Hukum & Backoffice Pemerintahan` | 🔒 IMMUTABLE |
| **Skala & Scope** | `Kabupaten / Publik Luas & Instansi Daerah` | 🔒 IMMUTABLE |
| **Core Value** | `Penyebarluasan informasi produk hukum daerah Banjarnegara yang transparan, akurat, dan terintegrasi standar Permenkumham No. 8/2019` | 🔒 IMMUTABLE |
| **Mode Proyek** | `Konversi Stack & Modernisasi Platform (Re-Platforming)` | 🔒 IMMUTABLE |
| **Tech Stack** | `Laravel 11 + Filament v3 + Inertia.js (React 18) + Tailwind CSS + MySQL` | 🔒 IMMUTABLE |
| **Package Manager** | `npm & composer` | 🔒 IMMUTABLE |
| **Palet No.** | `Custom Identity (Banjarnegara Green & Gold / Slate Dark)` | 🔒 IMMUTABLE |
| **Nama Kluster Palet** | `Emerald Law / Modern Civic` | 🔒 IMMUTABLE |
| **Hex: Bg / Surface** | `#0f172a / #1e293b (Dark) | #f8fafc / #ffffff (Light)` | 🔒 IMMUTABLE |
| **Hex: Accent1 / Accent2** | `#059669 (Emerald) / #d97706 (Amber Gold)` | 🔒 IMMUTABLE |
| **Hex: Text Utama** | `#0f172a (Light) / #f8fafc (Dark)` | 🔒 IMMUTABLE |
| **Mode Tema** | `Dynamic Theme & High-Contrast Support` | 🔒 IMMUTABLE |
| **Font Family** | `Plus Jakarta Sans / Inter (Body) + Outfit (Headings)` | 🔒 IMMUTABLE |
| **Geometri Box** | `Rounded 8px (var(--radius-md))` | 🔒 IMMUTABLE |
| **Avatar Shape** | `Lingkaran Sempurna rounded-full` | 🔒 IMMUTABLE |
| **Navigasi Model** | `Top Sticky Navbar (Frontend) & Left Sidebar (Filament Admin)` | 🔒 IMMUTABLE |
| **Hero Layout** | `Dynamic Hero Slider with Legal Quote & Quick Search` | 🔒 IMMUTABLE |
| **Captcha** | `Native Rate-Limiting + Honeypot Protection` | 🔒 IMMUTABLE |
| **Fase Aktif** | `Fase 7 (Hardening, Security & Handover Operasional)` | 🔄 DYNAMIC |
| **Terakhir Diperbarui** | `2026-10-12 12:00 WIB` | 🔄 DYNAMIC |

---

# PRODUCT REQUIREMENTS DOCUMENT (AI-READABLE)

## 1. PROJECT IDENTITY & CORE PURPOSE
- **Nama Project:** JDIH Kabupaten Banjarnegara
- **Tipe Aplikasi:** Portal Pemerintahan & Sistem Informasi Hukum Daerah
- **Skala & Scope Aplikasi:** Kabupaten Banjarnegara, OPD, Desa/Kelurahan, dan Publik Luas
- **Core Value:** Memberikan layanan publik berbasis digital untuk aksesibilitas Peraturan Daerah (Perda), Peraturan Bupati (Perbup), Keputusan Bupati, serta artikel hukum secara cepat, aman, dan berstandar nasional JDIHN.
- **High-Level Explanation & Business Process:**
  1. **Publik:** Mengakses portal front-end, mencari dokumen hukum dengan multi-filter (jenis, tahun, nomor, status berlaku), membaca abstrak/teks lengkap, konsultasi hukum via dialog publik, serta tanya-jawab hukum via AI Legal Assistant.
  2. **Admin Bagian Hukum:** Mengunggah dokumen peraturan, metadata standar JDIHN, mengelola berita, banner hero, survei IKM, serta mengawasi jejak audit pengguna di `/admin`.
  3. **Integrasi Eksternal:** Sinkronisasi API ke JDIHN Nasional dan integrasi produk hukum desa.

## 2. TECH STACK & ARSITEKTUR
- **Backend Framework:** Laravel 11 (PHP 8.2+)
- **Admin Engine:** Filament v3
- **Frontend SPA Layer:** Inertia.js (React 18)
- **Styling Engine:** Tailwind CSS & Framer Motion
- **Database Engine:** MySQL 8 / MariaDB (InnoDB, utf8mb4)
- **Search & AI:** Fulltext indexing + Groq Llama 3.1 8B Instant (RAG Legal Assistant)
- **Web Server:** Nginx FastCGI Reverse Proxy + Cloudflare SSL
- **Timezone:** `Asia/Jakarta` (WIB / UTC+7)

## 3. KEY METRICS & COMPLIANCE
- Standar Permenkumham No. 8 Tahun 2019 (Kelengkapan metadata, abstrak, uji materi, status peraturan).
- OWASP Top 10 Security Hardening (CSRF, XSS, SSRF QR bypass, Nginx dotfiles block).
- Audit Trail terpusat untuk setiap event autentikasi dan CRUD peraturan.
