#!/bin/bash

# KORPRI BMKG API - Start Script

echo "🚀 Starting KORPRI BMKG API Service..."

cd "$(dirname "$0")"

# Check if go.mod exists
if [ ! -f "go.mod" ]; then
    echo "❌ Error: go.mod not found. Please run this script from the api-service directory."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
    cp .env.example .env 2>/dev/null || echo "# Using environment variables" > .env
fi

# Check for required directories
mkdir -p uploads/images uploads/pdfs uploads/videos

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -f "go.sum" ]; then
    echo "📦 Installing Go dependencies..."
    go mod download
fi

# Get port from .env or use default
PORT=$(grep API_PORT .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
if [ -z "$PORT" ]; then
    PORT="8080"
fi

echo "✅ Configuration loaded"
echo "🌐 API will run on: http://localhost:$PORT"
echo "📁 Uploads directory: ./uploads"
echo ""
echo "Starting API server..."
echo "─────────────────────────────────────────"

# Run the server
go run cmd/api/main.go
