# Catatan Pengembangan: Optimasi & Perbaikan Sistem Manajemen Dokumen Hukum

**Tanggal**: 26 April 2026

## 1. Perbaikan Bug "Sidebar Kosong" & Auto-Discovery Resource
- **Penyebab**: Kesalahan penulisan namespace (`App\Filament/Resources`) pada `AdminPanelProvider.php`.
- **Solusi**: Diperbaiki menjadi backslash yang benar (`App\Filament\Resources`).
- **Penyebab Tambahan**: Filament v4 mensyaratkan *property* `$navigationGroup` menggunakan tipe union `\UnitEnum|string|null`, namun `LegalDocumentResource` masih menggunakan `?string`.
- **Solusi**: Tipe data di-*update* sehingga sesuai dengan standar Filament v4.

## 2. Perbaikan Syntax Actions & Components Filament v4
- **Penyebab**: Banyak error `Class not found` (seperti `DeleteAction` dan `Tabs`) karena perubahan arsitektur di Filament v4.
- **Solusi**:
  - Memperbarui *namespace* Table Actions dari `Filament\Tables\Actions\*` menjadi `Filament\Actions\*`.
  - Mengganti metode `->actions()` menjadi `->recordActions()` dan `->bulkActions()` menjadi `->toolbarActions()`.
  - Memperbarui *namespace* Schema Components (`Tabs`, `Tab`, `Section`, `Grid`) dari `Filament\Forms\Components\*` menjadi `Filament\Schemas\Components\*`.

## 3. Optimasi Database (Kolom Nullable)
- **Masalah**: Gagal menyimpan dokumen karena form hanya mewajibkan sedikit isian (Judul, No, Tahun), namun database mensyaratkan `NOT NULL` pada metadata spesifik (seperti `teu`, `place_of_enactment`, `language`, `location`, `document_type`, `page_count`).
- **Solusi**: Membuat migrasi `make_optional_columns_nullable_in_legal_documents` untuk mengubah kolom-kolom opsional tersebut menjadi *nullable* sehingga *upload* sukses walaupun *metadata* sekunder tidak diisi.

## 4. Perbaikan Tampilan Dokumen di Homepage & Daftar Dokumen
- **Masalah**: Dokumen yang baru diunggah tanpa "Tanggal Penetapan" (`published_at`) tidak muncul di urutan atas karena mekanisme *sorting* default yang mengurutkan `NULL` ke posisi paling bawah.
- **Solusi**: Menggunakan `COALESCE(published_at, created_at) DESC` pada `web.php` sehingga sistem akan menggunakan "Tanggal Upload" (`created_at`) jika "Tanggal Penetapan" kosong.
- **Masalah Tambahan**: Statistik total dokumen di *homepage* tidak *realtime* karena terperangkap di dalam Cache (1 Jam).
- **Solusi**: Menghapus `Cache::remember` untuk *counts* kategori sehingga total angka dokumen selalu akurat *realtime*.

## 5. Perbaikan Tanggal "Diunggah pada" di Frontend
- **Masalah**: Halaman `DetailDokumen.tsx` gagal menampilkan tanggal unggah karena tidak ada data `created_at` yang di-*passing* dari server.
- **Solusi**: Menambahkan *field* `created_at` dan `updated_at` pada *payload* yang dikirim oleh `routes/web.php` untuk Inertia.

## 6. Analisis Arsitektur Jangka Panjang (Skala Besar)
Sistem ini siap digunakan, namun jika jumlah PDF mencapai ribuan (skala besar), sangat disarankan untuk melakukan beberapa penyesuaian:
1. **Directory Partitioning**: Jangan menyimpan semua file di satu folder *flat* (`legal-documents/`), tapi pisahkan per tahun/bulan (`legal-documents/2026/04/`) agar performa OS (I/O) tidak *bottleneck*.
2. **Migrasi ke S3 Storage**: Ganti driver storage `public` lokal ke *S3 Compatible* (seperti MinIO/AWS) agar beban hardisk server aplikasi lebih ringan dan mudah di-*scale*.
3. **Background Queueing**: Kompresi PDF di latar belakang (melalui Queue) untuk menghemat ruang *storage* dan mempercepat *download* pengguna.
