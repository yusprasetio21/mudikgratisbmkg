# KORPRI BMKG API Service

High-performance REST API built with Golang and MySQL for KORPRI BMKG website.

## Features

- ⚡ **High Performance**: Built with Golang and Gin framework
- 🔒 **Secure**: CORS, security headers, rate limiting
- 📁 **File Upload**: Support for images, PDFs, and videos
- 🗄️ **MySQL Database**: Scalable and production-ready
- 🚀 **RESTful API**: Clean and standardized endpoints

## Prerequisites

- Go 1.21 or higher
- MySQL 8.0 or higher
- Make or bun for running commands

## Installation

1. **Clone and navigate to the API service:**
   ```bash
   cd mini-services/api-service
   ```

2. **Install dependencies:**
   ```bash
   go mod download
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Create database and run schema:**
   ```bash
   mysql -u root -p < schema.sql
   ```

## Running the Server

### Development mode:
```bash
go run cmd/api/main.go
```

### Production build:
```bash
go build -o api-service cmd/api/main.go
./api-service
```

### Using bun:
```bash
bun run dev
```

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

### Health Check
- `GET /api/v1/health` - Check API status

### File Upload
- `POST /api/v1/upload` - Upload files (image, pdf, video)

### Sliders
- `GET /api/v1/sliders` - Get all sliders
- `POST /api/v1/sliders` - Create slider
- `GET /api/v1/sliders/:id` - Get slider by ID
- `PUT /api/v1/sliders/:id` - Update slider
- `DELETE /api/v1/sliders/:id` - Delete slider
- `PATCH /api/v1/sliders/:id/status` - Update slider status

### Kegiatan (Activities)
- `GET /api/v1/kegiatan` - Get all activities
- `POST /api/v1/kegiatan` - Create activity
- `GET /api/v1/kegiatan/:id` - Get activity by ID
- `PUT /api/v1/kegiatan/:id` - Update activity
- `DELETE /api/v1/kegiatan/:id` - Delete activity

### Peraturan (Regulations)
- `GET /api/v1/peraturan` - Get all regulations
- `POST /api/v1/peraturan` - Create regulation
- `GET /api/v1/peraturan/:id` - Get regulation by ID
- `PUT /api/v1/peraturan/:id` - Update regulation
- `DELETE /api/v1/peraturan/:id` - Delete regulation

### Programs
- `GET /api/v1/programs` - Get all programs
- `POST /api/v1/programs` - Create program
- `GET /api/v1/programs/:id` - Get program by ID
- `GET /api/v1/programs/slug/:slug` - Get program by slug
- `PUT /api/v1/programs/:id` - Update program
- `DELETE /api/v1/programs/:id` - Delete program

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_PORT` | MySQL port | 3306 |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | korpri_bmkg |
| `API_PORT` | API server port | 8080 |
| `GIN_MODE` | Gin mode (debug/release) | release |

## Project Structure

```
.
├── cmd/
│   └── api/
│       └── main.go          # Application entry point
├── internal/
│   ├── config/              # Configuration
│   ├── handlers/            # API handlers
│   ├── middleware/          # Middleware (CORS, security)
│   ├── models/              # Data models
│   ├── routes/              # Route definitions
│   └── utils/               # Utility functions
├── uploads/                 # Uploaded files
│   ├── images/
│   ├── pdfs/
│   └── videos/
├── schema.sql               # Database schema
├── go.mod                   # Go modules
├── go.sum                   # Go dependencies
├── .env                     # Environment variables
└── README.md
```

## Security Features

- ✅ CORS configuration
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Content-Type validation
- ✅ SQL injection prevention (GORM)
- ✅ File type validation
- ✅ File size limits
- ✅ Rate limiting (placeholder - implement in production)

## Performance Features

- ✅ Connection pooling (10 idle, 100 max)
- ✅ Efficient GORM queries
- ✅ Optimistic concurrency control
- ✅ Binary protocol (MySQL)
- ✅ Low memory footprint

## Development

### Run with auto-reload:
```bash
go install github.com/cosmtrek/air@latest
air
```

### Build for different platforms:
```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o api-service-linux cmd/api/main.go

# Windows
GOOS=windows GOARCH=amd64 go build -o api-service.exe cmd/api/main.go

# macOS
GOOS=darwin GOARCH=amd64 go build -o api-service-mac cmd/api/main.go
```

## Deployment

### Using Docker (Recommended):
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 go build -o api-service cmd/api/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/api-service .
COPY --from=builder /app/uploads ./uploads
EXPOSE 8080
CMD ["./api-service"]
```

### Using systemd:
Create `/etc/systemd/system/korpri-api.service`:
```ini
[Unit]
Description=KORPRI BMKG API Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/api-service
ExecStart=/path/to/api-service/api-service
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Monitoring

### Enable GORM debug mode:
```go
DB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
    Logger: logger.Default.LogMode(logger.Info),
})
```

### Log format:
```
[INFO] GET /api/v1/sliders 200 2.3ms
[INFO] POST /api/v1/kegiatan 201 15.7ms
```

## Troubleshooting

### Connection refused:
- Check MySQL is running: `systemctl status mysql`
- Verify credentials in .env
- Check firewall settings

### File upload fails:
- Verify uploads directory permissions
- Check disk space
- Verify file size limits

### High memory usage:
- Adjust connection pool size
- Enable slow query log
- Consider adding Redis for caching

## License

© 2024 KORPRI BMKG. All rights reserved.
