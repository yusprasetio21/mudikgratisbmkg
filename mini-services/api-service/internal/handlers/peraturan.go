package handlers

import (
        "net/http"
        "time"

        "github.com/gin-gonic/gin"
        "github.com/google/uuid"
        "gorm.io/gorm"

        "korpri-bmkg-api/internal/models"
        "korpri-bmkg-api/internal/utils"
)

type PeraturanHandler struct {
        DB *gorm.DB
}

func NewPeraturanHandler(db *gorm.DB) *PeraturanHandler {
        return &PeraturanHandler{DB: db}
}

// GetPeraturan retrieves all regulations with optional filters
func (h *PeraturanHandler) GetPeraturan(c *gin.Context) {
        var peraturan []models.Peraturan
        query := h.DB.Model(&models.Peraturan{})

        // Filter by status
        if status := c.Query("status"); status != "" {
                query = query.Where("status = ?", status)
        }

        // Filter by category
        if category := c.Query("category"); category != "" {
                query = query.Where("category = ?", category)
        }

        // Order by display_order
        if err := query.Order("display_order ASC").Find(&peraturan).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch peraturan")
                return
        }

        utils.SendSuccess(c, http.StatusOK, peraturan, "Peraturan retrieved successfully")
}

// GetPeraturanByID retrieves a single regulation by ID
func (h *PeraturanHandler) GetPeraturanByID(c *gin.Context) {
        id := c.Param("id")

        var peraturan models.Peraturan
        if err := h.DB.First(&peraturan, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Peraturan not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch peraturan")
                return
        }

        utils.SendSuccess(c, http.StatusOK, peraturan, "Peraturan retrieved successfully")
}

// CreatePeraturan creates a new regulation
func (h *PeraturanHandler) CreatePeraturan(c *gin.Context) {
        var req struct {
                Title       string `json:"title" binding:"required"`
                Description string `json:"description"`
                Category    string `json:"category"`
                PDFPath     string `json:"pdfPath" binding:"required"`
                PDFURL      string `json:"pdfUrl"`
                PublishDate string `json:"publishDate"`
                Order       int    `json:"order"`
                Status      string `json:"status"`
        }

        if !utils.BindJSON(c, &req) {
                return
        }

        // Generate ID
        id := uuid.New().String()

        // Parse publish date
        var publishDate *time.Time
        if req.PublishDate != "" {
                parsedDate, err := time.Parse("2006-01-02", req.PublishDate)
                if err == nil {
                        publishDate = &parsedDate
                }
        }

        peraturan := models.Peraturan{
                ID:          id,
                Title:       req.Title,
                Description: req.Description,
                Category:    req.Category,
                PDFPath:     req.PDFPath,
                PDFURL:      req.PDFURL,
                PublishDate: publishDate,
                DisplayOrder: req.Order,
                Status:      req.Status,
        }

        // Set defaults
        if peraturan.Category == "" {
                peraturan.Category = "kepala"
        }
        if peraturan.Status == "" {
                peraturan.Status = "draft"
        }

        if err := h.DB.Create(&peraturan).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create peraturan")
                return
        }

        utils.SendSuccess(c, http.StatusCreated, peraturan, "Peraturan created successfully")
}

// UpdatePeraturan updates an existing regulation
func (h *PeraturanHandler) UpdatePeraturan(c *gin.Context) {
        id := c.Param("id")

        var existingPeraturan models.Peraturan
        if err := h.DB.First(&existingPeraturan, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Peraturan not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch peraturan")
                return
        }

        var req struct {
                Title       string `json:"title"`
                Description string `json:"description"`
                Category    string `json:"category"`
                PDFPath     string `json:"pdfPath"`
                PDFURL      string `json:"pdfUrl"`
                PublishDate string `json:"publishDate"`
                Order       int    `json:"order"`
                Status      string `json:"status"`
        }

        if !utils.BindJSON(c, &req) {
                return
        }

        // Build updates map
        updates := map[string]interface{}{}
        if req.Title != "" {
                updates["title"] = req.Title
        }
        if req.Description != "" {
                updates["description"] = req.Description
        }
        if req.Category != "" {
                updates["category"] = req.Category
        }
        if req.PDFPath != "" {
                // Delete old PDF if exists
                if existingPeraturan.PDFPath != "" && existingPeraturan.PDFPath != req.PDFPath {
                        utils.DeleteFile(existingPeraturan.PDFPath)
                }
                updates["pdf_path"] = req.PDFPath
        }
        if req.PDFURL != "" {
                updates["pdf_url"] = req.PDFURL
        }
        if req.Order != 0 {
                updates["display_order"] = req.Order
        }
        if req.Status != "" {
                updates["status"] = req.Status
        }

        // Handle publish date
        if req.PublishDate != "" {
                parsedDate, err := time.Parse("2006-01-02", req.PublishDate)
                if err == nil {
                        updates["publish_date"] = parsedDate
                }
        }

        if err := h.DB.Model(&existingPeraturan).Updates(updates).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update peraturan")
                return
        }

        // Fetch updated peraturan
        if err := h.DB.First(&existingPeraturan, "id = ?", id).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch updated peraturan")
                return
        }

        utils.SendSuccess(c, http.StatusOK, existingPeraturan, "Peraturan updated successfully")
}

// DeletePeraturan deletes a regulation
func (h *PeraturanHandler) DeletePeraturan(c *gin.Context) {
        id := c.Param("id")

        var peraturan models.Peraturan
        if err := h.DB.First(&peraturan, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Peraturan not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch peraturan")
                return
        }

        // Delete associated PDF file
        if peraturan.PDFPath != "" {
                utils.DeleteFile(peraturan.PDFPath)
        }

        if err := h.DB.Delete(&peraturan).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to delete peraturan")
                return
        }

        utils.SendSuccess(c, http.StatusOK, nil, "Peraturan deleted successfully")
}

// UploadPeraturanPDF handles PDF upload for regulations
func (h *PeraturanHandler) UploadPeraturanPDF(c *gin.Context) {
        file, err := c.FormFile("file")
        if err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Failed to get file from request")
                return
        }

        result := utils.UploadFile(file, "pdf")
        if !result.Success {
                utils.SendError(c, http.StatusBadRequest, nil, result.Error)
                return
        }

        // Return full URL that can be accessed from frontend
        baseURL := utils.GetBaseURL()
        fullURL := baseURL + result.URL

        response := map[string]interface{}{
                "success":      true,
                "url":          fullURL,
                "path":         result.Path,
                "filename":     result.Filename,
                "originalName": result.OriginalName,
                "size":         result.Size,
        }

        utils.SendSuccess(c, http.StatusOK, response, "PDF uploaded successfully")
}
