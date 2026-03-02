#!/bin/bash

# Script Setup Lokal KORPRI BMKG Website
# =========================================

set -e

echo "========================================="
echo "KORPRI BMKG - Local Setup Script"
echo "========================================="
echo ""

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fungsi untuk menampilkan pesan
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Cek apakah berada di root directory project
if [ ! -f "package.json" ]; then
    print_error "Harap jalankan script ini dari root directory project"
    exit 1
fi

echo "Memilih opsi setup:"
echo "1) Setup Frontend Only (Prisma/SQLite) - Cepat"
echo "2) Setup Lengkap (Frontend + Backend + MySQL) - Full Features"
echo ""
read -p "Pilih opsi (1/2): " choice

case $choice in
    1)
        echo ""
        print_info "Setup Frontend Only (Prisma/SQLite)..."
        echo ""

        # Setup Prisma
        print_info "Setup Prisma/SQLite..."

        if [ ! -d "db" ]; then
            mkdir -p db
            print_success "Membuat direktori db/"
        fi

        print_info "Generate Prisma Client..."
        bunx prisma generate

        print_info "Push schema ke database..."
        bunx prisma db push

        print_success "Setup Prisma/SQLite selesai!"
        echo ""

        print_info "Jalankan Next.js dengan: bun run dev"
        print_info "Website akan berjalan di: http://localhost:3000"
        print_info "Login admin: http://localhost:3000/login"
        print_info "Username: admin"
        print_info "Password: admin123"
        ;;

    2)
        echo ""
        print_info "Setup Lengkap (Frontend + Backend + MySQL)..."
        echo ""

        # Cek MySQL
        if ! command -v mysql &> /dev/null; then
            print_error "MySQL tidak terinstall!"
            print_info "Install MySQL terlebih dahulu:"
            echo "  Ubuntu/Debian: sudo apt install mysql-server"
            echo "  macOS: brew install mysql"
            echo "  Windows: Download dari https://dev.mysql.com/downloads/mysql/"
            exit 1
        fi

        print_success "MySQL terinstall!"

        # Input MySQL password
        echo ""
        read -sp "Masukkan password MySQL root: " mysql_password
        echo ""

        # Test MySQL connection
        print_info "Testing MySQL connection..."
        if mysql -u root -p"$mysql_password" -e "SELECT 1;" &> /dev/null; then
            print_success "MySQL connection berhasil!"
        else
            print_error "MySQL connection gagal! Periksa password Anda."
            exit 1
        fi

        # Setup MySQL Database
        print_info "Setup MySQL Database..."
        if [ -f "mini-services/api-service/schema.sql" ]; then
            mysql -u root -p"$mysql_password" < mini-services/api-service/schema.sql
            print_success "Database korpri_bmkg dibuat!"
        else
            print_error "File schema.sql tidak ditemukan!"
            exit 1
        fi

        # Import dummy data (opsional)
        read -p "Import dummy data ke MySQL? (y/n): " import_dummy
        if [ "$import_dummy" = "y" ] || [ "$import_dummy" = "Y" ]; then
            if [ -f "db/dummy-data.sql" ]; then
                print_info "Import dummy data..."
                mysql -u root -p"$mysql_password" korpri_bmkg < db/dummy-data.sql
                print_success "Dummy data diimport!"
            fi
        fi

        # Setup Golang API
        echo ""
        print_info "Setup Golang API Service..."
        cd mini-services/api-service

        # Install dependencies
        if [ -f "go.mod" ]; then
            print_info "Download Go dependencies..."
            go mod download
            print_success "Go dependencies terinstall!"
        else
            print_error "go.mod tidak ditemukan!"
            cd ../..
            exit 1
        fi

        # Setup .env untuk Golang API
        if [ ! -f ".env" ]; then
            print_info "Membuat file .env untuk Golang API..."
            cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=$mysql_password
DB_NAME=korpri_bmkg
API_PORT=8080
GIN_MODE=debug
EOF
            print_success "File .env dibuat!"
        else
            print_info "File .env sudah ada, skip..."
        fi

        cd ../..

        # Setup Prisma/SQLite
        echo ""
        print_info "Setup Prisma/SQLite..."

        if [ ! -d "db" ]; then
            mkdir -p db
        fi

        print_info "Generate Prisma Client..."
        bunx prisma generate

        print_info "Push schema ke database..."
        bunx prisma db push

        print_success "Setup Prisma/SQLite selesai!"

        # Summary
        echo ""
        echo "========================================="
        print_success "Setup Lengkap Selesai!"
        echo "========================================="
        echo ""
        print_info "Untuk menjalankan aplikasi:"
        echo ""
        echo "1. Jalankan Golang API (Terminal 1):"
        echo "   cd /home/z/my-project/mini-services/api-service"
        echo "   bun run dev"
        echo "   # ATAU"
        echo "   go run cmd/api/main.go"
        echo ""
        echo "2. Jalankan Next.js (Terminal 2):"
        echo "   cd /home/z/my-project"
        echo "   bun run dev"
        echo ""
        print_info "URL:"
        echo "  - Frontend: http://localhost:3000"
        echo "  - Golang API: http://localhost:8080"
        echo "  - API Health: http://localhost:8080/api/v1/health"
        echo "  - Admin Login: http://localhost:3000/login"
        echo ""
        print_info "Kredensial Admin:"
        echo "  - Username: admin"
        echo "  - Password: admin123"
        echo ""
        ;;

    *)
        print_error "Pilihan tidak valid!"
        exit 1
        ;;
esac

echo ""
print_success "Selesai!"
echo ""
