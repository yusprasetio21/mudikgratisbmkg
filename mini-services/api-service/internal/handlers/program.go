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

type ProgramHandler struct {
        DB *gorm.DB
}

func NewProgramHandler(db *gorm.DB) *ProgramHandler {
        return &ProgramHandler{DB: db}
}

// GetPrograms retrieves all programs with optional filters
func (h *ProgramHandler) GetPrograms(c *gin.Context) {
        var programs []models.Program
        query := h.DB.Model(&models.Program{})

        // Filter by status
        if status := c.Query("status"); status != "" {
                query = query.Where("status = ?", status)
        }

        // Filter by category
        if category := c.Query("category"); category != "" {
                query = query.Where("category = ?", category)
        }

        // Order by display_order
        if err := query.Order("display_order ASC").Find(&programs).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch programs")
                return
        }

        utils.SendSuccess(c, http.StatusOK, programs, "Programs retrieved successfully")
}

// GetProgramByID retrieves a single program by ID
func (h *ProgramHandler) GetProgramByID(c *gin.Context) {
        id := c.Param("id")

        var program models.Program
        if err := h.DB.First(&program, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Program not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch program")
                return
        }

        utils.SendSuccess(c, http.StatusOK, program, "Program retrieved successfully")
}

// GetProgramBySlug retrieves a single program by slug
func (h *ProgramHandler) GetProgramBySlug(c *gin.Context) {
        slug := c.Param("slug")

        var program models.Program
        if err := h.DB.Where("slug = ?", slug).First(&program).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Program not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch program")
                return
        }

        utils.SendSuccess(c, http.StatusOK, program, "Program retrieved successfully")
}

// CreateProgram creates a new program
func (h *ProgramHandler) CreateProgram(c *gin.Context) {
        var req struct {
                Slug             string `json:"slug" binding:"required"`
                Title            string `json:"title" binding:"required"`
                Description      string `json:"description" binding:"required"`
                Category         string `json:"category"`
                ImageURL         string `json:"imageUrl"`
                ImagePath        string `json:"imagePath"`
                Content          string `json:"content"`
                StartDate        string `json:"startDate"`
                EndDate          string `json:"endDate"`
                RegistrationLink string `json:"registrationLink"`
                Order            int    `json:"order"`
                Status           string `json:"status"`
        }

        if !utils.BindJSON(c, &req) {
                return
        }

        // Check if slug already exists
        var count int64
        if err := h.DB.Model(&models.Program{}).Where("slug = ?", req.Slug).Count(&count).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to check slug")
                return
        }
        if count > 0 {
                utils.SendError(c, http.StatusConflict, nil, "Slug already exists")
                return
        }

        // Generate ID
        id := uuid.New().String()

        // Parse dates
        var startDate, endDate *time.Time
        if req.StartDate != "" {
                parsedDate, err := time.Parse("2006-01-02", req.StartDate)
                if err == nil {
                        startDate = &parsedDate
                }
        }
        if req.EndDate != "" {
                parsedDate, err := time.Parse("2006-01-02", req.EndDate)
                if err == nil {
                        endDate = &parsedDate
                }
        }

        program := models.Program{
                ID:               id,
                Slug:             req.Slug,
                Title:            req.Title,
                Description:      req.Description,
                Category:         req.Category,
                ImageURL:         req.ImageURL,
                ImagePath:        req.ImagePath,
                Content:          req.Content,
                StartDate:        startDate,
                EndDate:          endDate,
                RegistrationLink: req.RegistrationLink,
                DisplayOrder:     req.Order,
                Status:           req.Status,
        }

        // Set defaults
        if program.Category == "" {
                program.Category = "kesejahteraan"
        }
        if program.Status == "" {
                program.Status = "draft"
        }

        if err := h.DB.Create(&program).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create program")
                return
        }

        utils.SendSuccess(c, http.StatusCreated, program, "Program created successfully")
}

// UpdateProgram updates an existing program
func (h *ProgramHandler) UpdateProgram(c *gin.Context) {
        id := c.Param("id")

        var existingProgram models.Program
        if err := h.DB.First(&existingProgram, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Program not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch program")
                return
        }

        var req struct {
                Slug             string `json:"slug"`
                Title            string `json:"title"`
                Description      string `json:"description"`
                Category         string `json:"category"`
                ImageURL         string `json:"imageUrl"`
                ImagePath        string `json:"imagePath"`
                Content          string `json:"content"`
                StartDate        string `json:"startDate"`
                EndDate          string `json:"endDate"`
                RegistrationLink string `json:"registrationLink"`
                Order            int    `json:"order"`
                Status           string `json:"status"`
        }

        if !utils.BindJSON(c, &req) {
                return
        }

        // Build updates map
        updates := map[string]interface{}{}
        if req.Slug != "" {
                // Check if new slug already exists (and not the same as current)
                if req.Slug != existingProgram.Slug {
                        var count int64
                        if err := h.DB.Model(&models.Program{}).Where("slug = ? AND id != ?", req.Slug, id).Count(&count).Error; err != nil {
                                utils.SendError(c, http.StatusInternalServerError, err, "Failed to check slug")
                                return
                        }
                        if count > 0 {
                                utils.SendError(c, http.StatusConflict, nil, "Slug already exists")
                                return
                        }
                        updates["slug"] = req.Slug
                }
        }
        if req.Title != "" {
                updates["title"] = req.Title
        }
        if req.Description != "" {
                updates["description"] = req.Description
        }
        if req.Category != "" {
                updates["category"] = req.Category
        }
        if req.ImageURL != "" {
                updates["image_url"] = req.ImageURL
        }
        if req.ImagePath != "" {
                // Delete old image if exists
                if existingProgram.ImagePath != "" && existingProgram.ImagePath != req.ImagePath {
                        utils.DeleteFile(existingProgram.ImagePath)
                }
                updates["image_path"] = req.ImagePath
        }
        if req.Content != "" {
                updates["content"] = req.Content
        }
        if req.RegistrationLink != "" {
                updates["registration_link"] = req.RegistrationLink
        }
        if req.Order != 0 {
                updates["display_order"] = req.Order
        }
        if req.Status != "" {
                updates["status"] = req.Status
        }

        // Handle dates
        if req.StartDate != "" {
                parsedDate, err := time.Parse("2006-01-02", req.StartDate)
                if err == nil {
                        updates["start_date"] = parsedDate
                }
        }
        if req.EndDate != "" {
                parsedDate, err := time.Parse("2006-01-02", req.EndDate)
                if err == nil {
                        updates["end_date"] = parsedDate
                }
        }

        if err := h.DB.Model(&existingProgram).Updates(updates).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update program")
                return
        }

        // Fetch updated program
        if err := h.DB.First(&existingProgram, "id = ?", id).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch updated program")
                return
        }

        utils.SendSuccess(c, http.StatusOK, existingProgram, "Program updated successfully")
}

// DeleteProgram deletes a program
func (h *ProgramHandler) DeleteProgram(c *gin.Context) {
        id := c.Param("id")

        var program models.Program
        if err := h.DB.First(&program, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Program not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch program")
                return
        }

        // Delete associated image if exists
        if program.ImagePath != "" {
                utils.DeleteFile(program.ImagePath)
        }

        if err := h.DB.Delete(&program).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to delete program")
                return
        }

        utils.SendSuccess(c, http.StatusOK, nil, "Program deleted successfully")
}

// UploadProgramImage handles image upload for programs
func (h *ProgramHandler) UploadProgramImage(c *gin.Context) {
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
