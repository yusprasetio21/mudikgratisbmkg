package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// SecurityMiddleware adds security headers
func SecurityMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent clickjacking
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

		// Content Security Policy
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;")

		// Remove server info
		c.Header("Server", "")

		c.Next()
	}
}

// RateLimiter middleware (basic implementation)
// In production, use a proper rate limiting library like github.com/ulule/limiter
func RateLimiter() gin.HandlerFunc {
	// This is a placeholder - implement proper rate limiting in production
	return func(c *gin.Context) {
		// TODO: Implement rate limiting
		// For now, just pass through
		c.Next()
	}
}

// ValidateContentType validates content type for POST/PUT/PATCH requests
func ValidateContentType() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
			contentType := c.GetHeader("Content-Type")
			if !strings.Contains(contentType, "application/json") && !strings.Contains(contentType, "multipart/form-data") {
				c.JSON(415, gin.H{"error": "Unsupported Media Type"})
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
