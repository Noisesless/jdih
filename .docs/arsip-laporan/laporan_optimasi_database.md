# LAPORAN OPTIMASI DATABASE
## Portal JDIH Kabupaten Banjarnegara
### Migrasi & Penguatan Sistem Basis Data 2026

---

> **Kepada Yth.:** Kepala Bagian Hukum Setda Kab. Banjarnegara
> **Dari:** Tim Exadata Divisi App, Clasnet Group
> **Tanggal:** 5 Mei 2026 | **No. Dok:** EXD/JDIH/DB/2026/003

---

## I. LATAR BELAKANG

Sistem database lama menggunakan engine **MySQL MyISAM** yang memiliki keterbatasan serius:

- Tidak mendukung transaksi ACID (*Atomicity, Consistency, Isolation, Durability*)
- Rentan korupsi data saat terjadi crash server
- Tidak mendukung *foreign key* constraints
- *Table-level locking* yang menyebabkan bottleneck pada akses bersamaan
- Tidak ada mekanisme *rollback* saat terjadi kegagalan operasi

---

## II. PERBANDINGAN ENGINE DATABASE

### 2.1 MyISAM vs InnoDB

| Fitur | MyISAM (Lama) | InnoDB (Baru) |
|-------|:---:|:---:|
| Transaksi ACID | | |
| Foreign Key | | |
| Row-level Locking | (table-lock) | |
| Crash Recovery | Risiko korupsi | Otomatis |
| Full-text Search | | |
| Performa Read | Cepat | Setara |
| Performa Write | Lambat (lock) | Lebih baik |
| Integritas Data | Tidak terjamin | Terjamin |

### 2.2 Dampak Perubahan Engine

```mermaid
flowchart TD
    MyISAM["\u274c MyISAM\nTidak ada transaksi\nTable-level lock\nRentan korupsi"] -->|Migrasi| InnoDB["\u2705 InnoDB\nACID compliant\nRow-level lock\nCrash recovery"]
    InnoDB --> A["\ud83d\udd12 Integritas data terjamin"]
    InnoDB --> B["\u26a1 Performa concurrent user"]
    InnoDB --> C["\ud83d\udd04 Rollback otomatis"]
    InnoDB --> D["\ud83d\udd17 Foreign key constraint"]
```

---

## III. STRUKTUR DATABASE BARU

### 3.1 Diagram Relasi Tabel Utama

```mermaid
flowchart TD
    CAT["\ud83d\udcc2 categories\nid, name, slug, code"] -->|1 - Banyak| LD
    LD["\ud83d\udcc4 legal_documents\nid, title, year, category_id\nfile_path, status"] -->|Banyak - Banyak| REL
    REL["\ud83d\udd17 legal_document_relations\nmain_id, related_id\nrelation_type"]
    LD -->|1 - Banyak| COM["\ud83d\udcac comments\nid, document_id\ncontent, user"]
    USR["\ud83d\udc64 users\nid, name, email"] -->|1 - Banyak| ACT
    ACT["\ud83d\udccb activity_logs\nid, user_id, action\nmodel_type, model_id\nold_values, new_values"]
    DEC["\u2696\ufe0f legal_decisions\nid, document_number\nyear, court"] 
    NEWS["\ud83d\udcf0 news\nid, title, slug\nimage, status"]
```

### 3.2 Tabel Sistem Pendukung

| Tabel | Fungsi | Records |
|-------|--------|---------|
| `categories` | Jenis produk hukum | 30 |
| `legal_documents` | Produk hukum utama | 1.515 |
| `legal_decisions` | Putusan pengadilan | 5 |
| `legal_document_relations` | Relasi antar dokumen | |
| `news` | Berita & artikel | 48 |
| `users` | Admin pengelola | 1 |
| `activity_logs` | Audit trail admin | |
| `comments` | Komentar dokumen | |
| `surveys` | Survei kepuasan | |
| `public_dialogues` | Dialog publik | |
| `gallery_items` | Galeri foto | |
| `banners` | Banner beranda | |
| `infographics` | Infografis | |
| `video_contents` | Konten video | |

