# Design System — JDIH Kabupaten Banjarnegara

Single Source of Truth untuk Visual DNA, Desain Token, Tipografi, dan Responsivitas JDIH Kabupaten Banjarnegara.

## 1. Visual DNA & Design Tokens

### A. Palet Warna (Modern Civic / Emerald Law)
```css
:root {
  /* Background & Surface */
  --vibe-background:      #f8fafc; /* Slate 50 (Light) */
  --vibe-surface:         #ffffff; /* Pure White */
  --vibe-surface-dark:    #1e293b; /* Slate 800 */
  --vibe-background-dark: #0f172a; /* Slate 900 */

  /* Typography Colors */
  --vibe-text-main:       #0f172a; /* Slate 900 */
  --vibe-text-sub:        #64748b; /* Slate 500 */
  --vibe-text-light:      #f8fafc; /* Slate 50 */

  /* Brand Accents */
  --vibe-accent-1:        #059669; /* Emerald 600 (Warna Khas Hukum & Daun) */
  --vibe-accent-hover:    #047857; /* Emerald 700 */
  --vibe-accent-2:        #d97706; /* Amber 600 (Aksen Emas Kewibawaan) */

  /* Status Colors */
  --vibe-success:         #10b981;
  --vibe-warning:         #f59e0b;
  --vibe-error:           #ef4444;

  /* Geometry & Radii */
  --radius-sm:            4px;
  --radius-md:            8px;
  --radius-lg:            16px;
  --radius-full:          9999px;

  /* Typography */
  --vibe-font-main:       'Plus Jakarta Sans', 'Inter', sans-serif;
  --vibe-font-head:       'Outfit', 'Plus Jakarta Sans', sans-serif;

  /* Animation & Transitions */
  --vibe-transition:      all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### B. Aturan Tipografi
- **Headings (H1, H2, H3)**: Font `Outfit` dengan font-weight `600` / `700`, line-height proporsional.
- **Body & Subtitle**: Font `Plus Jakarta Sans` atau `Inter` untuk kenyamanan membaca berkas peraturan hukum panjang.
- **Dua Font Rule**: Seluruh visual frontend wajib menggunakan pairing font Heading + Body (bukan single font Inter generik).

## 2. Responsive Breakpoints (Laptop-First + Android 3M)

| Target Breakpoint | Nilai Lebar | Adaptasi Komponen |
|---|---|---|
| **Android Small** | `360px` | Single column, compact padding, font size -1px |
| **Android Medium** | `393px` / `412px` | Bottom navigation bar / Hamburger menu, touch target 44px+ |
| **Tablet** | `768px` | 2-column grid, compact search filter |
| **★ Laptop (PRIMARY)** | `1366px` | Standar laptop instansi (termasuk Windows scaling 125% ~1092px): Container `max-w-[1366px] px-4 lg:px-6`, 4-column bento, dynamic viewport height `min-h-[calc(100vh-140px)]` |
| **Desktop Wide** | `1920px` | Centered layout with balanced gutters |

### C. Layout & Container Rules
- **Container Constraint**: Menggunakan `max-w-[1366px] mx-auto px-4 lg:px-6` agar seluruh elemen tidak meregang berlebihan pada layar ultra-wide dan tetap proporsional pada layar laptop 1366×768.
- **Tab Navigation Horizontal Scroll**: Seluruh baris tab kategori/dokumen wajib menyertakan kelas `overflow-x-auto whitespace-nowrap scrollbar-none` agar tidak meluap atau memaksa baris baru yang merusak ritme vertikal.
- **Dynamic Viewport Height**: Menggunakan kalkulasi `min-h-[calc(100vh-140px)]` alih-alih `h-screen` kaku, mencegah elemen terpotong ketika taskbar OS atau baris bookmark browser aktif.

## 3. Komponen Inti & Interaksi
- **Logo**: Menggunakan aset WebP resmi tanpa manipulasi border/outline eksternal.
- **Kartu Dokumen**: Efek elevasi halus pada hover (`hover:-translate-y-1 hover:shadow-lg`).
- **Badge Status Peraturan**:
  - `Berlaku`: Hijau Emerald (`bg-emerald-100 text-emerald-800`)
  - `Diubah`: Kuning Amber (`bg-amber-100 text-amber-800`)
  - `Dicabut`: Merah Rose (`bg-rose-100 text-rose-800`)
