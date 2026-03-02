package utils

import (
        "fmt"
        "io"
        "mime/multipart"
        "os"
        "path/filepath"
        "strings"
        "time"
)

const (
        MaxImageSize    = 5 * 1024 * 1024  // 5MB
        MaxPDFSize      = 10 * 1024 * 1024 // 10MB
        MaxVideoSize    = 5 * 1024 * 1024  // 5MB
        UploadBasePath  = "./uploads"
        ImagesPath      = UploadBasePath + "/images"
        PDFsPath        = UploadBasePath + "/pdfs"
        VideosPath      = UploadBasePath + "/videos"
)

// Allowed file types
var (
        AllowedImageTypes = map[string]bool{
                "image/jpeg": true,
                "image/jpg":  true,
                "image/png":  true,
                "image/webp": true,
        }
        AllowedPDFTypes = map[string]bool{
                "application/pdf": true,
        }
        AllowedVideoTypes = map[string]bool{
                "video/mp4":  true,
                "video/webm": true,
                "video/ogg":  true,
        }
)

// FileUploadResult contains upload result information
type FileUploadResult struct {
        URL          string
        Path         string
        Filename     string
        OriginalName string
        Size         int64
        Success      bool
        Error        string
}

// GetBaseURL returns the base URL for the API (for generating full URLs)
func GetBaseURL() string {
        // Get from environment or use default
        host := os.Getenv("API_HOST")
        port := os.Getenv("API_PORT")
        
        if host == "" {
                host = "localhost"
        }
        if port == "" {
                port = "8080"
        }
        
        return fmt.Sprintf("http://%s:%s", host, port)
}

// UploadFile handles file upload
func UploadFile(file *multipart.FileHeader, fileType string) FileUploadResult {
        // Validate file type
        contentType := file.Header.Get("Content-Type")
        var allowedTypes map[string]bool
        var maxSize int64
        var uploadPath string

        switch fileType {
        case "image":
                allowedTypes = AllowedImageTypes
                maxSize = MaxImageSize
                uploadPath = ImagesPath
        case "pdf":
                allowedTypes = AllowedPDFTypes
                maxSize = MaxPDFSize
                uploadPath = PDFsPath
        case "video":
                allowedTypes = AllowedVideoTypes
                maxSize = MaxVideoSize
                uploadPath = VideosPath
        default:
                return FileUploadResult{
                        Success: false,
                        Error:   "Invalid file type specified",
                }
        }

        // Check if content type is allowed
        if !allowedTypes[contentType] {
                return FileUploadResult{
                        Success: false,
                        Error:   fmt.Sprintf("Invalid content type: %s", contentType),
                }
        }

        // Check file size
        if file.Size > maxSize {
                return FileUploadResult{
                        Success: false,
                        Error:   fmt.Sprintf("File size exceeds limit of %d bytes", maxSize),
                }
        }

        // Generate unique filename
        timestamp := time.Now().UnixNano()
        ext := filepath.Ext(file.Filename)
        filename := fmt.Sprintf("%d-%s%s", timestamp, randomString(8), ext)

        // Ensure upload directory exists
        if err := os.MkdirAll(uploadPath, 0755); err != nil {
                return FileUploadResult{
                        Success: false,
                        Error:   fmt.Sprintf("Failed to create upload directory: %v", err),
                }
        }

        // Create file
        filePath := filepath.Join(uploadPath, filename)
        dst, err := os.Create(filePath)
        if err != nil {
                return FileUploadResult{
                        Success: false,
                        Error:   fmt.Sprintf("Failed to create file: %v", err),
                }
        }
        defer dst.Close()

        // Open uploaded file
        src, err := file.Open()
        if err != nil {
                return FileUploadResult{
                        Success: false,
                        Error:   fmt.Sprintf("Failed to open uploaded file: %v", err),
                }
        }
        defer src.Close()

        // Copy file
        if _, err := io.Copy(dst, src); err != nil {
                return FileUploadResult{
                        Success: false,
                        Error:   fmt.Sprintf("Failed to save file: %v", err),
                }
        }

        // Generate URL
        url := fmt.Sprintf("/uploads/%s/%s", strings.TrimPrefix(uploadPath, UploadBasePath), filename)

        return FileUploadResult{
                Success:      true,
                URL:          url,
                Path:         filePath,
                Filename:     filename,
                OriginalName: file.Filename,
                Size:         file.Size,
        }
}

// DeleteFile removes a file from the filesystem
func DeleteFile(filePath string) error {
        if filePath == "" {
                return nil
        }

        // Security check: only allow deleting files in uploads directory
        if !strings.HasPrefix(filePath, UploadBasePath) {
                return fmt.Errorf("invalid file path")
        }

        return os.Remove(filePath)
}

// randomString generates a random string of given length
func randomString(length int) string {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        b := make([]byte, length)
        for i := range b {
                b[i] = charset[int(time.Now().UnixNano())%len(charset)]
        }
        return string(b)
}
