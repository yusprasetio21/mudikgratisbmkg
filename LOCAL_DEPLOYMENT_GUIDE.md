# Panduan Deploy Lokal - KORPRI BMKG Website

## 📋 Overview

Proyek ini menggunakan arsitektur microservices dengan **DUA DATABASE**:

1. **Prisma + SQLite** (Next.js Frontend)
   - Lokasi: `/home/z/my-project/db/custom.db`
   - Schema: `/home/z/my-project/prisma/schema.prisma`
   - Fungsi: Menyimpan data sliders, kegiatan, peraturan, program untuk frontend

2. **MySQL** (Golang Backend API Service)
   - Database: `korpri_bmkg`
   - Schema: `/home/z/my-project/mini-services/api-service/schema.sql`
   - Fungsi: Menyimpan data lengkap termasuk mudik gratis, ASN employees, dll.

---

## 🚀 Cara Deploy Lokal (Langkah-demi-Langkah)

### **Opsi 1: Deploy Minimal (Frontend Only)**
Cukup jalankan Next.js dengan database SQLite (sudah siap pakai).

### **Opsi 2: Deploy Lengkap (Frontend + Backend)**
Jalankan Next.js + Golang API + MySQL (untuk fitur lengkap).

---

## Opsi 1: Deploy Minimal (Frontend Only)

### Prerequisites
- Node.js / Bun sudah terinstall
- Tidak perlu MySQL

### Langkah-langkah

#### 1. Setup Database Prisma/SQLite

Database SQLite sudah otomatis dibuat saat pertama kali menjalankan. Tapi untuk memastikan:

```bash
cd /home/z/my-project

# Generate Prisma Client
bunx prisma generate

# Push schema ke database (buat tabel jika belum ada)
bunx prisma db push

# (Opsional) Seed dummy data
bunx prisma db seed
```

#### 2. Jalankan Next.js Development Server

```bash
cd /home/z/my-project
bun run dev
```

Website akan berjalan di `http://localhost:3000`

#### 3. Setup Data Awal (Opsional)

Buka halaman admin dan tambahkan data:
- Login: `http://localhost:3000/login`
- Username: `admin`
- Password: `admin123`

Tambahkan:
- Sliders untuk homepage
- Kegiatan (Activities)
- Program
- Peraturan

---

## Opsi 2: Deploy Lengkap (Frontend + Backend + MySQL)

### Prerequisites
- Node.js / Bun sudah terinstall
- Go 1.21 atau lebih baru
- MySQL 8.0 atau lebih baru

### Langkah-langkah

#### **Bagian 1: Setup MySQL Database**

1. **Install MySQL** (jika belum):
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server

   # macOS
   brew install mysql
   brew services start mysql

   # Windows
   # Download dari https://dev.mysql.com/downloads/mysql/
   ```

2. **Start MySQL**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mysql
   sudo systemctl enable mysql

   # Cek status
   sudo systemctl status mysql
   ```

3. **Buat Database dan Import Schema**:
   ```bash
   cd /home/z/my-project/mini-services/api-service

   # Login ke MySQL
   mysql -u root -p

   # Atau langsung import dari file
   mysql -u root -p < schema.sql
   ```

4. **Import Dummy Data** (Opsional):
   ```bash
   # Dummy data untuk ASN employees
   mysql -u root -p korpri_bmkg < dummy_asn_employees.sql

   # Dummy data untuk Mudik Gratis
   mysql -u root -p korpri_bmkg < dummy_mudikgratis_data.sql
   ```

5. **Buat User Database** (Opsional tapi direkomendasikan):
   ```sql
   -- Login ke MySQL
   mysql -u root -p

   -- Buat user baru
   CREATE USER 'korpri_user'@'localhost' IDENTIFIED BY 'password_anda';

   -- Berikan akses
   GRANT ALL PRIVILEGES ON korpri_bmkg.* TO 'korpri_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

#### **Bagian 2: Setup Golang Backend API Service**

1. **Install Dependencies Go**:
   ```bash
   cd /home/z/my-project/mini-services/api-service
   go mod download
   ```

2. **Setup Environment Variables**:
   ```bash
   cd /home/z/my-project/mini-services/api-service

   # Buat file .env jika belum ada
   cat > .env << EOF
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=korpri_bmkg
   API_PORT=8080
   GIN_MODE=debug
   EOF
   ```

   **Ganti `your_mysql_password` dengan password MySQL Anda!**

3. **Jalankan Golang API Service**:
   ```bash
   cd /home/z/my-project/mini-services/api-service

   # Mode development (dengan auto-reload)
   bun run dev

   # ATAU langsung dengan Go
   go run cmd/api/main.go
   ```

   API akan berjalan di `http://localhost:8080`

