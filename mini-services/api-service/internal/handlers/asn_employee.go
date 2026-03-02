package handlers

import (
        "net/http"
        "strconv"
        "strings"

        "github.com/gin-gonic/gin"
        "gorm.io/gorm"

        "korpri-bmkg-api/internal/models"
        "korpri-bmkg-api/internal/utils"
)

// ASNEmployeeHandler handles ASN employee operations
type ASNEmployeeHandler struct {
        DB *gorm.DB
}

// NewASNEmployeeHandler creates a new ASN employee handler
func NewASNEmployeeHandler(db *gorm.DB) *ASNEmployeeHandler {
        return &ASNEmployeeHandler{DB: db}
}

// SearchEmployees searches ASN employees by NIP or name
func (h *ASNEmployeeHandler) SearchEmployees(c *gin.Context) {
        query := c.Query("q")
        if query == "" {
                utils.SendError(c, http.StatusBadRequest, nil, "Query parameter 'q' is required")
                return
        }

        var employees []models.ASNEmployee
        searchTerm := strings.TrimSpace(query)

        // Simple search: cari berdasarkan NIP ATAU nama
        if err := h.DB.Where("is_active = ?", true).
                Where("nip LIKE ? OR nama LIKE ?", "%"+searchTerm+"%", "%"+searchTerm+"%").
                Order("nama ASC").
                Limit(20).
                Find(&employees).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to search employees")
                return
        }

        utils.SendSuccess(c, http.StatusOK, employees, "Employees retrieved successfully")
}

// GetEmployeeByNIP gets an employee by NIP
func (h *ASNEmployeeHandler) GetEmployeeByNIP(c *gin.Context) {
        nip := c.Param("nip")

        var employee models.ASNEmployee
        if err := h.DB.Where("nip = ? AND is_active = ?", nip, true).First(&employee).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Employee not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch employee")
                return
        }

        utils.SendSuccess(c, http.StatusOK, employee, "Employee retrieved successfully")
}

// GetEmployeeByID gets an employee by ID
func (h *ASNEmployeeHandler) GetEmployeeByID(c *gin.Context) {
        id := c.Param("id")

        var employee models.ASNEmployee
        if err := h.DB.First(&employee, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Employee not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch employee")
                return
        }

        utils.SendSuccess(c, http.StatusOK, employee, "Employee retrieved successfully")
}

// CreateEmployee creates a new ASN employee
func (h *ASNEmployeeHandler) CreateEmployee(c *gin.Context) {
        var req struct {
                NIP           string `json:"nip" binding:"required"`
                Nama          string `json:"nama" binding:"required"`
                GelarDepan    string `json:"gelarDepan"`
                GelarBelakang string `json:"gelarBelakang"`
                Jabatan       string `json:"jabatan"`
                UnitKerja     string `json:"unitKerja"`
                Alamat        string `json:"alamat"`
                NoHP          string `json:"noHp"`
                Email         string `json:"email"`
                Golongan      string `json:"golongan"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        // Check if NIP already exists
        var existingEmployee models.ASNEmployee
        if err := h.DB.Where("nip = ?", req.NIP).First(&existingEmployee).Error; err == nil {
                utils.SendError(c, http.StatusConflict, nil, "Employee with this NIP already exists")
                return
        }

        employee := models.ASNEmployee{
                ID:            models.GenerateID(),
                NIP:           req.NIP,
                Nama:          req.Nama,
                GelarDepan:    req.GelarDepan,
                GelarBelakang: req.GelarBelakang,
                Jabatan:       req.Jabatan,
                UnitKerja:     req.UnitKerja,
                Alamat:        req.Alamat,
                NoHP:          req.NoHP,
                Email:         req.Email,
                Golongan:      req.Golongan,
                IsActive:      true,
        }

        if err := h.DB.Create(&employee).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create employee")
                return
        }

        utils.SendSuccess(c, http.StatusCreated, employee, "Employee created successfully")
}

// UpdateEmployee updates an ASN employee
func (h *ASNEmployeeHandler) UpdateEmployee(c *gin.Context) {
        id := c.Param("id")
        var employee models.ASNEmployee

        if err := h.DB.First(&employee, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Employee not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch employee")
                return
        }

        var req struct {
                NIP           *string `json:"nip"`
                Nama          *string `json:"nama"`
                GelarDepan    *string `json:"gelarDepan"`
                GelarBelakang *string `json:"gelarBelakang"`
                Jabatan       *string `json:"jabatan"`
                UnitKerja     *string `json:"unitKerja"`
                Alamat        *string `json:"alamat"`
                NoHP          *string `json:"noHp"`
                Email         *string `json:"email"`
                Golongan      *string `json:"golongan"`
                IsActive      *bool   `json:"isActive"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        // Check if NIP is being updated and already exists
        if req.NIP != nil && *req.NIP != employee.NIP {
                var existingEmployee models.ASNEmployee
                if err := h.DB.Where("nip = ? AND id != ?", *req.NIP, id).First(&existingEmployee).Error; err == nil {
                        utils.SendError(c, http.StatusConflict, nil, "Employee with this NIP already exists")
                        return
                }
        }

        if req.NIP != nil {
                employee.NIP = *req.NIP
        }
        if req.Nama != nil {
                employee.Nama = *req.Nama
        }
        if req.GelarDepan != nil {
                employee.GelarDepan = *req.GelarDepan
        }
        if req.GelarBelakang != nil {
                employee.GelarBelakang = *req.GelarBelakang
        }
        if req.Jabatan != nil {
                employee.Jabatan = *req.Jabatan
        }
        if req.UnitKerja != nil {
                employee.UnitKerja = *req.UnitKerja
        }
        if req.Alamat != nil {
                employee.Alamat = *req.Alamat
        }
        if req.NoHP != nil {
                employee.NoHP = *req.NoHP
        }
        if req.Email != nil {
                employee.Email = *req.Email
        }
        if req.Golongan != nil {
                employee.Golongan = *req.Golongan
        }
        if req.IsActive != nil {
                employee.IsActive = *req.IsActive
        }

        if err := h.DB.Save(&employee).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update employee")
                return
        }

        utils.SendSuccess(c, http.StatusOK, employee, "Employee updated successfully")
}

