# 🚀 Quick Start - Deploy Lokal KORPRI BMKG

## ✅ Cara Paling Cepat (Rekomendasi)

### Langkah 1: Setup Database (SQLite - Auto)
```bash
cd /home/z/my-project

# Generate & push database
bunx prisma generate
bunx prisma db push
```

### Langkah 2: Jalankan Aplikasi
```bash
bun run dev
```

### Langkah 3: Buka di Browser
- **Website**: http://localhost:3000
- **Admin Login**: http://localhost:3000/login
  - Username: `admin`
  - Password: `admin123`

**Selesai!** 🎉

---

## 📦 Jika Ingin Fitur Lengkap (MySQL + Golang API)

### Step 1: Setup MySQL Database

```bash
# Import schema + dummy data sekaligus
mysql -u root -p < /home/z/my-project/db/complete-mysql-schema-with-data.sql
```

### Step 2: Jalankan Golang API (Terminal 1)

```bash
cd /home/z/my-project/mini-services/api-service

# Setup .env
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=korpri_bmkg
API_PORT=8080
GIN_MODE=debug
EOF

# Jalankan
bun run dev
```

### Step 3: Jalankan Next.js (Terminal 2)

```bash
cd /home/z/my-project
bun run dev
```

### URLs:
- **Frontend**: http://localhost:3000
- **Golang API**: http://localhost:8080
- **API Health Check**: http://localhost:8080/api/v1/health

---

## 📂 File Database yang Tersedia

### SQLite (Untuk Next.js Frontend)
- ✅ **Schema**: `/home/z/my-project/prisma/schema.prisma`
- ✅ **Database File**: `/home/z/my-project/db/custom.db` (auto-created)

### MySQL (Untuk Golang Backend)
- ✅ **Schema**: `/home/z/my-project/mini-services/api-service/schema.sql`
- ✅ **Schema + Data**: `/home/z/my-project/db/complete-mysql-schema-with-data.sql`
- ✅ **Dummy Data**: `/home/z/my-project/db/dummy-data.sql`

---

## 🔍 Cara Melihat Data

### SQLite Data (Frontend)
```bash
cd /home/z/my-project
bunx prisma studio
# Buka http://localhost:5555
```

### MySQL Data (Backend)
```bash
mysql -u root -p korpri_bmkg
mysql> SHOW TABLES;
mysql> SELECT * FROM sliders;
```

---

## 📋 Perintah Berguna

```bash
# Prisma
bunx prisma generate    # Generate client
bunx prisma db push     # Push schema
bunx prisma studio      # Buka GUI

# Next.js
bun run dev             # Development server
bun run build           # Build production
bun start               # Run production

# Golang API
cd mini-services/api-service
bun run dev             # Development server
go run cmd/api/main.go  # Run with Go
```

---

## 📖 Dokumentasi Lengkap

- **Panduan Lengkap**: `/home/z/my-project/LOCAL_DEPLOYMENT_GUIDE.md`
- **Database Guide**: `/home/z/my-project/db/README.md`
- **Setup Script**: `/home/z/my-project/setup-local.sh`

---

## 💡 Tips

1. **Untuk testing cepat**: Cukup SQLite + Next.js (Opsi 1)
2. **Untuk fitur lengkap**: SQLite + Next.js + MySQL + Golang (Opsi 2)
3. **Gunakan Prisma Studio** untuk edit data SQLite dengan mudah
4. **Gunakan phpMyAdmin/DBeaver** untuk edit data MySQL dengan mudah

---

## 🆘 Masalah?

### Database tidak muncul?
```bash
bunx prisma db push
```

### Port 3000 sudah dipakai?
```bash
lsof -i :3000
kill -9 <PID>
```

### MySQL connection error?
```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

---

© 2025 KORPRI BMKG