4. **Test API**:
   ```bash
   # Test health check
   curl http://localhost:8080/api/v1/health

   # Test get sliders
   curl http://localhost:8080/api/v1/sliders
   ```

#### **Bagian 3: Setup Next.js Frontend**

1. **Setup Database Prisma/SQLite**:
   ```bash
   cd /home/z/my-project

   # Generate Prisma Client
   bunx prisma generate

   # Push schema ke database
   bunx prisma db push
   ```

2. **Jalankan Next.js Development Server**:
   ```bash
   cd /home/z/my-project
   bun run dev
   ```

   Website akan berjalan di `http://localhost:3000`

---

## 📂 Struktur File Database

### Database 1: SQLite (Prisma)
- **File**: `/home/z/my-project/db/custom.db`
- **Schema**: `/home/z/my-project/prisma/schema.prisma`
- **Tabel**:
  - `User`
  - `Post`
  - `Slider`
  - `Kegiatan`
  - `Peraturan`
  - `Program`

### Database 2: MySQL
- **Database**: `korpri_bmkg`
- **Schema**: `/home/z/my-project/mini-services/api-service/schema.sql`
- **Dummy Data**:
  - `/home/z/my-project/mini-services/api-service/dummy_asn_employees.sql`
  - `/home/z/my-project/mini-services/api-service/dummy_mudikgratis_data.sql`
  - `/home/z/my-project/db/dummy-data.sql` (versi lengkap)
- **Tabel**:
  - `sliders`
  - `kegiatan`
  - `peraturan`
  - `programs`
  - `mudik_cities`
  - `mudik_city_stops`
  - `mudik_buses`
  - `mudik_participants`
  - `mudik_family_members`
  - `asn_employees`

---

## 🔧 Perintah Berguna

### Prisma/SQLite (Next.js)

```bash
cd /home/z/my-project

# Generate Prisma Client
bunx prisma generate

# Push schema ke database (buat/update tabel)
bunx prisma db push

# Reset database (HATI-HATI: akan menghapus semua data!)
bunx prisma db push --force-reset

# Buka Prisma Studio (GUI untuk melihat data)
bunx prisma studio

# Seed dummy data
bunx prisma db seed
```

### MySQL

```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE korpri_bmkg;

# Lihat semua tabel
SHOW TABLES;

# Lihat struktur tabel
DESCRIBE sliders;

# Export database
mysqldump -u root -p korpri_bmkg > backup.sql

# Import database
mysql -u root -p korpri_bmkg < backup.sql
```

### Golang API Service

```bash
cd /home/z/my-project/mini-services/api-service

# Jalankan development
bun run dev

# ATAU
go run cmd/api/main.go

# Build untuk production
go build -o api-service cmd/api/main.go
./api-service

# Build untuk berbagai platform
GOOS=linux GOARCH=amd64 go build -o api-service-linux cmd/api/main.go
GOOS=windows GOARCH=amd64 go build -o api-service.exe cmd/api/main.go
GOOS=darwin GOARCH=amd64 go build -o api-service-mac cmd/api/main.go
```

### Next.js Frontend

```bash
cd /home/z/my-project

# Jalankan development server
bun run dev

# Build untuk production
bun run build

# Jalankan production build
bun start

# Cek code quality
bun run lint
```

---

## 🐛 Troubleshooting

### Problem: Prisma Error "Database does not exist"
**Solution**:
```bash
bunx prisma db push
```

### Problem: MySQL Connection Refused
**Solution**:
```bash
# Cek apakah MySQL berjalan
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Restart MySQL
sudo systemctl restart mysql
```

