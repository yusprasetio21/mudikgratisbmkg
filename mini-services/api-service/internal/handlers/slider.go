package handlers

import (
        "net/http"

        "github.com/gin-gonic/gin"
        "github.com/google/uuid"
        "gorm.io/gorm"

        "korpri-bmkg-api/internal/models"
        "korpri-bmkg-api/internal/utils"
)

type SliderHandler struct {
        DB *gorm.DB
}

func NewSliderHandler(db *gorm.DB) *SliderHandler {
        return &SliderHandler{DB: db}
}

// GetSliders retrieves all sliders with optional filters
func (h *SliderHandler) GetSliders(c *gin.Context) {
        var sliders []models.Slider
        query := h.DB.Model(&models.Slider{})

        // Filter by status
        if status := c.Query("status"); status != "" {
                query = query.Where("status = ?", status)
        }

        // Filter by category
        if category := c.Query("category"); category != "" {
                query = query.Where("category = ?", category)
        }

        // Order by display_order
        if err := query.Order("display_order ASC").Find(&sliders).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch sliders")
                return
        }

        utils.SendSuccess(c, http.StatusOK, sliders, "Sliders retrieved successfully")
}

// GetSlider retrieves a single slider by ID
func (h *SliderHandler) GetSlider(c *gin.Context) {
        id := c.Param("id")

        var slider models.Slider
        if err := h.DB.First(&slider, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Slider not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch slider")
                return
        }

        utils.SendSuccess(c, http.StatusOK, slider, "Slider retrieved successfully")
}

// CreateSlider creates a new slider
func (h *SliderHandler) CreateSlider(c *gin.Context) {
        var slider models.Slider

        if !utils.BindJSON(c, &slider) {
                return
        }

        // Generate ID
        if slider.ID == "" {
                slider.ID = uuid.New().String()
        }

        // Validate required fields
        if slider.Title == "" || slider.Highlight == "" || slider.Description == "" {
                utils.SendError(c, http.StatusBadRequest, nil, "Missing required fields: title, highlight, and description are required")
                return
        }

        // Set defaults
        if slider.Category == "" {
                slider.Category = "info"
        }
        if slider.Status == "" {
                slider.Status = "draft"
        }
        if slider.DisplayOrder == 0 {
                slider.DisplayOrder = 0
        }

        if err := h.DB.Create(&slider).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create slider")
                return
        }

        utils.SendSuccess(c, http.StatusCreated, slider, "Slider created successfully")
}

// UpdateSlider updates an existing slider
func (h *SliderHandler) UpdateSlider(c *gin.Context) {
        id := c.Param("id")

        var existingSlider models.Slider
        if err := h.DB.First(&existingSlider, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Slider not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch slider")
                return
        }

        var updateData models.Slider
        if !utils.BindJSON(c, &updateData) {
                return
        }

        // Update only provided fields
        updates := map[string]interface{}{}
        if updateData.Category != "" {
                updates["category"] = updateData.Category
        }
        if updateData.Title != "" {
                updates["title"] = updateData.Title
        }
        if updateData.Highlight != "" {
                updates["highlight"] = updateData.Highlight
        }
        if updateData.Description != "" {
                updates["description"] = updateData.Description
        }
        if updateData.ButtonLabel != "" {
                updates["button_label"] = updateData.ButtonLabel
        }
        if updateData.ButtonURL != "" {
                updates["button_url"] = updateData.ButtonURL
        }
        if updateData.CardTitle != "" {
                updates["card_title"] = updateData.CardTitle
        }
        if updateData.CardDesc != "" {
                updates["card_desc"] = updateData.CardDesc
        }
        if updateData.CardTag != "" {
                updates["card_tag"] = updateData.CardTag
        }
        if updateData.CardLink != "" {
                updates["card_link"] = updateData.CardLink
        }
        if updateData.ImageURL != "" {
                updates["image_url"] = updateData.ImageURL
        }
        if updateData.ImagePath != "" {
                updates["image_path"] = updateData.ImagePath
        }
        if updateData.ImageOverlay != "" {
                updates["image_overlay"] = updateData.ImageOverlay
        }
        if updateData.Label != "" {
                updates["label"] = updateData.Label
        }
        if updateData.LabelIcon != "" {
                updates["label_icon"] = updateData.LabelIcon
        }
        if updateData.DisplayOrder != 0 {
                updates["display_order"] = updateData.DisplayOrder
        }
        if updateData.Status != "" {
                updates["status"] = updateData.Status
        }

        if err := h.DB.Model(&existingSlider).Updates(updates).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update slider")
                return
        }

        // Fetch updated slider
        if err := h.DB.First(&existingSlider, "id = ?", id).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch updated slider")
                return
        }

        utils.SendSuccess(c, http.StatusOK, existingSlider, "Slider updated successfully")
}

// DeleteSlider deletes a slider
func (h *SliderHandler) DeleteSlider(c *gin.Context) {
        id := c.Param("id")

        var slider models.Slider
        if err := h.DB.First(&slider, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Slider not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch slider")
                return
        }

        // Delete associated file if exists
        if slider.ImagePath != "" {
                utils.DeleteFile(slider.ImagePath)
        }

        if err := h.DB.Delete(&slider).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to delete slider")
                return
        }

        utils.SendSuccess(c, http.StatusOK, nil, "Slider deleted successfully")
}

// UpdateSliderStatus updates slider status
func (h *SliderHandler) UpdateSliderStatus(c *gin.Context) {
        id := c.Param("id")

        var req struct {
                Status string `json:"status" binding:"required"`
        }

        if !utils.BindJSON(c, &req) {
                return
        }

        // Validate status
        if req.Status != "draft" && req.Status != "published" {
                utils.SendError(c, http.StatusBadRequest, nil, "Invalid status. Must be 'draft' or 'published'")
                return
        }

        if err := h.DB.Model(&models.Slider{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update slider status")
                return
        }

        utils.SendSuccess(c, http.StatusOK, nil, "Slider status updated successfully")
}

// UploadSliderImage handles image upload for sliders
func (h *SliderHandler) UploadSliderImage(c *gin.Context) {
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
