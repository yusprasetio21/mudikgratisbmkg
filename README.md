# KORPRI BMKG Website - Modern Architecture

High-performance website with Golang + MySQL backend and Next.js frontend.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (Port 3000)                    │
│  - React Components                                         │
│  - UI/UX with shadcn/ui                                    │
│  - Client-side State Management                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ (API Calls via Proxy)
┌─────────────────────────────────────────────────────────────┐
│          Next.js API Routes (Internal Proxy)                 │
│  - /api/sliders                                            │
│  - /api/kegiatan                                           │
│  - /api/peraturan                                          │
│  - /api/program                                            │
│  - /api/upload                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│         Golang API Service (Port 8080)                      │
│  - Gin Web Framework                                       │
│  - GORM for Database Operations                            │
│  - File Upload Handling                                    │
│  - Security Middleware                                     │
│  - Connection Pooling                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              MySQL Database (Port 3306)                     │
│  - sliders                                                │
│  - kegiatan                                               │
│  - peraturan                                              │
│  - programs                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: React Hooks, Zustand

### Backend
- **Language**: Golang 1.21
- **Web Framework**: Gin
- **ORM**: GORM
- **Database**: MySQL 8.0
- **File Upload**: Multipart form handling

### Infrastructure
- **Database**: MySQL with connection pooling
- **File Storage**: Local filesystem (expandable to S3)
- **CORS**: Configured for frontend access
- **Security**: Headers, rate limiting, input validation

## 📋 Features

### Public Website
- **Homepage (`/`)**
  - Premium slider with smooth animations
  - Features and activities sections
  - Responsive design

- **Kegiatan (`/kegiatan`)**
  - Gallery-based activity showcase
  - Multiple images and video support
  - Category filtering
  - Modal detail view

- **Peraturan (`/peraturan`)**
  - PDF document viewer
  - Categories: Kepala, Himbauan, Peraturan
  - Download functionality

- **Program (`/program`)**
  - Program listing with images
  - Individual program detail pages
  - Custom slugs for URLs
  - Registration links

### Admin Panel (`/admin`)
- Complete CRUD for all content types
- File upload with preview
- Status management (Draft/Published)
- Real-time preview
- Category management

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ (for Next.js)
- Go 1.21+ (for API)
- MySQL 8.0+ (for database)
- Bun or npm (for package management)

### 1. Clone the repository
```bash
cd /home/z/my-project
```

### 2. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
mysql -u root -p < mini-services/api-service/schema.sql
```

### 3. Configure Golang API

```bash
cd mini-services/api-service

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=korpri_bmkg
# API_PORT=8080
```

### 4. Install Golang Dependencies

```bash
cd mini-services/api-service
go mod download
```

### 5. Install Next.js Dependencies

```bash
cd /home/z/my-project
bun install
```

### 6. Configure Frontend

Edit `.env` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 🏃 Running the Application

### Start MySQL
```bash
# Linux
sudo systemctl start mysql

# Or using Docker
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=korpri_bmkg \
  -p 3306:3306 \
  mysql:8.0
```

### Start Golang API Service

```bash
cd mini-services/api-service

# Development mode
bun run dev

# Or directly with Go
go run cmd/api/main.go

# Production build
go build -o api-service cmd/api/main.go
./api-service
```

API will be available at: `http://localhost:8080`

### Start Next.js Frontend

```bash
cd /home/z/my-project

# Development mode (auto-starts by the system)
bun run dev

# Or manually
bun run dev
```

Frontend will be available at: `http://localhost:3000`

## 📁 Project Structure

