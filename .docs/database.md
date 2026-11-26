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

### D. `villages` (Daftar Desa Terintegrasi & Whitelist OpenSID)
| Kolom | Tipe | Index / Constraint | Keterangan |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, Auto Increment | ID Entitas Desa |
| `name` | VARCHAR(255) | - | Nama Desa (misal: Sijenggung, Beji, Gumingsir) |
| `kecamatan` | VARCHAR(255) | - | Nama Kecamatan di Kabupaten Banjarnegara |
| `url` | VARCHAR(255) | - | URL domain OpenSID desa (`https://*.desa.id/`) |
| `is_active` | TINYINT(1) | Default: 1 | Status aktif integrasi (1 = Aktif, 0 = Nonaktif) |
| `created_at` / `updated_at` | TIMESTAMP | Nullable | Waktu registrasi dan pembaruan |

### E. `visitors` (Pencatatan Trafik & Statistik Pengunjung)
| Kolom | Tipe | Index / Constraint | Keterangan |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, Auto Increment | ID Kunjungan |
| `ip_address` | VARCHAR(45) | Index | Alamat IP Pengunjung |
| `visited_date` | DATE | Index | Tanggal Kunjungan (Y-m-d) |
| `hits` | INT UNSIGNED | Default: 1 | Jumlah hit / halaman yang dilihat hari itu |
| `user_agent` | VARCHAR(500) | Nullable | User agent browser / perangkat |
| `created_at` / `updated_at` | TIMESTAMP | Nullable | Waktu pertama dan terakhir kunjungan hari itu |
| *Constraint* | UNIQUE (`ip_address`, `visited_date`) | - | 1 baris per IP per hari (agregasi hits) |

### F. `comments` (Tanggapan & Masukan Publik pada Dokumen)
| Kolom | Tipe | Index / Constraint | Keterangan |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, Auto Increment | ID Komentar |
| `legal_document_id` | BIGINT UNSIGNED | FK ke `legal_documents.id` (cascadeOnDelete) | Dokumen yang dikomentari |
| `name` | VARCHAR(255) | - | Nama lengkap pengirim |
| `email` | VARCHAR(255) | - | Alamat email (hidden dari publik/API) |
| `phone` | VARCHAR(30) | Nullable | No. Telp / WhatsApp (hidden dari publik/API) |
| `comment` | TEXT | - | Isi masukan (anti-XSS sanitized) |
| `is_approved` | TINYINT(1) | Default: 0 | Status moderasi admin (1 = tampil, 0 = pending) |
| `created_at` / `updated_at` | TIMESTAMP | - | Waktu kirim dan moderasi |

### G. `legal_decisions` (Putusan Pengadilan — Standar Permenkumham 8/2019)
| Kolom | Tipe | Index / Constraint | Keterangan |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, Auto Increment | ID Putusan |
| `document_type` | VARCHAR(255) | Default: `Putusan` | Tipe dokumen |
| `document_number` | VARCHAR(255) | Required | Nomor Putusan |
| `year` | INT | Required | Tahun Putusan |
| `title` | VARCHAR(255) | Required | Judul Putusan |
| `teu` | VARCHAR(255) | Nullable | T.E.U. Badan / Pengarang |
| `court_type` | VARCHAR(255) | Required | Jenis Peradilan |
| `court_abbreviation` | VARCHAR(50) | Nullable | Singkatan Jenis Peradilan (`PTUN`, `PN`, `MA`, `MK`) |
| `court_place` | VARCHAR(255) | Nullable | Tempat Peradilan |
| `decision_date` | DATE | Nullable | Tanggal/ Bulan/ Tahun Dibacakan |
| `source` | VARCHAR(255) | Nullable | Sumber dokumen |
| `subject` | VARCHAR(255) | Nullable | Subjek Putusan |
| `status` | VARCHAR(255) | Nullable | Status Putusan (`Inkracht`, dsb) |
| `language` | VARCHAR(100) | Default: `Bahasa Indonesia` | Bahasa |
| `legal_field` | VARCHAR(255) | Nullable | Bidang Hukum |
| `location` | VARCHAR(255) | Nullable | Lokasi penyimpanan |
| `content` | TEXT | Nullable | Abstrak / Ringkasan Putusan |
| `file_path` | VARCHAR(255) | Nullable | Path berkas PDF (`disk: public`) |
| `is_published` | TINYINT(1) | Default: 1 | Status tampil publik |

### H. Tabel Pendukung Lainnya
- `categories`: Kategori/tipe peraturan daerah.
- `legal_document_relations`: Relasi antar-peraturan (mencabut, diubah oleh, dsb).
- `news`: Berita dan artikel hukum.
- `banners`: Slider hero dinamis beranda.
- `surveys` & `community_satisfactions`: Data survei Indeks Kepuasan Masyarakat (IKM).
- `aspirations` & `public_dialogues`: Masukan dan partisipasi masyarakat.
- `jdih_sync_logs` & `jdih_api_settings`: Log dan pengaturan integrasi JDIHN nasional.
