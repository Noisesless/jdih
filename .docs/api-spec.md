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
- **POST** `/api/chat-ai`
  - **Auth**: Public (Rate-limited: 10 req/min)
  - **Payload**:
    ```json
    {
      "message": "Apa peraturan bupati yang mengatur tentang retribusi pasar?"
    }
    ```
  - **Response**:
    ```json
    {
      "reply": "Berdasarkan Peraturan Bupati Banjarnegara No. XX Tahun XXXX...",
      "references": [...]
    }
    ```

## 2. External Integration Endpoints (JDIHN & Desa)

### A. Sinkronisasi JDIHN Nasional
- **GET** `/api/jdihn/sync`
  - **Auth**: Bearer Token (JDIHN API Key)
  - **Response**: JSON metadata berstandar BPHN / JDIHN pusat untuk indexing nasional.

### B. Integrasi Produk Hukum Desa
- **GET** `/api/desa/documents`
  - **Auth**: API Key per Desa
  - **Response**: Daftar peraturan desa terintegrasi dari Sistem Informasi Desa (SID).
