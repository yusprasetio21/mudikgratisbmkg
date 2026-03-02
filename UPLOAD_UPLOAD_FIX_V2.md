# 🐛 PERBAIKAN: Upload Gambar Failed

## 📝 Masalah
User melihat pesan error "upload gambar failed" saat mengupload gambar di admin panel.

## 🔍 Analisis Masalah

Masalah terjadi karena:
1. **Format data tidak sesuai**: Next.js mengirim array JavaScript `[]` tapi Golang API mengharapkan string JSON
2. **Golang API error**: Saat mencoba parse JSON array, error terjadi
3. **Error handling**: Error tidak ditampilkan dengan jelas ke user

## ✅ Solusi yang Dilakukan

### 1. Update handleKegiatanSubmit
**Sebelum (BUG):**
```typescript
const payload = {
  images: kegiatanFormData.images || [],  // JavaScript Array
  // ...
}
```

**Sesudah (FIXED):**
```typescript
const payload = {
  images: JSON.stringify(kegiatan.items || []), // JSON String
  // ...
}
```

### 2. Update handleSliderSubmit
**Sekarang semua handler menggunakan format yang benar untuk Golang API.**

### 3. Error Message yang Lebih Jelas
Sekarang menampilkan error detail untuk debugging:
```typescript
showMessage('error', `Gagal menyimpan kegiatan: ${error instanceof Error ? error.message : 'Unknown error'}`);
```

## 🔄 Cara Mengatasi Perbaikan

### 1. Refresh Halaman
Refresh halaman admin panel (F5) untuk memuat perubahan kode berlaku.

### 2. Coba Upload Gambar Lagi
1. Buka Admin Panel → tab Kegiatan/Program/Slider
2. Klik "Tambah Baru"
3. Upload gambar
4. Simpan
5. Pastikan tidak ada lagi error "upload gambar failed"

### 3. Test Langsung Upload
```bash
# Test upload langsung ke Golang API
curl -X POST http://localhost:8080/api/v1/upload \
  -F "file=@test.jpg" \
  -F "type=image"
```

### 4. Cek Database
```bash
mysql -u root -p korpri_bmkg

-- Cek slider images
SELECT id, title, image_url, image_path FROM sliders LIMIT 3;

-- Cek kegiatan images
SELECT id, title, images FROM kegiatan LIMIT 3;
```

## 📊 Data Format yang Benar

### ✅ BENAR (Golang API):
```json
{
  "title": "Kegiatan Olahraga",
  "description": "...",
  "images": "[\"http://localhost:8080/uploads/images/1.jpg\", \"http://localhost:8080/uploads/images/2.jpg\"]"
}
```

### ❌ SALAH (Next.js sebelumnya):
```json
{
  "title": "Kegiatan Olahraga",
  "description": "...",
  "images": ["http://localhost:8080/uploads/images/1.jpg", "http://localhost:8080/uploads/images/2.jpg"]
}
```

## 🔧 File yang Sudah Diperbaiki

### 1. `/home/z/my-project/src/app/admin/page.tsx`
- `handleSliderSubmit` - dengan mapping field lengkap
- `handleKegiatanSubmit` - `JSON.stringify(images)` untuk images
- `handlePeraturanSubmit` - field mapping lengkap
- `handleProgramSubmit` - field mapping lengkap

### 2. `/home/z/my-project/mini-services/api-service/internal/handlers/`
- `UploadSliderImage` - return full URL dengan `http://localhost:8080/`
- `UploadKegiatanImage` - return full URL
- `UploadPeraturanPDF` - return full URL
- `UploadProgramImage` - return full URL

### 3. `/home/z/my-project/mini-services/api-service/internal/utils/file.go`
- `UploadFile()` - menyimpan file ke disk
- `GetBaseURL()` - generate base URL

## 🧪 Testing

### Test Upload Gambar
```bash
# 1. Buka admin panel
# 2. Klik "Tambah Kegiatan Baru"
# 3. Upload gambar
# 4. Cek apakah berhasil disimpan
```

### Cek File di Golang API
```bash
ls -la mini-services/api-service/uploads/images/
```

### Cek di Database
```sql
SELECT id, title, image_url FROM sliders WHERE image_url IS NOT NULL;
SELECT id, title, images FROM kegiatan WHERE images IS NOT NULL;
```

## 🐛 Jika Masih Gagal

### 1. Cek Golang API Logs
```bash
cd /home/z/my-project/mini-services/api-service

# Lihat error di terminal saat upload
```

### 2. Cek Browser Console
Buka Developer Tools → Console, cari error upload

### 3. Test API Langsung
```bash
curl -X POST http://localhost:8080/api/v1/upload \
  -F "file=@test.jpg" \
  -F "type=image"
```

## 📋 Error Messages yang Mungkin Muncul

### Error: "images must be string"
Solusi: Sudah diperbaiki dengan `JSON.stringify()`

### Error: "Invalid content type: image/jpeg"
Solusi: Cek format file, pastikan .jpg, .jpeg, .png, .webp

### Error: "File size exceeds limit"
Solusi: Pastikan file < 5MB

### Error: 500 Internal Server Error
Solusi: Cek logs Golang API untuk error detail, cek MySQL connection

## ✅ Checklist Verifikasi

- [x] Golang API berjalan di port 8080
- [x] `images` dikirim sebagai JSON string, bukan array
- [x] Error message ditampilkan dengan jelas ke user
- [x] File tersimpan di `mini-services/api-service/uploads/images/`
- [x] Full URL terbentuk dengan benar (`http://localhost:8080/uploads/...`)

---

## 🚀 Setelah Perbaikan

1. **Refresh halaman admin** (F5)
2. **Coba upload gambar lagi**
3. **Pastikan berhasil disimpan tanpa error**
4. **Pastikan tombol edit/delete kegiatan berfungsi**

---

## 📝 Code Snippet Penting

### Format Benar untuk Images:
```typescript
// ✅ BENAR - JSON String
images: JSON.stringify([url1, url2, url3])

// ❌ SALAH - JavaScript Array
images: [url1, url2, url3]
```

### Contoh Error Handling:
```typescript
try {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }
  // ...
} catch (error) {
  console.error('Upload error:', error);
  showMessage('error', `Upload failed: ${error.message}`);
}
```

---

## 🎯 Kesimpulan

Masalah "upload gambar failed" sudah diperbaiki dengan mengubah format data array menjadi JSON string saat submit ke Golang API. Semua handler (Slider, Kegiatan, Peraturan, Program) sekarang menggunakan format yang benar.
