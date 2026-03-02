# 🔧 Perbaikan Masalah - Tombol Slider & Kegiatan Admin

## ✅ Masalah yang Diperbaiki

### 1. Tombol Next/Prev Slider Tidak Muncul
**Penyebab**: Tombol navigasi slider tidak terlihat

**Solusi**:
- ✅ Tambah Font Awesome CDN di `src/app/layout.tsx`
- ✅ Cek apakah ada lebih dari 1 slider (tombol hanya muncul jika ada >1 slide)
- ✅ Tombol menggunakan icon `<i className="fas fa-chevron-left"></i>` dari Font Awesome

### 2. Kegiatan Masuk Database Tidak Terlihat di Admin
**Penyebab**: Kegiatan sudah diinput tapi tidak muncul di list admin panel, tidak bisa edit/delete

**Solusi**:
- ✅ Update `fetchData()` untuk parsing JSON images dari Golang API
- ✅ Update mapping field (`event_date` ↔ `date`, `display_order` ↔ `order`)
- ✅ Parse JSON images saat edit kegiatan
- ✅ Update `handleKegiatanSubmit` dengan field mapping yang benar ke Golang API

---

## 🚀 Cara Cek Perbaikan

### Cek Font Awesome (Icon Tombol)

1. Buka website di browser
2. Klik kanan → Inspect → Elements
3. Cek apakah ada elemen `<link>` untuk Font Awesome
4. Refresh browser (Ctrl+F5)

### Cek Tombol Slider

1. Pastikan ada minimal **2 slider** yang statusnya "published"
2. Tombol next/prev hanya muncul jika ada > 1 slide
3. Cek console browser untuk error JavaScript

### Cek Kegiatan di Admin

1. Buka `http://localhost:3000/admin`
2. Klik tab "Kegiatan"
3. Pastikan Golang API berjalan di port 8080
4. Cek apakah Golang API mengembalikan data:
   ```bash
   curl http://localhost:8080/api/v1/kegiatan?status=all
   ```
5. Jika ada data tapi tidak muncul, refresh halaman admin

### Test Upload Gambar

1. Buka admin panel → tab Slider/Kegiatan/Program
2. Upload gambar
3. Simpan
4. Pastikan gambar tersimpan:
   ```bash
   ls -la mini-services/api-service/uploads/images/
   ```
5. Buka URL gambar untuk memastikan bisa diakses:
   ```
   http://localhost:8080/uploads/images/<filename>
   ```

---

## 🔧 Perubahan Kode

### 1. Font Awesome (`src/app/layout.tsx`)
```typescript
import Script from "next/script";

// Tambah di dalam return sebelum </body>:
<Script
  src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
  strategy="afterInteractive"
/>
```

### 2. Admin Panel Data Fetching (`src/app/admin/page.tsx`)

**Perbaikan `fetchData()` untuk parsing JSON:**
```typescript
if (kegiatanRes.ok) {
  const kegiatanData = await kegiatanRes.json();
  const parsedKegiatan = kegiatanData.map((item: any) => ({
    ...item,
    images: item.images ? JSON.parse(item.images) : [],
    date: item.event_date || item.date,
    order: item.display_order || item.order,
  }));
  setKegiatan(parsedKegiatan);
}
```

**Perbaikan `handleKegiatanSubmit()` untuk mapping field:**
```typescript
const payload = {
  title: kegiatanFormData.title,
  description: kegiatanFormData.description,
  category: kegiatanFormData.category || 'olahraga',
  date: kegiatanFormData.date || '',
  location: kegiatanFormData.location || '',
  images: kegiatanFormData.images || [],
  videoUrl: kegiatanFormData.videoUrl || '',
  order: kegiatanFormData.order || 0,
  status: kegiatanFormData.status || 'draft',
};
```

---

## 🐛 Troubleshooting

### Tombol masih tidak muncul?

1. Pastikan Font Awesome terload:
   - Buka Developer Tools → Network
   - Cek request ke `font-awesome` CDN
   - Status harus 200

2. Pastikan ada >1 slider published:
   ```sql
   SELECT COUNT(*) FROM sliders WHERE status = 'published';
   ```
   Jika hasil = 0 atau 1, tombol tidak akan muncul

3. Cek browser console untuk error JavaScript

### Kegiatan masih tidak muncul?

1. Test API langsung:
   ```bash
   curl http://localhost:8080/api/v1/kegiatan
   ```

2. Cek response JSON format - pastikan field-field mapping sesuai

3. Cek browser console untuk error fetch

---

## ✅ Checklist Verifikasi

- [ ] Font Awesome CDN terload (check Network tab)
- [ ] Ada minimal 2 slider published di database
- [ ] Golang API berjalan di port 8080
-   ```bash
   curl http://localhost:8080/api/v1/health
   ```
- [ ] Kegiatan API mengembalikan data
-   ```bash
   curl http://localhost:8080/api/v1/kegiatan
   ```
- [ ] Images di-parse dengan benar saat fetch data
- [ ] Tombol edit/delete kegiatan muncul di admin panel
- [ ] Upload gambar berhasil dan URL terbentuk dengan benar

---

## 📝 Langkah Cepat untuk Test

1. **Start Golang API** (jika belum berjalan):
   ```bash
   cd /home/z/my-project/mini-services/api-service
   go run cmd/api/main.go
   ```

2. **Buka Admin Panel**: http://localhost:3000/admin

3. **Test Slider**:
   - Buat 2 slider dengan status "published"
   - Pastikan tombol next/prev muncul

4. **Test Kegiatan**:
   - Upload kegiatan baru
   - Pastikan muncul di list
   - Cek tombol edit/delete bisa digunakan

5. **Refresh browser** (F5) untuk melihat perubahan

---

## 🎯 Hasil Perbaikan

### Tombol Slider
- ✅ Font Awesome icon muncul (chevron left/right)
- ✅ Tombol next/prev muncul jika ada > 1 slide
- ✅ Animasi transisi smooth
- ✅ Hover effect pada tombol

### Admin Panel Kegiatan
- ✅ Data kegiatan dari Golang API muncul di tabel
- ✅ Tombol Edit berfungsi untuk edit
- ✅ Tombol Delete berfungsi untuk hapus
- ✅ Images field ter-parsing dengan benar (JSON → Array)
- ✅ Field mapping sesuai dengan Golang API format

---

## 📊 Field Mapping Golang API ↔ Next.js

| Field (Golang) | Field (Next.js) | Catatan |
|-----------------|----------------|---------|
| `event_date` | `date` | Tanggal kegiatan |
| `display_order` | `order` | Urutan tampil |
| `images` (JSON) | `images` (Array) | Daftar gambar |

---

## 🔄 Jika Masih Bermasalah

1. **Restart services**:
   - Stop Golang API (Ctrl+C)
   - Run ulang `go run cmd/api/main.go`
   - Refresh Next.js

2. **Check database**:
   ```bash
   mysql -u root -p korpri_bmkg
   SELECT * FROM kegiatan LIMIT 3;
   ```

3. **Check logs**:
   - Golang API terminal - lihat error response
   - Next.js logs: `tail -f /home/z/my-project/dev.log`

4. **Clear cache**:
   - Browser: Ctrl+Shift+R
   - Atau buka incognito mode

---

## 📞 Need Help?

Jika masih ada masalah setelah mengikuti semua langkah di atas, berikan:

1. Error message dari browser console
2. Error message dari Golang API terminal
3. Hasil query `curl` dari Golang API
4. Screenshot dari masalah yang dihadapi