---

## IV. PROSES MIGRASI DATA

### 4.1 Alur Lengkap Migrasi

```mermaid
flowchart TD
    START["\ud83d\udd34 Database Lama\nMyISAM"] --> AUDIT
    AUDIT["\ud83d\udd0d Audit Konten\nScan XSS, Judol, Malware"] --> XSS
    XSS["\ud83e\uddf9 Sanitasi XSS\n1.247 entri dibersihkan\nDari tabel abstrak & berita"] --> CONV
    CONV["\ud83d\udd04 Konversi Engine\nALTER TABLE ... ENGINE=InnoDB"] --> SCHEMA
    SCHEMA["\ud83d\udccb Pembaruan Schema\nTambah FK, Index, Constraint"] --> FILE
    FILE["\ud83d\udcc2 Rekonsiliasi File\nAudit 1.515 path dokumen"] --> FIX
    FIX["\ud83d\udd27 Perbaikan Path\n225 file diperbaiki lokal\n75 file diperbaiki di server"] --> VALID
    VALID["\u2705 Validasi Akhir\nIntegritas data confirmed"] --> DONE
    DONE["\ud83d\ude80 Database Baru\nInnoDB + Backup Otomatis"]
```

### 4.2 Statistik Audit Konten

| Pemeriksaan | Diperiksa | Temuan | Tindakan |
|-------------|:---------:|:------:|----------|
| XSS Injection | 1.515 dokumen | 1.247 entri | Sanitasi total |
| Konten judol/malware | 3.412 artikel | 0 | Bersih |
| File path broken | 1.515 record | 300 path | 225 lokal + 75 server diperbaiki |
| Metadata tidak konsisten | 1.515 record | 47 | Dikoreksi |
| Dokumen placeholder (17KB) | 1.515 record | 86 | Ditandai untuk re-upload |

---

## V. OPTIMASI PERFORMA DATABASE

### 5.1 Indexing Strategy

```mermaid
flowchart TD
    QUERY["\ud83d\udd0d Query Masuk"] --> IDX{Index tersedia?}
    IDX -->|Ya| FAST["\u26a1 Full Index Scan\nMilidetik"]
    IDX -->|Tidak| SLOW["\ud83d\udc0c Full Table Scan\nLambat - O(n)"]
    FAST --> RESULT["\u2705 Hasil Query"]
    SLOW --> RESULT
```

**Index yang diimplementasi:**

| Tabel | Kolom | Tipe Index | Tujuan |
|-------|-------|------------|--------|
| `legal_documents` | `year` | INDEX | Filter tahun |
| `legal_documents` | `category_id` | FOREIGN KEY | Relasi kategori |
| `legal_documents` | `status` | INDEX | Filter status |
| `legal_documents` | `title` | FULLTEXT | Pencarian teks |
| `activity_logs` | `user_id, created_at` | COMPOSITE | Filter log per user |
| `activity_logs` | `model_type, model_id` | COMPOSITE | Lookup per record |
| `activity_logs` | `action` | INDEX | Filter jenis aksi |

### 5.2 Query Optimization

Contoh optimasi query pencarian dokumen:

```sql
-- SEBELUM (tanpa index, lambat)
SELECT * FROM legal_documents 
WHERE title LIKE '%perda%' 
AND year = 2023;

-- SESUDAH (dengan index + pagination)
SELECT id, title, document_number, year, status 
FROM legal_documents 
WHERE MATCH(title) AGAINST('perda' IN BOOLEAN MODE)
AND year = 2023
AND status = 'Berlaku'
ORDER BY year DESC, id DESC
LIMIT 20 OFFSET 0;
```

---

## VI. SISTEM BACKUP DATABASE

### 6.1 Arsitektur Backup

