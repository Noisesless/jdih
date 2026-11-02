# API Documentation — Produk Hukum Desa

**JDIH Banjarnegara** — Sistem Jaringan Dokumentasi dan Informasi Hukum  
**Version:** 1.0.0  
**Base URL:** `https://jdih-banjarnegara.go.id/api/produk-hukum-desa`  
**Last Updated:** 2026-08-08

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [3.1 Fetch Legal Products](#31-fetch-legal-products)
   - [3.2 Fetch Categories](#32-fetch-categories)
4. [Request Parameters](#request-parameters)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)
7. [Data Models](#data-models)
8. [Examples](#examples)
9. [Architecture Notes](#architecture-notes)

---

## Overview

API Produk Hukum Desa menyediakan akses real-time ke dokumen peraturan desa dari seluruh desa di Kabupaten Banjarnegara yang terintegrasi dengan sistem **OpenSID**. API ini berfungsi sebagai **reverse proxy** yang meneruskan permintaan ke API OpenSID masing-masing desa (`*.desa.id`), dengan fitur filtering dan prioritasi otomatis.

### Key Features

| Feature | Description |
|---------|-------------|
| **Real-time Sync** | Data diambil langsung dari server OpenSID setiap desa |
| **SSRF Protection** | Validasi URL desa terhadap database lokal |
| **Smart Filtering** | Otomatis menyembunyikan dokumen SK dari tampilan publik |
| **Prioritization** | Dokumen Perkades ditampilkan di urutan atas |
| **Multi-filter** | Dukungan filter berdasarkan kategori, tahun, dan pencarian teks |
| **Pagination** | Dukungan paginasi untuk hasil yang besar |

---

## Authentication

Endpoint ini **tidak memerlukan autentikasi** dan dapat diakses secara publik.

```
No API key required
Public Access
```

---

## Endpoints

### 3.1 Fetch Legal Products

Mengambil daftar produk hukum desa dari desa tertentu.

```http
GET /api/produk-hukum-desa
```

#### Headers

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| `Accept` | `application/json` | Yes | Format respons yang diharapkan |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | **Yes** | — | URL website OpenSID desa (contoh: `desa.example.desa.id`) |
| `endpoint` | string | No | `/internal_api/produk-hukum` | Endpoint OpenSID yang dituju |
| `sort` | string | No | `-tahun` | Urutan hasil (`-tahun` = terbaru, `tahun` = tertua) |
| `page[size]` | integer | No | `50` | Jumlah item per halaman (max: 100) |
| `filter[kategori]` | string | No | — | Filter berdasarkan nama kategori |
| `filter[tahun]` | string | No | — | Filter berdasarkan tahun |
| `filter[search]` | string | No | — | Pencarian teks berdasarkan nama dokumen |

#### Request Example

```http
GET /api/produk-hukum-desa?url=desa.wonosobo.desa.id&sort=-tahun&page[size]=50&filter[kategori]=Peraturan Desa&filter[tahun]=2025
```

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "attributes": {
        "nama": "Peraturan Desa No. 5 Tahun 2025 Tentang Pembangunan Desa",
        "tahun": "2025",
        "kategori": "Peraturan Desa",
        "tgl_upload": "2025-03-15",
        "url_file": "https://desa.wonosobo.desa.id/storage/produk-hukum/perdes-5-2025.pdf",
        "satuan": "perdes-5-2025.pdf",
        "attr": {
          "tgl_ditetapkan": "2025-03-01"
        }
      }
    },
    {
      "id": "661f9511-f3ac-52e5-b827-557766551111",
      "attributes": {
        "nama": "Peraturan Kepala Desa No. 3 Tahun 2025 Tentang Badan Permusyawaratan Desa",
        "tahun": "2025",
        "kategori": "Peraturan Kepala Desa",
        "tgl_upload": "2025-02-20",
        "url_file": "https://desa.wonosobo.desa.id/storage/produk-hukum/perkades-3-2025.pdf",
        "satuan": "perkades-3-2025.pdf",
        "attr": {
          "tgl_ditetapkan": "2025-02-10"
        }
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 25,
    "last_page": 1
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data[].id` | string | UUID unik dokumen |
| `data[].attributes.nama` | string | Judul lengkap produk hukum |
| `data[].attributes.tahun` | string | Tahun penetapan |
| `data[].attributes.kategori` | string | Kategori dokumen (Peraturan Desa, Peraturan Kepala Desa, dll) |
| `data[].attributes.tgl_upload` | string \| null | Tanggal dokumen diunggah ke OpenSID (ISO 8601) |
| `data[].attributes.url_file` | string \| null | URL langsung ke file dokumen |
| `data[].attributes.satuan` | string \| null | Filename/file path dokumen |
| `data[].attributes.attr.tgl_ditetapkan` | string \| null | Tanggal penetapan dokumen (ISO 8601) |

---

### 3.2 Fetch Categories

Mengambil daftar kategori produk hukum yang tersedia untuk desa tertentu.

```http
GET /api/produk-hukum-desa
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | **Yes** | — | URL website OpenSID desa |
| `endpoint` | string | No | `/internal_api/produk-hukum/kategori` | Endpoint kategori OpenSID |

#### Request Example

```http
GET /api/produk-hukum-desa?url=desa.wonosobo.desa.id&endpoint=/internal_api/produk-hukum/kategori
```

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "1",
      "nama": "Peraturan Desa"
    },
    {
      "id": "2",
      "nama": "Peraturan Kepala Desa"
    },
    {
      "id": "3",
      "nama": "Peraturan Bersama Kepala Desa"
    },
    {
      "id": "4",
      "nama": "Keputusan Kepala Desa"
    }
  ]
}
```

---

## Request Parameters

### URL Format

Parameter `url` harus sesuai dengan format berikut:

```
{nama-desa}.desa.id
```

Contoh valid:
- `desa.wonosobo.desa.id`
- `desa.sgliman.desa.id`
- `desa.caritiesek.desa.id`

URL akan divalidasi terhadap database desa terdaftar. Jika tidak ditemukan, akan dicek apakah URL berakhiran `.desa.id`.

### Filter Options

| Filter Key | Type | Example | Description |
|------------|------|---------|-------------|
| `filter[kategori]` | string | `filter[kategori]=Peraturan Desa` | Filter berdasarkan kategori dokumen |
| `filter[tahun]` | string | `filter[tahun]=2025` | Filter berdasarkan tahun penetapan |
| `filter[search]` | string | `filter[search]=pembangunan` | Pencarian teks bebas pada judul dokumen |

Filter dapat dikombinasikan:

```http
GET /api/produk-hukum-desa?url=desa.wonosobo.desa.id&filter[kategori]=Peraturan Desa&filter[tahun]=2025&filter[search]=pembangunan
```

### Sorting

| Value | Description |
|-------|-------------|
| `-tahun` | Urutkan dari tahun terbaru (default) |
| `tahun` | Urutkan dari tahun tertua |

---

## Response Format

### Standard Success Response

Semua endpoint mengikuti format respons JSON standar:

```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 100,
    "last_page": 2
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200 OK` | Permintaan berhasil |
| `400 Bad Request` | Parameter `url` tidak disediakan |
| `403 Forbidden` | URL desa tidak terdaftar atau tidak valid |
| `429 Too Many Requests` | Terlalu banyak permintaan (rate limiting) |
| `500 Internal Server Error` | Galat server atau koneksi ke desa gagal |
| `502 Bad Gateway` | OpenSID desa tidak dapat dijangkau |
| `504 Gateway Timeout` | Timeout koneksi ke OpenSID desa |

---

## Error Handling

### Error Response Format

```json
{
  "error": "Deskripsi error"
}
```

### Error Examples

**400 — Missing URL**

```json
{
  "error": "Village URL is required"
}
```

**403 — Invalid Village URL**

```json
{
  "error": "URL desa tidak terdaftar atau tidak valid."
}
```

**500 — Server Error**

```json
{
  "error": "cURL error 28: Connection timed out after 10001 milliseconds"
}
```

**502 — Bad Gateway**

```json
{
  "error": "Failed to parse JSON response from village API"
}
```

---

## Data Models

### Legal Product (Produk Hukum)

Objek produk hukum yang dikembalikan oleh API:

```typescript
interface LegalProduct {
  id: string;                    // UUID unik
  attributes: {
    nama: string;                // Judul lengkap produk hukum
    tahun: string;               // Tahun penetapan
    kategori: string;            // Kategori dokumen
    tgl_upload?: string;         // Tanggal upload (ISO 8601)
    url_file?: string;           // URL langsung ke file
    satuan?: string;             // Filename/path
    attr?: {
      tgl_ditetapkan?: string;   // Tanggal penetapan (ISO 8601)
    };
  };
}
```

### Category (Kategori)

Objek kategori yang dikembalikan oleh endpoint kategori:

```typescript
interface Category {
  id: string;                    // ID unik kategori
  nama: string;                  // Nama kategori
}
```

### Village (Desa)

Struktur data desa yang terdaftar di sistem:

```typescript
interface Village {
  name: string;                  // Nama desa
  url: string;                   // URL OpenSID (*.desa.id)
}
```

---

## Examples

### Example 1: Fetch All Products for a Village

```bash
curl -X GET "https://jdih-banjarnegara.go.id/api/produk-hukum-desa?url=desa.wonosobo.desa.id&sort=-tahun&page[size]=50" \
  -H "Accept: application/json"
```

### Example 2: Filter by Category and Year

```bash
curl -X GET "https://jdih-banjarnegara.go.id/api/produk-hukum-desa?url=desa.wonosobo.desa.id&filter[kategori]=Peraturan Desa&filter[tahun]=2025" \
  -H "Accept: application/json"
```

### Example 3: Search Documents

```bash
curl -X GET "https://jdih-banjarnegara.go.id/api/produk-hukum-desa?url=desa.wonosobo.desa.id&filter[search]=pembangunan desa" \
  -H "Accept: application/json"
```

### Example 4: Get Available Categories

```bash
curl -X GET "https://jdih-banjarnegara.go.id/api/produk-hukum-desa?url=desa.wonosobo.desa.id&endpoint=/internal_api/produk-hukum/kategori" \
  -H "Accept: application/json"
```

### Example 5: JavaScript (Fetch API)

```javascript
async function fetchLegalProducts(villageUrl, filters = {}) {
  const params = new URLSearchParams({
    url: villageUrl,
    sort: '-tahun',
    'page[size]': 50,
    ...filters
  });

  const response = await fetch(`/api/produk-hukum-desa?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch products');
  }

  return response.json();
}

// Usage
fetchLegalProducts('desa.wonosobo.desa.id', {
  'filter[kategori]': 'Peraturan Desa',
  'filter[tahun]': '2025'
})
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Example 6: PHP (cURL)

```php
<?php

function fetchLegalProducts($villageUrl, $filters = []) {
    $params = array_merge([
        'url' => $villageUrl,
        'sort' => '-tahun',
        'page[size]' => 50
    ], $filters);

    $url = 'https://jdih-banjarnegara.go.id/api/produk-hukum-desa?' . http_build_query($params);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        $error = json_decode($response, true);
        throw new Exception($error['error'] ?? 'Failed to fetch products');
    }
    
    return json_decode($response, true);
}

// Usage
try {
    $data = fetchLegalProducts('desa.wonosobo.desa.id', [
        'filter[kategori]' => 'Peraturan Desa',
        'filter[tahun]' => '2025'
    ]);
    print_r($data);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

---

## Architecture Notes

### Data Flow

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Client     │ ─────►  │  JDIH Proxy API  │ ─────►  │  OpenSID Desa   │
│ (Browser/    │         │  (Laravel)       │         │  (*.desa.id)    │
│  App)        │ ◄─────  │                  │ ◄─────  │                 │
└──────────────┘         └──────────────────┘         └─────────────────┘
                              │            │                  │
                              ▼            ▼                  ▼
                         SSRF Filter   Transform &       Source Data
                         Priority Sort  Hide SK docs      (Perdes,
                                                   Perkades, dll)
```

### Processing Pipeline

1. **Validation** — Memverifikasi `url` desa terhadap database `villages`
2. **Proxy Forward** — Meneruskan request ke OpenSID desa dengan parameter yang sama
3. **Filtering** — Menyembunyikan dokumen dengan "SK" di judul atau kategori
4. **Prioritization** — Mengurutkan dokumen Perkades di urutan atas
5. **Response** — Mengembalikan respons dengan status HTTP yang sesuai

### Database Schema

**Table: `villages`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Primary key |
| `kecamatan` | VARCHAR | Nama kecamatan |
| `name` | VARCHAR | Nama desa |
| `url` | VARCHAR | URL OpenSID desa (`*.desa.id`) |
| `is_active` | BOOLEAN | Status aktif desa |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diperbarui |

### Route Definition

```php
// routes/web.php

// Halaman utama Produk Hukum Desa
Route::get('/produk-hukum-desa', [ProdukHukumDesaController::class, 'index']);

// API endpoint untuk fetch data
Route::get('/api/produk-hukum-desa', [ProdukHukumDesaController::class, 'proxy']);
```

### Controller Methods

**Class:** `App\Http\Controllers\ProdukHukumDesaController`

| Method | Route | Description |
|--------|-------|-------------|
| `index()` | `GET /produk-hukum-desa` | Menampilkan halaman daftar dengan data desa |
| `proxy(Request $request)` | `GET /api/produk-hukum-desa` | Proxy request ke API OpenSID desa |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-08-08 | Initial release — API Produk Hukum Desa documentation |

---

## Support

Untuk pertanyaan atau dukungan terkait API ini, silakan hubungi:

- **Email:** jdih@banjarnegara.go.id
- **Documentation:** [.docs/api-spec.md](../api-spec.md)
- **Repository:** https://github.com/bangrey/jdih-main

---

*© 2026 Kabupaten Banjarnegara — Sistem JDIH*
