# API Specification — JDIH Kabupaten Banjarnegara

Dokumen spesifikasi endpoint publik, integrasi eksternal, dan antarmuka data JDIH Kabupaten Banjarnegara.

## 1. Public & Portal API Endpoints

### A. Pencarian & Katalog Produk Hukum
- **GET** `/api/v1/documents`
  - **Auth**: Public
  - **Query Params**: `q` (string), `year` (int), `category_id` (int), `status` (string), `page` (int)
  - **Response**: Paginated JSON list dokumen hukum lengkap dengan nomor, judul, tanggal penetapan, dan link unduhan PDF.

- **GET** `/api/v1/documents/{id}`
  - **Auth**: Public
  - **Response**: Detail metadata dokumen, histori perubahan/pencabutan, abstrak, dan relasi peraturan.

### B. Dialog Publik & Aspirasi
- **POST** `/api/aspirations`
  - **Auth**: Public (Rate-limited: 5 req/min)
  - **Payload**:
    ```json
    {
      "name": "Nama Pengirim",
      "email": "pengirim@example.com",
      "phone": "08123456789",
      "subject": "Judul Aspirasi",
      "content": "Isi masukan atau saran terkait produk hukum"
    }
    ```
  - **Response**: `201 Created`

### C. AI Legal Assistant (RAG Chat)
- **POST** `/ai/ask`
  - **Auth**: Web Session (CSRF Protected)
  - **Payload**:
    ```json
    {
      "document_id": 339,
      "question": "Apa isi pasal 3 dokumen ini?",
      "chat_history": [
        { "role": "user", "text": "..." },
        { "role": "ai", "text": "..." }
      ],
      "use_rag": true
    }
    ```
  - **Response**:
    ```json
    {
      "answer": "Berdasarkan Peraturan Daerah Kabupaten Banjarnegara Nomor 4 Tahun 2019...",
      "suggested_questions": ["Apa sanksi administratifnya?", "Kapan mulai berlaku?"],
      "rag_used": true,
      "rag_chunks": 3
    }
    ```

### D. Unduh File Dokumen & Abstrak
- **GET** `/dokumen/{id}/unduh`
  - **Auth**: Public
  - **Query Params**: `type` (`abstract` | opsional)
  - **Response**: Binary file stream (Content-Disposition: attachment) langsung dari disk publik.

## 2. External Integration Endpoints (JDIHN & Desa)

### A. Sinkronisasi JDIHN Nasional
- **GET** `/api/jdihn/sync`
  - **Auth**: Bearer Token (JDIHN API Key)
  - **Response**: JSON metadata berstandar BPHN / JDIHN pusat untuk indexing nasional.

### B. Integrasi Produk Hukum Desa (Reverse Proxy OpenSID)
- **GET** `/api/produk-hukum-desa`
  - **Auth**: Public (Rate-limited: `throttle:30,1` per IP)
  - **Query Params**:
    - `url` (string, required): URL domain resmi desa yang terdaftar aktif di tabel `villages` (contoh: `https://sijenggung-banjarnegara.desa.id/`).
    - `endpoint` (string, default: `internal_api/produk-hukum`): Sub-path API OpenSID yang diizinkan (`internal_api/produk-hukum`, `internal_api/informasi-umum`, `internal_api/transparansi-publik`).
    - `page[number]` (int, opsional): Paginasi data dokumen desa.
  - **Security & Privacy Filters**:
    - **Whitelist Guard**: Hanya domain desa terdaftar dengan status `is_active = 1` yang diproses.
    - **SSRF Defense**: Memvalidasi IP hasil resolve via `isPrivateOrInternalIp()` dan menolak akses ke subnet internal/privat (`10.0.0.0/8`, `127.0.0.0/8`, `192.168.0.0/16`, dll).
    - **Path Traversal Guard**: Endpoint dibatasi ketat pada whitelist `internal_api/*`.
    - **Privacy Filter**: Otomatis menyaring dan menyembunyikan Surat Keputusan (SK) internal yang memuat data pribadi perangkat desa.
    - **Regulasi Prioritization**: Peraturan Kepala Desa (Perkades) dan Perdes otomatis diurutkan di posisi teratas.
  - **Response Status**:
    - `200 OK`: JSON payload dokumen regulasi desa (format JSON:API Fractal).
    - `400 Bad Request`: `{"error": "Village URL is required"}`
    - `403 Forbidden`: `{"error": "URL desa tidak terdaftar atau tidak valid."}` atau `{"error": "Akses ke IP privat/internal tidak diizinkan."}`
    - `429 Too Many Requests`: Limit 30 req/min terlampaui.
    - `502 Bad Gateway`: Server desa tujuan unreachable / timeout (>10 detik).
