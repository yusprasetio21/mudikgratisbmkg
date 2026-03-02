# Database Guide - KORPRI BMKG

## 📁 File Database

### 1. SQLite Database (Prisma/Next.js)
- **File**: `/home/z/my-project/db/custom.db`
- **Schema**: `/home/z/my-project/prisma/schema.prisma`
- **Status**: ✅ Auto-created saat pertama kali dijalankan
- **Fungsi**: Menyimpan data untuk Next.js frontend (sliders, kegiatan, peraturan, program)

### 2. MySQL Database (Golang Backend)
- **Database**: `korpri_bmkg`
- **Schema File**: `/home/z/my-project/mini-services/api-service/schema.sql`
- **Complete Schema + Data**: `/home/z/my-project/db/complete-mysql-schema-with-data.sql`
- **Dummy Data**:
  - `/home/z/my-project/db/dummy-data.sql` (lengkap)
  - `/home/z/my-project/mini-services/api-service/dummy_asn_employees.sql`
  - `/home/z/my-project/mini-services/api-service/dummy_mudikgratis_data.sql`

## 🚀 Cara Setup Database

### Opsi A: SQLite Saja (Frontend Only - Cepat)

Sudah otomatis siap! Cukup jalankan:

```bash
cd /home/z/my-project

# Generate Prisma Client
bunx prisma generate

# Push schema ke database
bunx prisma db push

# Jalankan aplikasi
bun run dev
```

### Opsi B: MySQL Lengkap (Frontend + Backend)

#### Step 1: Import Schema ke MySQL

```bash
# Opsi 1: Import schema kosong
mysql -u root -p < /home/z/my-project/mini-services/api-service/schema.sql

# Opsi 2: Import schema + dummy data (lengkap) - REKOMENDASI!
mysql -u root -p < /home/z/my-project/db/complete-mysql-schema-with-data.sql

# Opsi 3: Import per bagian
mysql -u root -p korpri_bmkg < /home/z/my-project/mini-services/api-service/dummy_asn_employees.sql
mysql -u root -p korpri_bmkg < /home/z/my-project/mini-services/api-service/dummy_mudikgratis_data.sql
```

#### Step 2: Setup Golang API

```bash
cd /home/z/my-project/mini-services/api-service

# Buat file .env
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=korpri_bmkg
API_PORT=8080
GIN_MODE=debug
EOF

# Install dependencies
go mod download

# Jalankan
bun run dev
```

#### Step 3: Setup Next.js (SQLite)

```bash
cd /home/z/my-project

bunx prisma generate
bunx prisma db push
bun run dev
```

## 🔍 Cara Melihat Data

### SQLite (Prisma)

**Option 1: Prisma Studio (GUI - Recommended)**
```bash
cd /home/z/my-project
bunx prisma studio
```
Buka `http://localhost:5555`

**Option 2: SQLite CLI**
```bash
sqlite3 /home/z/my-project/db/custom.db

# Lihat semua tabel
.tables

# Query data
SELECT * FROM Slider;
SELECT * FROM Kegiatan;
SELECT * FROM Program;

# Keluar
.quit
```

### MySQL

**Option 1: MySQL CLI**
```bash
mysql -u root -p korpri_bmkg

# Lihat semua tabel
SHOW TABLES;

# Query data
SELECT * FROM sliders;
SELECT * FROM asn_employees LIMIT 10;

# Count data
SELECT COUNT(*) FROM sliders;
SELECT COUNT(*) FROM asn_employees;

# Keluar
EXIT;
```

**Option 2: phpMyAdmin / DBeaver / MySQL Workbench**
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `your_password`
- Database: `korpri_bmkg`

## 📊 Struktur Tabel

### SQLite (Prisma)
- `User` - User data
- `Post` - Blog posts
- `Slider` - Homepage sliders
- `Kegiatan` - Activities/events
- `Peraturan` - Regulations
- `Program` - Programs

### MySQL
- `sliders` - Homepage sliders
- `kegiatan` - Activities/events
- `peraturan` - Regulations
- `programs` - Programs
- `mudik_cities` - Mudik Gratis destination cities
- `mudik_city_stops` - Bus stops in each city
- `mudik_buses` - Bus fleet
- `mudik_participants` - Mudik participants
- `mudik_family_members` - Family members of participants
- `asn_employees` - ASN employee data

## 🛠️ Perintah Prisma Berguna

```bash
cd /home/z/my-project

# Generate Prisma Client
bunx prisma generate

# Push schema ke database (buat/update tabel)
bunx prisma db push

# Reset database (HATI-HATI: akan menghapus semua data!)
bunx prisma db push --force-reset

# Buka Prisma Studio (GUI)
bunx prisma studio

# Format Prisma Schema
bunx prisma format

# Validate Prisma Schema
bunx prisma validate

# Seed dummy data
bunx prisma db seed
```

## 🛠️ Perintah MySQL Berguna

```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE korpri_bmkg;

# Lihat semua tabel
SHOW TABLES;

# Lihat struktur tabel
DESCRIBE sliders;
DESCRIBE asn_employees;

# Lihat index
SHOW INDEX FROM sliders;

# Export database
mysqldump -u root -p korpri_bmkg > backup.sql

# Import database
mysql -u root -p korpri_bmkg < backup.sql

# Hapus database (HATI-HATI!)
DROP DATABASE korpri_bmkg;

# Buat database baru
CREATE DATABASE korpri_bmkg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🔄 Sinkronisasi Data (Opsional)

Jika ingin sinkronisasi data antara SQLite dan MySQL:

**Export dari SQLite:**
```bash
sqlite3 /home/z/my-project/db/custom.db << EOF
.headers on
.mode csv
.output sliders.csv
SELECT * FROM Slider;
.quit
EOF
```

**Import ke MySQL:**
```bash
mysql -u root -p korpri_bmkg << EOF
LOAD DATA LOCAL INFILE 'sliders.csv'
INTO TABLE sliders
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
EOF
```

## 📝 Notes

1. **SQLite** digunakan untuk Next.js karena cepat dan tidak perlu setup server
2. **MySQL** digunakan untuk Golang backend karena lebih powerful untuk data besar
3. Keduanya bisa berjalan bersamaan tanpa konflik
4. Untuk production, disarankan mengganti SQLite dengan PostgreSQL atau MySQL

## 🆘 Troubleshooting

### Problem: Prisma Error "Database does not exist"
**Solution**:
```bash
bunx prisma db push
```

### Problem: MySQL Access Denied
**Solution**:
```bash
# Reset MySQL root password (Ubuntu/Debian)
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

### Problem: SQLite Database Locked
**Solution**:
```bash
# Stop semua aplikasi yang menggunakan database
# Lalu coba lagi
bunx prisma studio
```

## 📚 Dokumentasi

- [Prisma Docs](https://www.prisma.io/docs)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [SQLite Docs](https://www.sqlite.org/docs.html)

---

© 2025 KORPRI BMKG