// DeleteEmployee deletes an ASN employee (soft delete)
func (h *ASNEmployeeHandler) DeleteEmployee(c *gin.Context) {
        id := c.Param("id")

        // Soft delete (update is_active to false)
        result := h.DB.Model(&models.ASNEmployee{}).Where("id = ?", id).Update("is_active", false)
        
        if result.Error != nil {
                utils.SendError(c, http.StatusInternalServerError, result.Error, "Failed to delete employee")
                return
        }

        if result.RowsAffected == 0 {
                utils.SendError(c, http.StatusNotFound, nil, "Employee not found")
                return
        }

        utils.SendSuccess(c, http.StatusOK, gin.H{"id": id}, "Employee deleted successfully")
}

// GetAllEmployees gets all ASN employees (with pagination)
func (h *ASNEmployeeHandler) GetAllEmployees(c *gin.Context) {
        page := 1
        limit := 20

        if p := c.Query("page"); p != "" {
                if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
                        page = parsed
                }
        }

        if l := c.Query("limit"); l != "" {
                if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
                        limit = parsed
                }
        }

        offset := (page - 1) * limit

        var employees []models.ASNEmployee
        var total int64

        dbQuery := h.DB.Where("is_active = ?", true)

        // Count total
        if err := dbQuery.Model(&models.ASNEmployee{}).Count(&total).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to count employees")
                return
        }

        // Fetch with pagination
        if err := dbQuery.Order("nama ASC").Limit(limit).Offset(offset).Find(&employees).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch employees")
                return
        }

        utils.SendSuccess(c, http.StatusOK, gin.H{
                "employees":  employees,
                "total":      total,
                "page":       page,
                "limit":      limit,
                "totalPages": (total + int64(limit) - 1) / int64(limit),
        }, "Employees retrieved successfully")
}

// SearchByNIPOnly searches employee by exact NIP match
func (h *ASNEmployeeHandler) SearchByNIPOnly(c *gin.Context) {
        nip := c.Query("nip")
        if nip == "" {
                utils.SendError(c, http.StatusBadRequest, nil, "Query parameter 'nip' is required")
                return
        }

        var employee models.ASNEmployee
        if err := h.DB.Where("nip = ? AND is_active = ?", nip, true).First(&employee).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Employee not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch employee")
                return
        }

        utils.SendSuccess(c, http.StatusOK, employee, "Employee retrieved successfully")
}