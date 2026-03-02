package handlers

import (
        "encoding/json"
        "net/http"
        "time"

        "github.com/gin-gonic/gin"
        "github.com/google/uuid"
        "gorm.io/gorm"

        "korpri-bmkg-api/internal/models"
        "korpri-bmkg-api/internal/utils"
)

type KegiatanHandler struct {
        DB *gorm.DB
}

func NewKegiatanHandler(db *gorm.DB) *KegiatanHandler {
        return &KegiatanHandler{DB: db}
}

// GetKegiatan retrieves all activities with optional filters
func (h *KegiatanHandler) GetKegiatan(c *gin.Context) {
        var kegiatan []models.Kegiatan
        query := h.DB.Model(&models.Kegiatan{})

        // Filter by status
        if status := c.Query("status"); status != "" {
                query = query.Where("status = ?", status)
        }

        // Filter by category
        if category := c.Query("category"); category != "" {
                query = query.Where("category = ?", category)
        }

        // Order by display_order
        if err := query.Order("display_order ASC").Find(&kegiatan).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch kegiatan")
                return
        }

        // Parse JSON images for each kegiatan
        for i := range kegiatan {
                if kegiatan[i].Images != "" {
                        var images []string
                        if err := json.Unmarshal([]byte(kegiatan[i].Images), &images); err == nil {
                                kegiatan[i].Images = ""
                                // We'll handle this in the response
                        }
                }
        }

        utils.SendSuccess(c, http.StatusOK, kegiatan, "Kegiatan retrieved successfully")
}

// GetKegiatanByID retrieves a single activity by ID
func (h *KegiatanHandler) GetKegiatanByID(c *gin.Context) {
        id := c.Param("id")

        var kegiatan models.Kegiatan
        if err := h.DB.First(&kegiatan, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Kegiatan not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch kegiatan")
                return
        }

        utils.SendSuccess(c, http.StatusOK, kegiatan, "Kegiatan retrieved successfully")
}

// CreateKegiatan creates a new activity
func (h *KegiatanHandler) CreateKegiatan(c *gin.Context) {
        var req struct {
                Title       string   `json:"title" binding:"required"`
                Description string   `json:"description" binding:"required"`
                Category    string   `json:"category"`
                Date        string   `json:"date"`
                Location    string   `json:"location"`
                Images      []string `json:"images"`
                VideoURL    string   `json:"videoUrl"`
                Order       int      `json:"order"`
                Status      string   `json:"status"`
        }

        if !utils.BindJSON(c, &req) {
                return
        }

        // Generate ID
        id := uuid.New().String()

        // Parse date
        var eventDate *time.Time
        if req.Date != "" {
                parsedDate, err := time.Parse("2006-01-02", req.Date)
                if err == nil {
                        eventDate = &parsedDate
                }
        }

        // Convert images to JSON
        imagesJSON := ""
        if len(req.Images) > 0 {
                jsonData, err := json.Marshal(req.Images)
                if err == nil {
                        imagesJSON = string(jsonData)
                }
        }

        kegiatan := models.Kegiatan{
                ID:          id,
                Title:       req.Title,
                Description: req.Description,
                Category:    req.Category,
                EventDate:   eventDate,
                Location:    req.Location,
                Images:      imagesJSON,
                VideoURL:    req.VideoURL,
                DisplayOrder: req.Order,
                Status:      req.Status,
        }

        // Set defaults
        if kegiatan.Category == "" {
                kegiatan.Category = "olahraga"
        }
        if kegiatan.Status == "" {
                kegiatan.Status = "draft"
        }

        if err := h.DB.Create(&kegiatan).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create kegiatan")
                return
        }

        utils.SendSuccess(c, http.StatusCreated, kegiatan, "Kegiatan created successfully")
}

// UpdateKegiatan updates an existing activity
func (h *KegiatanHandler) UpdateKegiatan(c *gin.Context) {
        id := c.Param("id")

        var existingKegiatan models.Kegiatan
        if err := h.DB.First(&existingKegiatan, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Kegiatan not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch kegiatan")
                return
        }

        var req struct {
                Title       string   `json:"title"`
                Description string   `json:"description"`
                Category    string   `json:"category"`
                Date        string   `json:"date"`
                Location    string   `json:"location"`
                Images      []string `json:"images"`
                VideoURL    string   `json:"videoUrl"`
                Order       int      `json:"order"`
                Status      string   `json:"status"`
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
        if req.Location != "" {
                updates["location"] = req.Location
        }
        if req.VideoURL != "" {
                updates["video_url"] = req.VideoURL
        }
        if req.Order != 0 {
                updates["display_order"] = req.Order
        }
        if req.Status != "" {
                updates["status"] = req.Status
        }

        // Handle date
        if req.Date != "" {
                parsedDate, err := time.Parse("2006-01-02", req.Date)
                if err == nil {
                        updates["event_date"] = parsedDate
                }
        }

        // Handle images
        if req.Images != nil {
                jsonData, err := json.Marshal(req.Images)
                if err == nil {
                        updates["images"] = string(jsonData)
                }
        }

        if err := h.DB.Model(&existingKegiatan).Updates(updates).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update kegiatan")
                return
        }

        // Fetch updated kegiatan
        if err := h.DB.First(&existingKegiatan, "id = ?", id).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch updated kegiatan")
                return
        }

        utils.SendSuccess(c, http.StatusOK, existingKegiatan, "Kegiatan updated successfully")
}

// DeleteKegiatan deletes an activity
func (h *KegiatanHandler) DeleteKegiatan(c *gin.Context) {
        id := c.Param("id")

        var kegiatan models.Kegiatan
        if err := h.DB.First(&kegiatan, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Kegiatan not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch kegiatan")
                return
        }

        // Delete associated images if exists
        if kegiatan.Images != "" {
                var images []string
                if err := json.Unmarshal([]byte(kegiatan.Images), &images); err == nil {
                        for _, imagePath := range images {
                                utils.DeleteFile(imagePath)
                        }
                }
        }

        if err := h.DB.Delete(&kegiatan).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to delete kegiatan")
                return
        }

        utils.SendSuccess(c, http.StatusOK, nil, "Kegiatan deleted successfully")
}

// UploadKegiatanImage handles image upload for activities
func (h *KegiatanHandler) UploadKegiatanImage(c *gin.Context) {
        file, err := c.FormFile("file")
        if err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Failed to get file from request")
                return
        }

        result := utils.UploadFile(file, "image")
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

        utils.SendSuccess(c, http.StatusOK, response, "Image uploaded successfully")
}
