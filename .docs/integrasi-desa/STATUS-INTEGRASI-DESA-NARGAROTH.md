# Laporan & Pemetaan Integrasi OpenSID Desa — Server Nargaroth & Portal JDIH

**JDIH Kabupaten Banjarnegara**  
**Tanggal Update:** 3 November 2026  
**Status Lingkungan:** Produksi (Server Nargaroth `103.255.133.227`)  
**Database Whitelist:** `jdihdb1.villages` (MariaDB)

---

## 1. Ringkasan Eksekutif & Latar Belakang

Modul **Produk Hukum Desa** pada portal JDIH Banjarnegara (`https://jdih.banjarnegarakab.go.id/produk-hukum-desa`) mengintegrasikan dokumen peraturan desa (Perdes/Perkades) langsung dari website OpenSID masing-masing desa (`*.desa.id`) secara *real-time* melalui reverse-proxy JDIH (`/api/produk-hukum-desa`).

Sebelum perbaikan ini, integrasi mengalami beberapa hambatan:
1. **Cloudflare Bot Fight Mode & Under Attack Mode**: Request server JDIH ke domain desa diblokir dengan *Managed Challenge* (`cf-mitigated: challenge`, HTTP 403).
2. **OpenSID Routing (CodeIgniter 3)**: Endpoint `/internal_api/produk-hukum` mengembalikan HTTP 404 karena framework memerlukan prefix `index.php/`.
3. **Celah Keamanan & Brute Force (`apiasmara.php`)**: File API sinkronisasi data kependudukan desa belum memiliki pembatasan rate limit dan memiliki header CORS liar (`*`).
4. **Data Whitelist Database JDIH**: Tabel `jdihdb1.villages` belum memuat seluruh desa aktif di server Nargaroth dan beberapa URL mengarah ke domain legacy.

---

## 2. Hardening Keamanan & Arsitektur Jaringan (Zero-Exploit)

### A. Hardening API Kependudukan (`apiasmara.php`)
- **Lokasi Berkas:** `/home/banjarmangu-sijenggung/htdocs/sijenggung-banjarnegara.desa.id/public/apiasmara.php`
- **Backup Berkas:** `apiasmara.php.bak_20261103`
- **Peningkatan:**
  1. **Sliding-Window Rate Limiting:** Maksimal 10 request per menit per IP address via lock directory `/tmp/rate_limit_asmara/`. Jika melebihi batas, bot otomatis diblokir dengan `HTTP 429 Too Many Requests`.
  2. **Strict Whitelist CORS:** Mengganti `Access-Control-Allow-Origin: *` menjadi hanya mengizinkan domain resmi:
     - `https://posyandu-sijenggung.smartdesa.net`
     - `https://jdih.banjarnegarakab.go.id`
  3. **Timing-Attack Defense:** Pengecekan autentikasi menggunakan fungsi kebal timing-attack PHP `hash_equals()`.

### B. Global Nginx Rewrite untuk Seluruh 98 Vhost OpenSID
- **Lokasi Berkas:** `/etc/nginx/global_settings`
- **Konfigurasi yang Ditambahkan:**
  ```nginx
  # 5. OpenSID internal_api rewrite for JDIH Portal Integration
  location /internal_api/ {
      rewrite ^/internal_api/(.*)$ /index.php/internal_api/$1 last;
  }
  ```
- **Dampak:** Seluruh 98 vhost OpenSID di Nargaroth otomatis mewarisi routing `/internal_api/` tanpa perlu konfigurasi manual satu per satu.

### C. Inter-Server Loopback Resolution (`/etc/hosts`)
- **Lokasi Berkas:** `/etc/hosts`
- **Mekanisme:** Seluruh domain `.desa.id` yang di-host lokal pada Nargaroth dipetakan langsung ke IP lokal `103.255.133.227`.
- **Manfaat:**
  - Lalu lintas request portal JDIH ke OpenSID desa tetap berada di jaringan internal server lokal.
  - Bebas 100% dari Cloudflare Bot Fight Mode maupun Under Attack Mode.
  - Lolos uji SSRF JDIH (`isPrivateOrInternalIp()`) karena `103.255.133.227` adalah IP publik yang sah dan valid.