```mermaid
flowchart TD
    DB["\ud83d\uddc4\ufe0f MySQL Database\nInnoDB"] -->|Setiap hari 02:00 WIB| DUMP
    DUMP["mysqldump\n--single-transaction\n--routines --triggers"] --> SQL
    SQL["\ud83d\udcc4 File SQL mentah"] -->|gzip -9| GZ
    GZ["\ud83d\udce6 File .gz terkompresi\nHemat ~70% ukuran"] --> STORE
    STORE["\ud83d\udcbe storage/app/backups/"] --> PRUNE
    PRUNE["\ud83d\uddd1\ufe0f Auto-prune\n> 30 hari dihapus"]
    ADMIN["\ud83d\udc64 Admin"] -->|Buat Manual| DUMP
    ADMIN -->|Unduh / Hapus| STORE
```

### 6.2 SOP Backup

| Langkah | Detail |
|---------|--------|
| **Frekuensi** | Harian 02:00 WIB (otomatis via cron) |
| **Format** | `.sql.gz` (terkompresi gzip level 9) |
| **Retensi** | 30 hari (lebih lama hapus otomatis) |
| **Pemicu manual** | Admin menu *Sistem Backup Database* |
| **Verifikasi** | Ukuran file > 100 KB (validasi konten) |
| **Log** | Tercatat di `activity_logs` setiap backup |

### 6.3 Cara Restore Backup

```bash
# 1. Unduh file backup dari admin panel
# 2. Ekstrak di server
gunzip backup_jdih_20260505_020000_harian.sql.gz

# 3. Restore ke database
mysql -u [username] -p [database_name] < backup_jdih_20260505_020000_harian.sql

# 4. Verifikasi
mysql -u [username] -p -e"SELECT COUNT(*) FROM legal_documents;" [database_name]
```

---

## VII. INTEGRITAS DATA PASCA-MIGRASI

### 7.1 Status Dokumen Hukum

```mermaid
pie title Status File PDF (1.515 Dokumen)"File PDF Tersedia (1.429)" : 1429"Menunggu Digitalisasi (86)" : 86
```

### 7.2 Audit Trail dengan Activity Log

Setiap perubahan data kini dicatat otomatis:

```mermaid
flowchart TD
    EVENT["\ud83d\udd14 Event Terjadi\ncreated / updated / deleted"] --> TRAIT
    TRAIT["\ud83d\udd27 LogsActivity Trait\nBootLogsActivity"] --> DIFF
    DIFF["\ud83d\udcca Hitung Diff\nold_values vs new_values"] --> LOG
    LOG["\ud83d\udccb Simpan ke activity_logs\nuser, action, model\nIP, user_agent, timestamp"] --> UI
    UI["\ud83d\udda5\ufe0f Tampil di Admin\nFilter by: aksi, modul, tanggal"]
```

---

## VIII. REKOMENDASI LANJUTAN

| Prioritas | Item | Target |
|-----------|------|--------|
| Segera | Aktifkan cron job di server | 1 hari |
| Segera | Upload ulang 86 dokumen digitalisasi | 30 hari |
| Sedang | Sinkronisasi backup ke Google Drive/S3 | 1 bulan |
| Sedang | Implementasi database connection pooling | 3 bulan |
| Rendah | Analisis slow query log berkala | Berkelanjutan |
| Rendah | Pertimbangkan read replica untuk beban tinggi | 6 bulan |

---

## IX. PENUTUP

Migrasi dan optimasi database Portal JDIH Banjarnegara dari MyISAM ke InnoDB telah berhasil meningkatkan integritas, performa, dan keamanan data secara signifikan. Sistem kini dilengkapi audit trail dan backup otomatis sesuai praktik terbaik pengelolaan data pemerintahan.

**Banjarnegara, 5 Mei 2026**

| Disusun Oleh | Diverifikasi Oleh |
|:---:|:---:|
| **Tim Exadata** | **Kepala Bagian Hukum** |
| Divisi App Clasnet Group | Setda Kab. Banjarnegara |
| *(Tanda Tangan)* | *(Tanda Tangan & Cap Dinas)* |

---
* 2026 Clasnet Group / Exadata Divisi App Dokumen Resmi*