```
my-project/
├── mini-services/
│   └── api-service/              # Golang Backend
│       ├── cmd/
│       │   └── api/
│       │       └── main.go      # API entry point
│       ├── internal/
│       │   ├── config/          # Configuration
│       │   ├── handlers/        # Request handlers
│       │   ├── middleware/      # CORS, security
│       │   ├── models/          # Data models
│       │   ├── routes/          # Route definitions
│       │   └── utils/           # Utilities
│       ├── uploads/             # Uploaded files
│       ├── schema.sql           # Database schema
│       ├── go.mod
│       └── package.json
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── admin/               # Admin panel
│   │   ├── api/                 # API proxy routes
│   │   ├── kegiatan/            # Activities pages
│   │   ├── peraturan/           # Regulations pages
│   │   └── program/             # Programs pages
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── file-upload.tsx      # File upload component
│   │   ├── navbar.tsx           # Navigation
│   │   └── ...
│   └── lib/
│       ├── api-client.ts         # API client for Golang
│       └── utils.ts             # Utilities
│
├── prisma/                      # Old Prisma (can be removed)
├── .env                         # Environment variables
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Golang API (http://localhost:8080/api/v1)

#### Health
- `GET /api/v1/health`

#### File Upload
- `POST /api/v1/upload`

#### Sliders
- `GET /api/v1/sliders`
- `POST /api/v1/sliders`
- `GET /api/v1/sliders/:id`
- `PUT /api/v1/sliders/:id`
- `DELETE /api/v1/sliders/:id`
- `PATCH /api/v1/sliders/:id/status`

#### Kegiatan
- `GET /api/v1/kegiatan`
- `POST /api/v1/kegiatan`
- `GET /api/v1/kegiatan/:id`
- `PUT /api/v1/kegiatan/:id`
- `DELETE /api/v1/kegiatan/:id`

#### Peraturan
- `GET /api/v1/peraturan`
- `POST /api/v1/peraturan`
- `GET /api/v1/peraturan/:id`
- `PUT /api/v1/peraturan/:id`
- `DELETE /api/v1/peraturan/:id`

#### Programs
- `GET /api/v1/programs`
- `POST /api/v1/programs`
- `GET /api/v1/programs/:id`
- `GET /api/v1/programs/slug/:slug`
- `PUT /api/v1/programs/:id`
- `DELETE /api/v1/programs/:id`

## 🔒 Security Features

### Backend (Golang)
- ✅ CORS configuration
- ✅ Security headers (X-Frame-Options, CSP, X-Content-Type-Options)
- ✅ SQL injection prevention (GORM parameterized queries)
- ✅ File type validation
- ✅ File size limits
- ✅ Content-Type validation
- ✅ Request logging
- ✅ Error handling

### Frontend (Next.js)
- ✅ Environment variables protection
- ✅ API proxy to hide backend URL
- ✅ Input validation
- ✅ XSS protection (React)

## ⚡ Performance Optimization

### Database (MySQL)
- Connection pooling (10 idle, 100 max)
- Indexes on frequently queried fields
- Optimized queries
- UTF-8 support for Indonesian text

### Backend (Golang)
- Efficient memory usage
- Binary protocol for MySQL
- Concurrent request handling
- Minimal overhead

### Frontend (Next.js)
- Server-side rendering where needed
- Client-side state management
- Lazy loading for images
- Code splitting

## 📊 Resource Usage

With 8GB RAM and 4 cores, this architecture efficiently handles:

- **Golang API**: ~100-200MB RAM with connection pooling
- **MySQL**: ~500MB RAM with configured pool
- **Next.js**: ~200-400MB RAM
- **Headroom**: ~7GB for future growth

## 🔧 Configuration

### Environment Variables

#### Golang API (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=korpri_bmkg
API_PORT=8080
GIN_MODE=debug  # Use "release" for production
```

#### Next.js (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 🚦 Deployment

### Development
All services run locally on different ports:
- Next.js: 3000
- Golang API: 8080
- MySQL: 3306

### Production (Single Server)

#### Option 1: Docker Compose
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: korpri_bmkg
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"

  api:
    build: ./mini-services/api-service
    environment:
      DB_HOST: mysql
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      - mysql
    ports:
      - "8080:8080"
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: .
    environment:
      NEXT_PUBLIC_API_URL: http://api:8080/api/v1
    depends_on:
      - api
    ports:
      - "3000:3000"

volumes:
  mysql-data:
```

#### Option 2: Systemd Services
Create separate service files for MySQL, Golang API, and Next.js.

## 📝 Usage Guide

### Accessing the Application

1. **Frontend**: http://localhost:3000
2. **Admin Panel**: http://localhost:3000/admin
3. **Golang API**: http://localhost:8080/api/v1
4. **Health Check**: http://localhost:8080/api/v1/health

### Creating Content

1. Open Admin Panel at `/admin`
2. Select the content type (Slider, Kegiatan, Peraturan, Program)
3. Fill in the form and upload files
4. Set status to "Published" to make it live
5. Preview before publishing

### File Uploads

Files are stored in:
- Images: `mini-services/api-service/uploads/images/`
- PDFs: `mini-services/api-service/uploads/pdfs/`
- Videos: `mini-services/api-service/uploads/videos/`

Accessed via: `http://localhost:8080/uploads/{type}/{filename}`

## 🧪 Testing

### Test Golang API
```bash
# Health check
curl http://localhost:8080/api/v1/health

# Get sliders
curl http://localhost:8080/api/v1/sliders
```

### Test Frontend
```bash
# Open in browser
open http://localhost:3000
```

## 🐛 Troubleshooting

### Golang API won't start
- Check MySQL is running: `mysql -u root -p`
- Verify database credentials in .env
- Check if port 8080 is in use
- View logs for errors

### Frontend can't connect to API
- Verify Golang API is running
- Check NEXT_PUBLIC_API_URL in .env
- Check CORS configuration in Golang
- Check network/firewall settings

### File upload fails
- Verify uploads directory permissions
- Check disk space
- Verify file type and size limits
- Check Golang logs

### Database connection fails
- Verify MySQL is running
- Check credentials
- Test connection: `mysql -h localhost -u root -p korpri_bmkg`

## 📈 Monitoring

### Golang API Logs
```
[INFO] Database connected successfully
[INFO] 🚀 Server starting on :8080
[INFO] GET /api/v1/sliders 200 2.3ms
```

### MySQL Slow Query Log
Enable in `my.cnf`:
```ini
slow_query_log = 1
long_query_time = 2
```

## 🔄 Migration from Prisma/SQLite

If migrating from the old setup:

1. Export data from SQLite
2. Import to MySQL using schema.sql
3. Start Golang API service
4. Update NEXT_PUBLIC_API_URL in Next.js .env
5. Remove old Prisma files (optional)

## 📚 Documentation

- [Golang API README](mini-services/api-service/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Gin Framework](https://gin-gonic.com/docs/)
- [GORM Documentation](https://gorm.io/docs/)

## 📄 License

© 2024 KORPRI BMKG. All rights reserved.