---

## 3. Status 25 Desa yang Diaudit

### A. 18 Desa di Server Nargaroth (Telah Aktif & Terintegrasi)
Seluruh 18 desa di bawah ini telah disinkronkan ke `jdihdb1.villages` (`is_active = 1`) dan teruji live `200 OK`:

| No | Desa | Kecamatan | Domain | Status Proxy JDIH | Dokumen Terbit |
|:---|:---|:---|:---|:---:|:---:|
| 1 | Sijenggung | Banjarmangu | `sijenggung-banjarnegara.desa.id` | **200 OK** | 7 |
| 2 | Pekandangan | Banjarmangu | `pekandangan-banjarnegara.desa.id` | **200 OK** | 3 |
| 3 | Banjarmangu | Banjarmangu | `banjarmangu-banjarnegara.desa.id` | **200 OK** | 7 |
| 4 | Gripit | Banjarmangu | `gripit-banjarnegara.desa.id` | **200 OK** | 0 (Siap) |
| 5 | Majatengah | Banjarmangu | `majatengah-banjarmangu.desa.id` | **200 OK** | 9 |
| 6 | Majatengah | Kalibening | `majatengah-banjarnegara.desa.id` | **200 OK** | 0 (Siap) |
| 7 | Plorengan | Kalibening | `plorengan-banjarnegara.desa.id` | **200 OK** | 5 |
| 8 | Tribuana | Punggelan | `tribuana-banjarnegara.desa.id` | **200 OK** | 9 |
| 9 | Badakarya | Punggelan | `badakarya-banjarnegara.desa.id` | **200 OK** | 0 (Siap) |
| 10 | Bondolharjo | Punggelan | `bondolharjo-banjarnegara.desa.id` | **200 OK** | 0 (Siap) |
| 11 | Klapa | Punggelan | `klapa-banjarnegara.desa.id` | **200 OK** | 7 |
| 12 | Gumingsir | Pagentan | `gumingsir-banjarnegara.desa.id` | **200 OK** | 29 |
| 13 | Gumingsir | Wanadadi | `gumingsir-wanadadi.desa.id` | **200 OK** | 0 (Siap) |
| 14 | Karangkemiri | Wanadadi | `karangkemiri-banjarnegara.desa.id` | **200 OK** | 0 (Siap) |
| 15 | Medayu | Wanadadi | `medayu-banjarnegara.desa.id` | **200 OK** | 18 |
| 16 | Jatilawang | Wanayasa | `jatilawang-banjarnegara.desa.id` | **200 OK** | 0 (Siap) |
| 17 | Pagergunung | Wanayasa | `pagergunung-banjarnegara.desa.id` | **200 OK** | 0 (Siap) |
| 18 | Sampang | Karangkobar | `sampang-banjarnegara.desa.id` | **200 OK** | 25 |
| 19 | Madukara | Madukara | `madukara-banjarnegara.desa.id` | **200 OK** | 0 (Siap) |
| 20 | Clapar | Madukara | `clapar-banjarnegara.desa.id` | **200 OK** | 1 |

### B. 7 Desa / Wilayah Lainnya (Non-Nargaroth)
1. **Kasilib**: Server Luar (`101.50.1.112`) &rarr; HTTP 404 (Belum ada Nginx rewrite di server asal).
2. **Sembawa**: Server Luar (`103.247.10.151`) &rarr; HTTP 404 (Belum ada Nginx rewrite di server asal).
3. **Ambal**: Server Luar (`103.225.242.176`) &rarr; HTTP 403 (Cloudflare Bot Challenge di server asal).
4. **Cendana**: Server Luar (`103.225.242.176`) &rarr; HTTP 403 (Cloudflare Bot Challenge di server asal).
5. **Karangkobar**: Server Luar (`103.225.242.176`) &rarr; HTTP 403 (Cloudflare Bot Challenge di server asal).
6. **Pasuruhan**: Domain DNS tidak aktif.
7. **Susukan**: Merupakan nama Kecamatan.