### Problem: Port 3000 sudah digunakan
**Solution**:
```bash
# Cari proses yang menggunakan port 3000
lsof -i :3000

# Kill proses
kill -9 <PID>

# ATAU gunakan port lain
PORT=3001 bun run dev
```

### Problem: Port 8080 sudah digunakan (Golang API)
**Solution**:
```bash
# Cari proses
lsof -i :8080

# Kill proses
kill -9 <PID>

# ATAU ubah port di .env
# API_PORT=8081
```

### Problem: Permission Denied untuk file uploads
**Solution**:
```bash
# Buat direktori uploads dan berikan permission
mkdir -p /home/z/my-project/mini-services/api-service/uploads/images
mkdir -p /home/z/my-project/mini-services/api-service/uploads/pdfs
mkdir -p /home/z/my-project/mini-services/api-service/uploads/videos
chmod -R 755 /home/z/my-project/mini-services/api-service/uploads
```

### Problem: CORS Error saat mengakses API
**Solution**:
- Pastikan Golang API berjalan
- Cek konfigurasi CORS di `/home/z/my-project/mini-services/api-service/internal/middleware/cors.go`

---

## 📊 Cara Melihat Data

### Melihat Data SQLite (Prisma)

**Option 1: Prisma Studio (GUI)**
```bash
cd /home/z/my-project
bunx prisma studio
```
Buka `http://localhost:5555` di browser

**Option 2: SQLite CLI**
```bash
sqlite3 /home/z/my-project/db/custom.db

# Lihat semua tabel
.tables

# Query data
SELECT * FROM Slider;
SELECT * FROM Kegiatan;

# Keluar
.quit
```

### Melihat Data MySQL

**Option 1: MySQL CLI**
```bash
mysql -u root -p korpri_bmkg

# Lihat semua tabel
SHOW TABLES;

# Query data
SELECT * FROM sliders;
SELECT * FROM asn_employees LIMIT 10;

# Keluar
EXIT;
```

**Option 2: phpMyAdmin / DBeaver / MySQL Workbench**
- Connect ke `localhost:3306`
- Database: `korpri_bmkg`

---

## 🔐 Kredensial Default

### Next.js Admin Panel
- URL: `http://localhost:3000/login`
- Username: `admin`
- Password: `admin123`

### MySQL (jika menggunakan default)
- Host: `localhost`
- Port: `3306`
- Username: `root`
- Password: (sesuai setting saat install MySQL)

### Golang API
- URL: `http://localhost:8080`
- API Base: `http://localhost:8080/api/v1`

---

## 📝 Environment Variables

### Next.js (.env)
```bash
DATABASE_URL=file:/home/z/my-project/db/custom.db
NEXTAUTH_SECRET=korpri-bmkg-mudik-gratis-secret-key-change-in-production-2025
NEXTAUTH_URL=http://localhost:3000
```

### Golang API (mini-services/api-service/.env)
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=korpri_bmkg
API_PORT=8080
GIN_MODE=debug
```

---

## 🚀 Production Deployment Tips

1. **Ganti NEXTAUTH_SECRET** dengan random string yang aman
2. **Gunakan database production** (PostgreSQL/MySQL) bukan SQLite untuk Next.js
3. **Set GIN_MODE=release** untuk Golang API
4. **Gunakan process manager** seperti PM2 untuk Node.js/Next.js
5. **Setup reverse proxy** (Nginx/Caddy) untuk kedua service
6. **Setup SSL/HTTPS** dengan Let's Encrypt
7. **Backup database** secara berkala
8. **Monitoring dan logging** untuk production

---

## 📚 Dokumentasi Tambahan

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Golang Gin Framework](https://gin-gonic.com/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 💡 Tips

1. **Untuk development cepat**: Gunakan Opsi 1 (Frontend Only)
2. **Untuk fitur lengkap**: Gunakan Opsi 2 (Frontend + Backend)
3. **Gunakan Prisma Studio** untuk memanipulasi data SQLite dengan mudah
4. **Gunakan phpMyAdmin/DBeaver** untuk memanipulasi data MySQL dengan mudah
5. **Selalu backup database** sebelum melakukan perubahan besar

---

© 2025 KORPRI BMKG. Semua hak dilindungi.
