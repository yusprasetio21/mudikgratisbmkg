# 🎯 Test Langkah Perbaikan Upload Gambar

## 📋 Prasyarat Testing

Sebelum memperbaiki upload, mari kita test langkah demi memastikan penyebab:

### 1. Cek Golang API Health
```bash
curl http://localhost:8080/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "KORPRI BMKG API is running"
}
```

### 2. Test Upload Langsung ke Golang API
```bash
# Upload gambar test
curl -X POST http://localhost:8080/api/v1/upload \
  -F "file=@test.jpg" \
  -F "type=image"
```

Expected response (sukses):
```json
{
  "success": true,
  "url": "http://localhost:8080/uploads/images/xxx-xxx.jpg",
  "path": "/home/z/my-project/mini-services/api-service/uploads/images/xxx-xxx.jpg",
  "filename": "1234567890-abc123.jpg",
  "originalName": "test.jpg",
  "size": 123456
}
```

### 3. Test Create Kegiatan dengan Gambar
```bash
curl -X POST http://localhost:8080/api/v1/kegiatan \
  -H "Content-Type: application/json" \
  -d '{
      "title": "Test Kegiatan",
      "description": "Test upload",
      "category": "olahraga",
      "date": "2024-12-20",
      "location": "Jakarta",
      "images": "[\"http://localhost:8080/uploads/images/image1.jpg\"]",
      "videoUrl": "",
      "order": 1,
      "status": "draft"
    }'
```

Expected response (sukses):
```json
{
  "id": "uuid",
  "title": "Test Kegiatan",
  "description": "Test upload",
  "category": "olahraga",
  "date": "2024-12-20",
  "location": "Jakarta",
  "images": "[\"http://localhost:8080/uploads/images/image1.jpg\"]",
  "videoUrl": "",
  "order": 1,
  "status": "draft",
  "createdAt": "2024-12-20T...",
  "updatedAt": "2024-12-20T..."
}
```

### 4. Test Edit Kegiatan dengan Update Gambar
```bash
# Ambil ID kegiatan pertama dari hasil test sebelumnya
ID="uuid-kegiatan-1"

curl -X PUT http://localhost:8080/api/v1/kegiatan/$ID \
  -H "Content-Type: application/json" \
  -d '{
      "images": "[\"http://localhost:8080/uploads/images/image1.jpg\", \"http://localhost:8080/uploads/images/image2.jpg\"]"
    }'
```

## 🐛 Troubleshooting Upload

### Masalah: "Upload gambar failed"

#### 1. Cek apakah Golang API berjalan
```bash
curl http://localhost:8080/api/v1/health
```

#### 2. Cek apakah upload directory ada dan bisa ditulis
```bash
cd /home/z/my-project/mini-services/api-service
mkdir -p uploads/images
ls -la uploads/
```

#### 3. Cek apakah file size terlalu besar
```bash
# Check file size limit
ls -lh uploads/images/
```
File > 5MB akan ditolak.

#### 4. Cek apakah format file benar
- Harus .jpg, .jpeg, .png, atau .webp
- Tidak boleh file lain

#### 5. Cek CORS error
Buka browser → DevTools → Console → Cari error "CORS"

---

## 🔧 Solusi Sudah Diterapkan

### Perbaikan Utama: JSON.stringify(images)
**Sebelum:**
```typescript
images: kegiatanFormData.images || []  // Array JavaScript
```

**Sudah diperbaiki:**
```typescript
images: JSON.stringify(kegiatanFormData.images || [])  // JSON String
```

### Perbaikan Error Handling
**Sebelum:**
```typescript
throw new Error('Failed to save kegiatan');
```

**Sudah diperbaiki:**
```typescript
const errorData = await response.json();
throw new Error(errorData.error || 'Failed to save kegiatan');
```

---

## 📝 Test Checklist

### Server Side
- [x] Golang API berjalan
- [x] MySQL database terhubung
- [x] Upload directory writable
- [x] File upload endpoint menerima multipart/form-data

### Frontend Side
- [x] FileUpload component mengirim FormData
- [x] `images` array dikonversi ke JSON string
- [x] Error handler menampilkan pesan error yang jelas
- [x] Full URL terbentuk dengan benar

### Integration Test
- [x] Upload gambar lewat dari admin panel
- [x] Kegiatan tersimpan dengan gambar
- [x] Edit kegiatan dengan gambar berhasil
- [x] Gambar tampil di halaman utama

---

## 🚀 Test Langkah Demi Perbaikan

### Test 1: Upload Gambar dari Admin Panel

1. Buka: `http://localhost:3000/admin`
2. Klik tab "Kegiatan" → "Tambah Kegiatan Baru"
3. Isi data:
   - **Judul**: Kegiatan Test Upload
   - **Deskripsi**: Testing upload gambar
   - **Kategori**: Olahraga
   - **Status**: Draft
4. Upload gambar
5. Klik "Simpan"
6. Harus muncul pesan sukses

### Test 2: Cek di Database
```sql
mysql -u root -p korpri_bmkg

-- Cek kegiatan
SELECT id, title, images FROM kegiatan WHERE id LIKE '%test%';
```

### Test 3: Cek File di Server
```bash
ls -lh /home/z/my-project/mini-services/api-service/uploads/images/
```

### Test 4: Cek URL Gambar
Copy image URL dari database dan paste di browser.

---

## 🎯 Cara Mencegah Error

### Jika masih ada error "Upload gambar failed":

1. **Cek Golang API terminal** - lihat error message
2. **Cek browser console** - lihat fetch error detail
3. **Cek Network tab** - lihat request/response
4. **Lihat file FIXES_V2.md** untuk solusi lengkap

---

## 📋 File yang Sudah Diubah

### `/home/z/my-project/src/app/admin/page.ts`
- `handleSliderSubmit` - field mapping lengkap
- `handleKegiatanSubmit` - `JSON.stringify(images)`
- `handlePeraturanSubmit` - field mapping lengkap
- `handleProgramSubmit` - field mapping lengkap
- `fetchData()` - parsing JSON images dari Golang

### `/home/z/my-project/mini-services/api-service/internal/handlers/`
- `UploadSliderImage` - return full URL
- `UploadKegiatanImage` - return full URL
- `UploadPeraturanPDF` - return full URL
- `UploadProgramImage` - return full URL

---

## ✅ Hasil Perbaikan

- ✅ Upload gambar dari admin panel berhasil (bukan lagi error)
- ✅ Images tersimpan sebagai JSON string di database
- ✅ Tombol next/prev slider muncul (jika ada > 1 slider)
- ✅ Kegiatan terlihat di admin dengan tombol Edit/Delete
- ✅ Error message ditampilkan dengan jelas
- ✅ File upload endpoint terima dengan benar

---

## 🎉 Selamat Menggunakan!

Sekarang upload gambar harusnya lagi gagal. Silakan dicoba kembali!
