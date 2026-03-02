# Solusi Masalah Upload Gambar Tidak Tampil

## 📋 Masalah
Gambar yang diupload tidak tampil di halaman lokal Anda.

## 🔧 Solusi yang Sudah Dilakukan

### 1. Update Golang API
Semua upload handlers sekarang mengembalikan **full URL** yang bisa diakses:
- `http://localhost:8080/uploads/images/filename.jpg`
- `http://localhost:8080/uploads/pdfs/filename.pdf`
- `http://localhost:8080/uploads/videos/filename.mp4`

### 2. Tambah Next.js Upload Proxy
Dibuat route `/api/uploads/[...path]` untuk proxy file uploads dari Golang API ke Next.js.

### 3. Konfigurasi Environment
- Golang API: `mini-services/api-service/.env` dengan `API_HOST=localhost`
- Next.js: `.env` dengan `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`

## 🚀 Cara Memperbaiki

### Langkah 1: Setup MySQL Database

```bash
# Login ke MySQL
mysql -u root -p

# Atau jika menggunakan password default (kosong):
mysql -u root

# Import schema
mysql -u root -p < mini-services/api-service/schema.sql
```

### Langkah 2: Jalankan Golang API Service

```bash
cd mini-services/api-service

# Install dependencies (hanya sekali)
go mod download

# Jalankan API
go run cmd/api/main.go

# ATAU gunakan start script
bash start.sh
```

API akan berjalan di: **http://localhost:8080**

### Langkah 3: Pastikan Next.js Sudah Dikonfigurasi

Cek file `.env` di root project:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Langkah 4: Test Upload Gambar

1. Buka Admin Panel: `http://localhost:3000/admin`
2. Masuk ke tab Slider/Kegiatan/Program
3. Klik "Tambah Baru"
4. Upload gambar via komponen File Upload
5. Klik "Simpan"

### Langkah 5: Verifikasi Gambar Tampil

1. Cek di database MySQL:
```sql
USE korpri_bmkg;
SELECT id, title, image_url, image_path FROM sliders LIMIT 1;
```

2. Pastikan URL yang disimpan seperti:
   - `http://localhost:8080/uploads/images/1234567890-abc123.jpg`

3. Buka URL tersebut di browser untuk memastikan file bisa diakses

## 🔍 Troubleshooting

### Gambar masih tidak tampil?

1. **Cek apakah Golang API berjalan:**
   ```bash
   curl http://localhost:8080/api/v1/health
   ```
   Harus return: `{"status":"ok","message":"KORPRI BMKG API is running"}`

2. **Cek apakah file tersimpan:**
   ```bash
   ls -la mini-services/api-service/uploads/images/
   ```

3. **Cek apakah file bisa diakses:**
   ```bash
   curl http://localhost:8080/uploads/images/
   ```

4. **Cek browser console untuk error:**
   - Buka DevTools (F12)
   - Tab Console
   - Cari error 404 atau CORS

5. **Cek Next.js logs:**
   ```bash
   tail -f /home/z/my-project/dev.log
   ```

### Error CORS?

Jika ada error CORS:

1. Pastikan Golang middleware CORS sudah dikonfigurasi dengan benar
2. Cek `internal/middleware/cors.go` - pastikan origin `http://localhost:3000` ada di allowed origins

### Error 404 saat akses gambar?

1. Pastikan Golang API serving uploads:
   - Di `cmd/api/main.go`, pastikan ada: `r.Static("/uploads", "./uploads")`
   
2. Pastikan file ada di direktori yang benar:
   ```bash
   ls mini-services/api-service/uploads/images/
   ```

3. Cek path di database - pastikan path relative seperti:
   - `/uploads/images/xxx.jpg` (bukan `./uploads/images/xxx.jpg`)

### Upload berhasil tapi gambar tidak muncul di frontend?

Kemungkinan URL yang tersimpan tidak lengkap. Anda bisa update manual di database:

```sql
-- Cek data saat ini
SELECT id, title, image_url FROM sliders WHERE image_url IS NOT NULL LIMIT 5;

-- Jika URL tidak lengkap, update:
UPDATE sliders SET image_url = CONCAT('http://localhost:8080', image_path)
WHERE image_path IS NOT NULL AND image_url IS NULL OR image_url NOT LIKE 'http%';
```

## 📝 Periksa List File Upload

```bash
# Lihat semua gambar yang diupload
ls -lh mini-services/api-service/uploads/images/

# Lihat semua PDF
ls -lh mini-services/api-service/uploads/pdfs/

# Lihat semua video
ls -lh mini-services/api-service/uploads/videos/
```

## 🌐 Akses File

Setelah Golang API berjalan, file dapat diakses di:

- **Images**: `http://localhost:8080/uploads/images/`
- **PDFs**: `http://localhost:8080/uploads/pdfs/`
- **Videos**: `http://localhost:8080/uploads/videos/`

## 🔧 Debug Mode

Untuk debugging, ubah mode Golang:

Di `mini-services/api-service/.env`:
```env
GIN_MODE=debug
```

Ini akan menampilkan semua query SQL dan request logs.

## ✅ Checklist Sebelum Upload

1. [ ] MySQL sudah berjalan
2. [ ] Schema database sudah di-import
3. [ ] Golang API sudah berjalan di port 8080
4. [ ] Next.js sudah konfigurasi dengan NEXT_PUBLIC_API_URL yang benar
5. [ ] Direktori uploads sudah ada dan writable
6. [ ] CORS sudah dikonfigurasi dengan benar

## 📞 Masalah Tetap Tidak Terselesaikan?

Jika setelah mengikuti semua langkah di atas masih ada masalah:

1. Lihat logs Golang API di terminal
2. Lihat logs Next.js: `tail -f /home/z/my-project/dev.log`
3. Cek network browser (tab Network di DevTools)
4. Pastikan tidak ada firewall yang memblokir port 8080
