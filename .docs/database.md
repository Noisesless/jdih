# Database Specification — JDIH Kabupaten Banjarnegara

Dokumen arsitektur basis data, skema tabel, indeks, dan relasi data sistem JDIH Kabupaten Banjarnegara.

## 1. Konfigurasi Mesin & Karakter
- **Database Name**: `jdihdb1`
- **Engine**: InnoDB (100% migrated dari MyISAM)
- **Collation**: `utf8mb4_unicode_ci`
- **Timezone**: Sinkron dengan `Asia/Jakarta` (WIB)

## 2. Entitas Utama Basis Data

### A. `users` (Akun Administrator)
| Kolom | Tipe | Index / Constraint | Keterangan |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, Auto Increment | ID Pengguna |
| `name` | VARCHAR(255) | - | Nama Lengkap |
| `email` | VARCHAR(255) | UNIQUE | Email Login |
| `password` | VARCHAR(255) | - | Bcrypt Hash |
| `remember_token`| VARCHAR(100) | Nullable | Sesi login |
| `created_at` / `updated_at` | TIMESTAMP | - | Timestamp WIB |

### B. `activity_logs` (Audit Trail)
| Kolom | Tipe | Index / Constraint | Keterangan |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, Auto Increment | ID Log |
| `user_id` | BIGINT UNSIGNED | FK Nullable ke `users.id` | User yang bertindak |
| `user_name` | VARCHAR(255) | Nullable | Nama user saat log dibuat |
| `user_email` | VARCHAR(255) | Nullable | Email user saat log dibuat |
| `action` | VARCHAR(50) | Index | login, logout, create, update, delete |
| `subject_type` | VARCHAR(255) | Nullable | Model class terkait (misal: LegalDocument) |
| `subject_id` | BIGINT UNSIGNED | Nullable | ID entitas terkait |
| `subject_title`| VARCHAR(255) | Nullable | Judul/label entitas terkait |
| `description` | TEXT | Nullable | Deskripsi peristiwa |
| `ip_address` | VARCHAR(45) | Nullable | IP Publik (Cloudflare forwarded) |
| `user_agent` | TEXT | Nullable | Browser & OS client |
| `created_at` / `updated_at` | TIMESTAMP | Index pada `created_at` | Waktu kejadian (WIB) |

### C. `legal_documents` (Katalog Dokumen Hukum)
| Kolom | Tipe | Index / Constraint | Keterangan |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, Auto Increment | ID Dokumen |
| `category_id` | BIGINT UNSIGNED | FK ke `categories.id` | Jenis Dokumen (Perda, Perbup, dll) |
| `title` | TEXT | Fulltext Index | Judul Produk Hukum |
| `document_number` | VARCHAR(100) | Index | Nomor Peraturan |
| `year` | INT | Index | Tahun Penetapan |
| `effective_date` | DATE | Nullable | Tanggal Berlaku |
| `status` | VARCHAR(50) | Index | Berlaku, Tidak Berlaku, Diubah, Dicabut |
| `file_path` | VARCHAR(255) | Nullable | Path file PDF di storage |
| `abstract_file_path`| VARCHAR(255) | Nullable | Path file lembar abstrak PDF |

### D. Tabel Pendukung Lainnya
- `categories`: Kategori/tipe peraturan daerah.
- `legal_document_relations`: Relasi antar-peraturan (mencabut, diubah oleh, dsb).
- `news`: Berita dan artikel hukum.
- `banners`: Slider hero dinamis beranda.
- `surveys` & `community_satisfactions`: Data survei Indeks Kepuasan Masyarakat (IKM).
- `aspirations` & `public_dialogues`: Masukan dan partisipasi masyarakat.
- `jdih_sync_logs` & `jdih_api_settings`: Log dan pengaturan integrasi JDIHN nasional.