## 4. Pemetaan Lengkap 78 Desa OpenSID Lainnya di Server Nargaroth

Di luar 20 akun desa yang telah disinkronkan dan diaktifkan sebelumnya, terdapat **78 website OpenSID aktif lainnya** yang di-host pada server Nargaroth.

### Ringkasan Kondisi 78 Desa Lainnya:
- **21 Desa Siap Langsung Aktif & Sudah Memiliki Dokumen Perdes**: Endpoint `200 OK`, memiliki dokumen peraturan di OpenSID, tinggal dimasukkan ke `jdihdb1.villages`.
- **13 Desa Sudah Ada di Database JDIH**: Sudah terdaftar di tabel `jdihdb1.villages` (sebagian besar sudah aktif).
- **44 Desa Terhubung & Siap Pakai (0 Dokumen)**: Endpoint `200 OK`, merespons `{"data":[]}`, menunggu unggahan dokumen dari operator desa masing-masing.

---

### A. Prioritas Tinggi: 21 Desa Belum di Database JDIH yang SUDAH Memiliki Dokumen Perdes

| No | Desa | Kecamatan | Domain OpenSID | Status API | Jml Dokumen | Contoh Dokumen Terbit |
|:---|:---|:---|:---|:---:|:---:|:---|
| 1 | **Kaliurip** | Madukara | `kaliurip-banjarnegara.desa.id` | 200 OK | **2** | Perdes No 1 Th 2026 - LPJ Realisasi APBDes Tahun 2025 |
| 2 | **Karanganyar** | Madukara | `karanganyar-madukara.desa.id` | 200 OK | **6** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 3 | **Pakelen** | Madukara | `pakelen-banjarnegara.desa.id` | 200 OK | **4** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 4 | **Pekauman** | Madukara | `pekauman-banjarnegara.desa.id` | 200 OK | **4** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 5 | **Aribaya** | Pagentan | `aribaya-banjarnegara.desa.id` | 200 OK | **2** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 6 | **Kalitlaga** | Pagentan | `kalitlaga-banjarnegara.desa.id` | 200 OK | **4** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 7 | **Karangnangka** | Pagentan | `karangnangka-banjarnegara.desa.id` | 200 OK | **17** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 8 | **Kayuares** | Pagentan | `kayuares-banjarnegara.desa.id` | 200 OK | **4** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 9 | **Larangan** | Pagentan | `larangan-banjarnegara.desa.id` | 200 OK | **4** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 10 | **Nagasari** | Pagentan | `nagasari-banjarnegara.desa.id` | 200 OK | **4** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 11 | **Beji** | Pandanarum | `beji-pandanarum.desa.id` | 200 OK | **30** | PERKADES PEDOMAN EVALUASI KONERJA PERANGKAT DESA |
| 12 | **Pasegeran** | Pandanarum | `pasegeran-banjarnegara.desa.id` | 200 OK | **2** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 13 | **Punggelan** | Punggelan | `punggelan-banjarnegara.desa.id` | 200 OK | **1** | Perubahan APBDES 2025 |
| 14 | **Tlaga** | Punggelan | `tlaga-banjarnegara.desa.id` | 200 OK | **1** | PENETAPAN REKENING KAS DESA TAHUN 2026 |
| 15 | **Mertasari** | Purwanegara | `mertasari-banjarnegara.desa.id` | 200 OK | **8** | Perdes APBDes 2025 |
| 16 | **Kaliwinasuh** | Purworeja Klampok | `kaliwinasuh-banjarnegara.desa.id` | 200 OK | **8** | Perkades tentang APBDes Tahun Anggaran 2022  |
| 17 | **Pagak** | Purworeja Klampok | `pagak-banjarnegara.desa.id` | 200 OK | **2** | SK TIM Penyusun RPJMDes Tahun 2017 |
| 18 | **Kemranggon** | Susukan | `kemranggon-banjarnegara.desa.id` | 200 OK | **30** | DARYANTO |
| 19 | **Bantar** | Wanayasa | `bantar-banjarnegara.desa.id` | 200 OK | **4** |  RPJM Desa Tahun 2020-2027 |
| 20 | **Legoksayem** | Wanayasa | `legoksayem-banjarnegara.desa.id` | 200 OK | **4** | Peraturan Desa tentang APBDesa Tahun Anggaran 2026 |
| 21 | **Pandansari** | Wanayasa | `pandansari-banjarnegara.desa.id` | 200 OK | **2** | Peraturan Desa Pandansari Nomor 1 Tahun 2025 Tentang Laporan Realisasi Pertanggungjawaban APBDesa Tahun 2024 |

