package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response is a standard API response structure
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// SendSuccess sends a successful response
func SendSuccess(c *gin.Context, statusCode int, data interface{}, message string) {
	response := Response{
		Success: true,
		Data:    data,
		Message: message,
	}
	c.JSON(statusCode, response)
}

// SendError sends an error response
func SendError(c *gin.Context, statusCode int, err error, message string) {
	response := Response{
		Success: false,
		Error:   message,
	}
	if err != nil {
		response.Error = err.Error()
	}
	c.JSON(statusCode, response)
}

// BindJSON binds JSON from request and handles errors
func BindJSON(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		SendError(c, http.StatusBadRequest, err, "Invalid request body")
		return false
	}
	return true
}
