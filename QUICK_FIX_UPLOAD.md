# 🚨 FIX: Upload Gambar Tidak Tampil

## 📝 Solusi Cepat

### 1. Start MySQL (jika belum)
```bash
# Login MySQL
mysql -u root -p

# Import database schema
mysql -u root -p < /home/z/my-project/mini-services/api-service/schema.sql
```

### 2. Start Golang API
```bash
cd /home/z/my-project/mini-services/api-service

# Install dependencies (hanya pertama kali)
go mod download

# Jalankan API
go run cmd/api/main.go
```

✅ API akan berjalan di: `http://localhost:8080`

### 3. Test API Health Check
```bash
curl http://localhost:8080/api/v1/health
```

Harus return: `{"status":"ok","message":"KORPRI BMKG API is running"}`

### 4. Test Upload File
- Buka: `http://localhost:3000/admin`
- Coba upload gambar di admin panel
- Cek apakah gambar tampil

---

## 🔍 Jika Masih Tidak Tampil

### Cek 1: Apakah File Tersimpan?
```bash
ls -lh /home/z/my-project/mini-services/api-service/uploads/images/
```

Jika kosong, upload gagal. Cek error di terminal Golang API.

### Cek 2: Apakah File Bisa Diakses?
```bash
# Cek salah satu file yang diupload
curl http://localhost:8080/uploads/images/
```

### Cek 3: Cek Database
```bash
mysql -u root -p korpri_bmkg

SELECT id, title, image_url, image_path FROM sliders WHERE image_url IS NOT NULL LIMIT 1;
```

Pastikan `image_url` seperti: `http://localhost:8080/uploads/images/xxx.jpg`

### Cek 4: Cek Browser Console
1. Klik kanan → Inspect → Tab Console
2. Cari error 404, CORS, atau failed fetch

### Cek 5: Test Direct URL
Copy `image_url` dari database dan paste di browser. Harus tampil gambar.

---

## ⚙️ Perbaikan Manual (Jika Perlu)

Jika URL di database tidak lengkap (tidak ada `http://localhost:8080`):

```sql
-- Update semua slider image URLs
UPDATE sliders 
SET image_url = CONCAT('http://localhost:8080', image_path)
WHERE image_path IS NOT NULL AND (image_url IS NULL OR image_url NOT LIKE 'http%');

-- Update kegiatan
UPDATE kegiatan
SET images = REPLACE(images, '"', CONCAT('"http://localhost:8008/api/v1/', '"'))
WHERE images IS NOT NULL;

-- Update peraturan
UPDATE peraturan
SET pdf_url = CONCAT('http://localhost:8080', pdf_path)
WHERE pdf_path IS NOT NULL;

-- Update program
UPDATE programs
SET image_url = CONCAT('http://localhost:8080', image_path)
WHERE image_path IS NOT NULL;
```

---

## 🛠️ Check Port Availability

```bash
# Cek port 8080
netstat -tlnp | grep 8080

# Cek port 3306 (MySQL)
netstat -tlnp | grep 3306
```

Pastikan kedua port sedang listen.

---

## 📋 Restart Semua Service

```bash
# 1. Stop Golang API (Ctrl+C di terminalnya)

# 2. Restart Golang API
cd /home/z/my-project/mini-services/api-service
go run cmd/api/main.go

# 3. Refresh browser (F5)
```

---

## ✅ Cek List Semua

Jika semuanya berjalan benar:

1. ✅ MySQL berjalan di port 3306
2. ✅ Golang API berjalan di port 8080
3. ✅ Next.js berjalan di port 3000
4. ✅ Upload directory ada dan writable
5. ✅ File tersimpan setelah upload
6. ✅ Full URL terbentuk dengan benar

Maka gambar akan tampil dengan sempurna!

---

## 💡 Tips

- **Selalu cek terminal Golang API** saat upload untuk melihat error
- **Selalu cek Network tab** di browser DevTools untuk request yang gagal
- **Gunakan gambar ukuran kecil** (< 1MB) untuk testing awal
- **Pastikan format file benar**: .jpg, .png, .jpeg untuk gambar