---

### B. 13 Desa Lainnya yang Sudah Terdaftar di Database JDIH

| No | Desa | Kecamatan | Domain OpenSID | Status API | Dokumen | Status di DB JDIH |
|:---|:---|:---|:---|:---:|:---:|:---|
| 1 | **Banjarkulon** | Banjarmangu | `banjarkulon-banjarnegara.desa.id` | 200 OK | 30 | ID 58 � Aktif (1) |
| 2 | **Beji** | Banjarmangu | `beji-banjarnegara.desa.id` | 200 OK | 4 | ID 242 � Aktif (1) |
| 3 | **Jenggawur** | Banjarmangu | `jenggawur-banjarnegara.desa.id` | 200 OK | 5 | ID 244 � Aktif (1) |
| 4 | **Kalilunjar** | Banjarmangu | `kalilunjar-banjarnegara.desa.id` | 200 OK | 11 | ID 245 � Aktif (1) |
| 5 | **Kendaga** | Banjarmangu | `kendaga-banjarnegara.desa.id` | 200 OK | 5 | ID 246 � Aktif (1) |
| 6 | **Kesenet** | Banjarmangu | `kesenet-banjarnegara.desa.id` | 200 OK | 2 | ID 247 � Aktif (1) |
| 7 | **Rejasari** | Banjarmangu | `rejasari-banjarnegara.desa.id` | 200 OK | 4 | ID 251 � Aktif (1) |
| 8 | **Sigeblog** | Banjarmangu | `sigeblog-banjarnegara.desa.id` | 200 OK | 3 | ID 252 � Aktif (1) |
| 9 | **Sijeruk** | Banjarmangu | `sijeruk-banjarnegara.desa.id` | 200 OK | 30 | ID 253 � Aktif (1) |
| 10 | **Sipedang** | Banjarmangu | `sipedang-banjarnegara.desa.id` | 200 OK | 0 | ID 254 � Aktif (1) |
| 11 | **Blambangan** | Bawang | `blambangan-banjarnegara.desa.id` | 200 OK | 0 | ID 3 � Nonaktif (0) |
| 12 | **Sokaraja** | Pagentan | `sokaraja-banjarnegara.desa.id` | 200 OK | 30 | ID 266 � Aktif (1) |
| 13 | **Karangtengah** | Wanayasa | `karangtengah-banjarnegara.desa.id` | 200 OK | 0 | ID 290 � Aktif (1) |

---

### C. 44 Desa Terhubung yang Belum Memiliki Dokumen di OpenSID (Dokumen = 0)

