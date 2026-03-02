package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"

	"korpri-bmkg-api/internal/config"
	"korpri-bmkg-api/internal/routes"
)

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Printf("Warning: Failed to load config: %v", err)
	}

	// Initialize database
	if err := config.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Get port from environment or use default
	port := config.GetEnv("API_PORT", "8080")
	gin.SetMode(config.GetEnv("GIN_MODE", "release"))

	// Create Gin router
	r := gin.Default()

	// Setup routes
	routes.SetupRoutes(r, config.DB)

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	// Start server
	addr := ":" + port
	log.Printf("🚀 Server starting on %s", addr)
	log.Printf("📁 Serving uploads from ./uploads")
	log.Printf("🔌 API endpoints available at http://localhost%s/api/v1", addr)

	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
		os.Exit(1)
	}
}