| No | Desa | Kecamatan | Domain OpenSID | Status API | Status di DB JDIH |
|:---|:---|:---|:---|:---:|:---|
| 1 | **Gemuruh** | Bawang | `gemuruh-banjarnegara.desa.id` | Err (404) | Belum Terdaftar |
| 2 | **Kalibombong** | Kalibening | `kalibombong-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 3 | **Limbangan** | Madukara | `limbangan-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 4 | **Penawangan** | Madukara | `penawangan-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 5 | **Panggisari** | Mandiraja | `panggisari-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 6 | **Babadan** | Pagentan | `babadan-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 7 | **Lawen** | Pandanarum | `lawen-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 8 | **Pandanarum** | Pandanarum | `pandanarum-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 9 | **Sinduaji** | Pandanarum | `sinduaji-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 10 | **Sirongge** | Pandanarum | `sirongge-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 11 | **Beji** | Pejawaran | `beji-pejawaran.desa.id` | 200 OK | Belum Terdaftar |
| 12 | **Danakerta** | Punggelan | `danakerta-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 13 | **Jembangan** | Punggelan | `jembangan-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 14 | **Karangsari** | Punggelan | `karangsari-punggelan.desa.id` | 200 OK | Belum Terdaftar |
| 15 | **Kecepit** | Punggelan | `kecepit-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 16 | **Mlaya** | Punggelan | `mlaya-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 17 | **Petuguran** | Punggelan | `petuguran-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 18 | **Purwasana** | Punggelan | `purwasana-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 19 | **Sambong** | Punggelan | `sambong-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 20 | **Sawangan** | Punggelan | `sawangan-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 21 | **Sidarata** | Punggelan | `sidarata-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 22 | **Tanjungtirta** | Punggelan | `tanjungtirta-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 23 | **Merden** | Purwanegara | `merden-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 24 | **Kecitran** | Purworeja Klampok | `kecitran-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 25 | **Purwareja** | Purworeja Klampok | `purwareja-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 26 | **Gelang** | Rakit | `gelang-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 27 | **Brengkok** | Susukan | `brengkok-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 28 | **Karangjati** | Susukan | `karangjati-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 29 | **Karangsalam** | Susukan | `karangsalam-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 30 | **Kedawung** | Susukan | `kedawung-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 31 | **Panerusan Kulon** | Susukan | `panerusankulon-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 32 | **Kandangwangi** | Wanadadi | `kandangwangi-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 33 | **Karangjambe** | Wanadadi | `karangjambe-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 34 | **Lemahjaya** | Wanadadi | `lemahjaya-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 35 | **Balun** | Wanayasa | `balun-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 36 | **Dawuhan** | Wanayasa | `dawuhan-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 37 | **Kasimpar** | Wanayasa | `kasimpar-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 38 | **Kubang** | Wanayasa | `kubang-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 39 | **Penanggungan** | Wanayasa | `penanggungan-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 40 | **Pesantren** | Wanayasa | `pesantren-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 41 | **Suwidak** | Wanayasa | `suwidak-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 42 | **Tempuran** | Wanayasa | `tempuran-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 43 | **Wanaraja** | Wanayasa | `wanaraja-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |
| 44 | **Wanayasa** | Wanayasa | `wanayasa-banjarnegara.desa.id` | 200 OK | Belum Terdaftar |

---

## 5. Prosedur Manajemen Desa (Aktivasi & Pemutusan Kontrak)

### A. 21 Desa Berdokumen Baru Telah Berhasil Diaktifkan (3 November 2026)
Query insert telah dieksekusi dengan sukses. 21 desa baru mendapatkan ID `319` s/d `339` dan berstatus `is_active = 1`.

### B. Prosedur Pemutusan Kontrak / Menonaktifkan Desa
Jika terjadi pemutusan kontrak, domain tidak diperpanjang, atau desa meminta pencabutan integrasi sementara, administrator JDIH cukup mengubah nilai `is_active` menjadi `0`:

```sql
-- Berdasarkan ID Desa:
UPDATE villages SET is_active = 0, updated_at = NOW() WHERE id = 319;

-- Atau Berdasarkan URL Desa:
UPDATE villages SET is_active = 0, updated_at = NOW() WHERE url = 'https://aribaya-banjarnegara.desa.id/';
```

**Dampak Seketika (Zero-Downtime):**
1. Desa tersebut **langsung lenyap dari dropdown** publik di halaman `https://jdih.banjarnegarakab.go.id/produk-hukum-desa`.
2. Endpoint proxy JDIH (`/api/produk-hukum-desa`) akan langsung menolak dan mengembalikan:
   `HTTP 403: {"error": "URL desa tidak terdaftar atau tidak valid."}`
3. Tidak diperlukan restart Nginx maupun deploy ulang aplikasi.

### C. Prosedur Mengaktifkan Kembali (Re-Aktivasi):
```sql
UPDATE villages SET is_active = 1, updated_at = NOW() WHERE url = 'https://aribaya-banjarnegara.desa.id/';
```
