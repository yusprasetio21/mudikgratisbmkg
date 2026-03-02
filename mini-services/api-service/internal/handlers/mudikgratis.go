package handlers

import (
        "net/http"
        "strconv"
        "time"

        "github.com/gin-gonic/gin"
        "gorm.io/gorm"

        "korpri-bmkg-api/internal/models"
        "korpri-bmkg-api/internal/utils"
)

// MudikGratisHandler handles mudik gratis operations
type MudikGratisHandler struct {
        DB *gorm.DB
}

// NewMudikGratisHandler creates a new mudik gratis handler
func NewMudikGratisHandler(db *gorm.DB) *MudikGratisHandler {
        return &MudikGratisHandler{DB: db}
}

// === CITIES HANDLERS ===

// GetCities returns all cities
func (h *MudikGratisHandler) GetCities(c *gin.Context) {
        var cities []models.MudikCity
        query := h.DB.Where("is_active = ?", true)

        if err := query.Order("created_at ASC").Find(&cities).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch cities")
                return
        }

        utils.SendSuccess(c, http.StatusOK, cities, "Cities retrieved successfully")
}

// GetCity returns a single city by ID
func (h *MudikGratisHandler) GetCity(c *gin.Context) {
        id := c.Param("id")
        var city models.MudikCity

        if err := h.DB.First(&city, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "City not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch city")
                return
        }

        utils.SendSuccess(c, http.StatusOK, city, "City retrieved successfully")
}

// CreateCity creates a new city
func (h *MudikGratisHandler) CreateCity(c *gin.Context) {
        var req struct {
                Name        string `json:"name" binding:"required"`
                Province    string `json:"province"`
                Description string `json:"description"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        city := models.MudikCity{
                ID:          models.GenerateID(),
                Name:        req.Name,
                Province:    req.Province,
                Description: req.Description,
                IsActive:    true,
        }

        if err := h.DB.Create(&city).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create city")
                return
        }

        utils.SendSuccess(c, http.StatusCreated, city, "City created successfully")
}

// UpdateCity updates a city
func (h *MudikGratisHandler) UpdateCity(c *gin.Context) {
        id := c.Param("id")
        var city models.MudikCity

        if err := h.DB.First(&city, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "City not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch city")
                return
        }

        var req struct {
                Name        string `json:"name"`
                Province    string `json:"province"`
                Description string `json:"description"`
                IsActive    *bool  `json:"isActive"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        if req.Name != "" {
                city.Name = req.Name
        }
        if req.Province != "" {
                city.Province = req.Province
        }
        if req.Description != "" {
                city.Description = req.Description
        }
        if req.IsActive != nil {
                city.IsActive = *req.IsActive
        }

        if err := h.DB.Save(&city).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update city")
                return
        }

        utils.SendSuccess(c, http.StatusOK, city, "City updated successfully")
}

// DeleteCity deletes a city (soft delete)
func (h *MudikGratisHandler) DeleteCity(c *gin.Context) {
        id := c.Param("id")
        
        result := h.DB.Model(&models.MudikCity{}).Where("id = ?", id).Update("is_active", false)
        
        if result.Error != nil {
                utils.SendError(c, http.StatusInternalServerError, result.Error, "Failed to delete city")
                return
        }

        if result.RowsAffected == 0 {
                utils.SendError(c, http.StatusNotFound, nil, "City not found")
                return
        }

        utils.SendSuccess(c, http.StatusOK, gin.H{"id": id}, "City deleted successfully")
}

// === CITY STOPS HANDLERS ===

// GetCityStops returns all stops for a city
func (h *MudikGratisHandler) GetCityStops(c *gin.Context) {
        cityID := c.Param("cityId")
        var stops []models.MudikCityStop

        if err := h.DB.Where("city_id = ? AND is_active = ?", cityID, true).
                Order("`order` ASC").
                Find(&stops).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch stops")
                return
        }

        utils.SendSuccess(c, http.StatusOK, stops, "Stops retrieved successfully")
}

// GetAllStops returns all stops
func (h *MudikGratisHandler) GetAllStops(c *gin.Context) {
        var stops []models.MudikCityStop

        if err := h.DB.Where("is_active = ?", true).
                Order("`order` ASC").
                Find(&stops).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch stops")
                return
        }

        utils.SendSuccess(c, http.StatusOK, stops, "Stops retrieved successfully")
}

// GetStop returns a single stop by ID
func (h *MudikGratisHandler) GetStop(c *gin.Context) {
        id := c.Param("id")
        var stop models.MudikCityStop

        if err := h.DB.First(&stop, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Stop not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch stop")
                return
        }

        utils.SendSuccess(c, http.StatusOK, stop, "Stop retrieved successfully")
}

// CreateStop creates a new stop
func (h *MudikGratisHandler) CreateStop(c *gin.Context) {
        var req struct {
                CityID string `json:"cityId" binding:"required"`
                Name   string `json:"name" binding:"required"`
                Order  int    `json:"order"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        // Check if city exists
        var city models.MudikCity
        if err := h.DB.First(&city, "id = ?", req.CityID).Error; err != nil {
                utils.SendError(c, http.StatusNotFound, err, "City not found")
                return
        }

        stop := models.MudikCityStop{
                ID:       models.GenerateID(),
                CityID:   req.CityID,
                Name:     req.Name,
                Order:    req.Order,
                IsActive: true,
        }

        if err := h.DB.Create(&stop).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create stop")
                return
        }

        utils.SendSuccess(c, http.StatusCreated, stop, "Stop created successfully")
}

// UpdateStop updates a stop
func (h *MudikGratisHandler) UpdateStop(c *gin.Context) {
        id := c.Param("id")
        var stop models.MudikCityStop

        if err := h.DB.First(&stop, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Stop not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch stop")
                return
        }

        var req struct {
                Name     string `json:"name"`
                Order    *int   `json:"order"`
                IsActive *bool  `json:"isActive"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        if req.Name != "" {
                stop.Name = req.Name
        }
        if req.Order != nil {
                stop.Order = *req.Order
        }
        if req.IsActive != nil {
                stop.IsActive = *req.IsActive
        }

        if err := h.DB.Save(&stop).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update stop")
                return
        }

        utils.SendSuccess(c, http.StatusOK, stop, "Stop updated successfully")
}

// DeleteStop deletes a stop (soft delete)
func (h *MudikGratisHandler) DeleteStop(c *gin.Context) {
        id := c.Param("id")
        
        result := h.DB.Model(&models.MudikCityStop{}).Where("id = ?", id).Update("is_active", false)
        
        if result.Error != nil {
                utils.SendError(c, http.StatusInternalServerError, result.Error, "Failed to delete stop")
                return
        }

        if result.RowsAffected == 0 {
                utils.SendError(c, http.StatusNotFound, nil, "Stop not found")
                return
        }

        utils.SendSuccess(c, http.StatusOK, gin.H{"id": id}, "Stop deleted successfully")
}

// === BUSES HANDLERS ===

// GetBuses returns all buses with city info
func (h *MudikGratisHandler) GetBuses(c *gin.Context) {
        var buses []models.MudikBus

        query := h.DB.Where("is_active = ?", true)
        
        // Filter by city if provided
        if cityID := c.Query("cityId"); cityID != "" {
                query = query.Where("city_id = ?", cityID)
        }

        if err := query.Order("bus_number ASC").Find(&buses).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch buses")
                return
        }

        // Load city information
        type BusWithCity struct {
                models.MudikBus
                CityName string `json:"cityName"`
        }

        var busesWithCity []BusWithCity
        for _, bus := range buses {
                var city models.MudikCity
                cityName := ""
                if err := h.DB.First(&city, "id = ?", bus.CityID).Error; err == nil {
                        cityName = city.Name
                }
                
                busesWithCity = append(busesWithCity, BusWithCity{
                        MudikBus: bus,
                        CityName: cityName,
                })
        }

        utils.SendSuccess(c, http.StatusOK, busesWithCity, "Buses retrieved successfully")
}

// GetBus returns a single bus by ID
func (h *MudikGratisHandler) GetBus(c *gin.Context) {
        id := c.Param("id")
        var bus models.MudikBus

        if err := h.DB.First(&bus, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Bus not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch bus")
                return
        }

        // Load city information
        var city models.MudikCity
        cityName := ""
        if err := h.DB.First(&city, "id = ?", bus.CityID).Error; err == nil {
                cityName = city.Name
        }

        response := gin.H{
                "id":            bus.ID,
                "busNumber":     bus.BusNumber,
                "plateNumber":   bus.PlateNumber,
                "cityId":        bus.CityID,
                "cityName":      cityName,
                "capacity":      bus.Capacity,
                "available":     bus.Available,
                "description":   bus.Description,
                "departureDate": bus.DepartureDate,
                "isActive":      bus.IsActive,
                "createdAt":     bus.CreatedAt,
                "updatedAt":     bus.UpdatedAt,
        }

        utils.SendSuccess(c, http.StatusOK, response, "Bus retrieved successfully")
}

// CreateBus creates a new bus
func (h *MudikGratisHandler) CreateBus(c *gin.Context) {
        var req struct {
                BusNumber     string `json:"busNumber" binding:"required"`
                PlateNumber   string `json:"plateNumber"`
                CityID        string `json:"cityId" binding:"required"`
                Capacity      int    `json:"capacity" binding:"required,min=1"`
                Description   string `json:"description"`
                DepartureDate string `json:"departureDate"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        // Check if city exists
        var city models.MudikCity
        if err := h.DB.First(&city, "id = ?", req.CityID).Error; err != nil {
                utils.SendError(c, http.StatusNotFound, err, "City not found")
                return
        }

        // Check if bus number already exists
        var existingBus models.MudikBus
        if err := h.DB.Where("bus_number = ?", req.BusNumber).First(&existingBus).Error; err == nil {
                utils.SendError(c, http.StatusConflict, nil, "Bus number already exists")
                return
        }

        var departureDate *time.Time
        if req.DepartureDate != "" {
                parsed, err := time.Parse("2006-01-02", req.DepartureDate)
                if err != nil {
                        utils.SendError(c, http.StatusBadRequest, err, "Invalid departure date format, use YYYY-MM-DD")
                        return
                }
                departureDate = &parsed
        }

        bus := models.MudikBus{
                ID:            models.GenerateID(),
                BusNumber:     req.BusNumber,
                PlateNumber:   req.PlateNumber,
                CityID:        req.CityID,
                Capacity:      req.Capacity,
                Available:     req.Capacity,
                Description:   req.Description,
                DepartureDate: departureDate,
                IsActive:      true,
        }

        if err := h.DB.Create(&bus).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create bus")
                return
        }

        utils.SendSuccess(c, http.StatusCreated, bus, "Bus created successfully")
}

// UpdateBus updates a bus
func (h *MudikGratisHandler) UpdateBus(c *gin.Context) {
        id := c.Param("id")
        var bus models.MudikBus

        if err := h.DB.First(&bus, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Bus not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch bus")
                return
        }

        var req struct {
                BusNumber     *string `json:"busNumber"`
                PlateNumber   *string `json:"plateNumber"`
                CityID        *string `json:"cityId"`
                Capacity      *int    `json:"capacity"`
                Available     *int    `json:"available"`
                Description   *string `json:"description"`
                DepartureDate *string `json:"departureDate"`
                IsActive      *bool   `json:"isActive"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        // Check if bus number is being updated and already exists
        if req.BusNumber != nil && *req.BusNumber != bus.BusNumber {
                var existingBus models.MudikBus
                if err := h.DB.Where("bus_number = ? AND id != ?", *req.BusNumber, id).First(&existingBus).Error; err == nil {
                        utils.SendError(c, http.StatusConflict, nil, "Bus number already exists")
                        return
                }
        }

        // Check if city exists if being updated
        if req.CityID != nil && *req.CityID != bus.CityID {
                var city models.MudikCity
                if err := h.DB.First(&city, "id = ?", *req.CityID).Error; err != nil {
                        utils.SendError(c, http.StatusNotFound, err, "City not found")
                        return
                }
        }

        if req.BusNumber != nil {
                bus.BusNumber = *req.BusNumber
        }
        if req.PlateNumber != nil {
                bus.PlateNumber = *req.PlateNumber
        }
        if req.CityID != nil {
                bus.CityID = *req.CityID
        }
        if req.Capacity != nil {
                // Adjust available seats when capacity changes
                diff := *req.Capacity - bus.Capacity
                bus.Capacity = *req.Capacity
                bus.Available += diff
        }
        if req.Available != nil {
                bus.Available = *req.Available
        }
        if req.Description != nil {
                bus.Description = *req.Description
        }
        if req.DepartureDate != nil {
                if *req.DepartureDate != "" {
                        parsed, err := time.Parse("2006-01-02", *req.DepartureDate)
                        if err != nil {
                                utils.SendError(c, http.StatusBadRequest, err, "Invalid departure date format, use YYYY-MM-DD")
                                return
                        }
                        bus.DepartureDate = &parsed
                } else {
                        bus.DepartureDate = nil
                }
        }
        if req.IsActive != nil {
                bus.IsActive = *req.IsActive
        }

        if err := h.DB.Save(&bus).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update bus")
                return
        }

        utils.SendSuccess(c, http.StatusOK, bus, "Bus updated successfully")
}

// DeleteBus deletes a bus (soft delete)
func (h *MudikGratisHandler) DeleteBus(c *gin.Context) {
        id := c.Param("id")
        
        // Check if there are participants for this bus
        var participantCount int64
        h.DB.Model(&models.MudikParticipant{}).Where("bus_id = ?", id).Count(&participantCount)
        
        if participantCount > 0 {
                // Soft delete only (set is_active to false)
                result := h.DB.Model(&models.MudikBus{}).Where("id = ?", id).Update("is_active", false)
                if result.Error != nil {
                        utils.SendError(c, http.StatusInternalServerError, result.Error, "Failed to delete bus")
                        return
                }
                if result.RowsAffected == 0 {
                        utils.SendError(c, http.StatusNotFound, nil, "Bus not found")
                        return
                }
                utils.SendSuccess(c, http.StatusOK, gin.H{"id": id, "message": "Bus deactivated successfully"}, "Bus deleted successfully")
                return
        }

        // If no participants, hard delete
        result := h.DB.Delete(&models.MudikBus{}, "id = ?", id)
        if result.Error != nil {
                utils.SendError(c, http.StatusInternalServerError, result.Error, "Failed to delete bus")
                return
        }
        if result.RowsAffected == 0 {
                utils.SendError(c, http.StatusNotFound, nil, "Bus not found")
                return
        }

        utils.SendSuccess(c, http.StatusOK, gin.H{"id": id}, "Bus deleted successfully")
}

// === PARTICIPANTS HANDLERS ===

// GetParticipants returns all participants
func (h *MudikGratisHandler) GetParticipants(c *gin.Context) {
        var participants []models.MudikParticipant
        query := h.DB

        // Filter by bus if provided
        if busID := c.Query("busId"); busID != "" {
                query = query.Where("bus_id = ?", busID)
        }

        // Filter by type if provided
        if pType := c.Query("type"); pType != "" {
                query = query.Where("participant_type = ?", pType)
        }

        // Filter by status if provided
        if status := c.Query("status"); status != "" {
                query = query.Where("status = ?", status)
        }

        // Pagination
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

        var total int64
        query.Model(&models.MudikParticipant{}).Count(&total)

        if err := query.Order("registration_date DESC").Limit(limit).Offset(offset).Find(&participants).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch participants")
                return
        }

        type ParticipantWithDetails struct {
                models.MudikParticipant
                FamilyMembers []models.MudikFamilyMember `json:"familyMembers"`
                BusNumber     string                      `json:"busNumber"`
                CityName      string                      `json:"cityName"`
        }

        var participantsWithDetails []ParticipantWithDetails
        for _, participant := range participants {
                var familyMembers []models.MudikFamilyMember
                h.DB.Where("participant_id = ?", participant.ID).Find(&familyMembers)

                var bus models.MudikBus
                busNumber := ""
                cityName := ""
                if err := h.DB.First(&bus, "id = ?", participant.BusID).Error; err == nil {
                        busNumber = bus.BusNumber
                        var city models.MudikCity
                        if err := h.DB.First(&city, "id = ?", bus.CityID).Error; err == nil {
                                cityName = city.Name
                        }
                }

                participantsWithDetails = append(participantsWithDetails, ParticipantWithDetails{
                        MudikParticipant: participant,
                        FamilyMembers:    familyMembers,
                        BusNumber:        busNumber,
                        CityName:         cityName,
                })
        }

        utils.SendSuccess(c, http.StatusOK, gin.H{
                "participants": participantsWithDetails,
                "total":        total,
                "page":         page,
                "limit":        limit,
                "totalPages":   (total + int64(limit) - 1) / int64(limit),
        }, "Participants retrieved successfully")
}

// GetParticipant returns a single participant by ID
func (h *MudikGratisHandler) GetParticipant(c *gin.Context) {
        id := c.Param("id")
        var participant models.MudikParticipant

        if err := h.DB.First(&participant, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Participant not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch participant")
                return
        }

        // Load family members
        var familyMembers []models.MudikFamilyMember
        h.DB.Where("participant_id = ?", participant.ID).Find(&familyMembers)

        // Load bus info
        var bus models.MudikBus
        busNumber := ""
        if err := h.DB.First(&bus, "id = ?", participant.BusID).Error; err == nil {
                busNumber = bus.BusNumber
        }

        utils.SendSuccess(c, http.StatusOK, gin.H{
                "participant":    participant,
                "familyMembers":  familyMembers,
                "busNumber":      busNumber,
        }, "Participant retrieved successfully")
}

// CreateParticipant creates a new participant with family members
func (h *MudikGratisHandler) CreateParticipant(c *gin.Context) {
        var req struct {
                BusID           string `json:"busId" binding:"required"`
                StopID          string `json:"stopId"`
                ParticipantType string `json:"participantType" binding:"required,oneof=ASN Non-ASN"`
                Name            string `json:"name" binding:"required"`
                NIP             string `json:"nip"`
                Phone           string `json:"phone" binding:"required"`
                Address         string `json:"address" binding:"required"`
                Notes           string `json:"notes"`
                FamilyMembers   []struct {
                        Relationship string `json:"relationship" binding:"required"`
                        Name         string `json:"name" binding:"required"`
                        Phone        string `json:"phone"`
                        Age          int    `json:"age" binding:"min=0,max=120"`
                } `json:"familyMembers"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        // Validate family members count (max 5)
        if len(req.FamilyMembers) > 5 {
                utils.SendError(c, http.StatusBadRequest, nil, "Maximum 5 family members allowed")
                return
        }

        // Check bus availability
        var bus models.MudikBus
        if err := h.DB.First(&bus, "id = ?", req.BusID).Error; err != nil {
                utils.SendError(c, http.StatusNotFound, err, "Bus not found")
                return
        }

        totalPeople := 1 + len(req.FamilyMembers)
        if bus.Available < totalPeople {
                utils.SendError(c, http.StatusBadRequest, nil, "Not enough seats available")
                return
        }

        // Start transaction
        tx := h.DB.Begin()

        // Create participant
        participant := models.MudikParticipant{
                ID:              models.GenerateID(),
                BusID:           req.BusID,
                StopID:          req.StopID,
                ParticipantType: req.ParticipantType,
                Name:            req.Name,
                NIP:             req.NIP,
                Phone:           req.Phone,
                Address:         req.Address,
                TotalFamily:     len(req.FamilyMembers),
                Status:          "confirmed",
                Notes:           req.Notes,
        }

        if err := tx.Create(&participant).Error; err != nil {
                tx.Rollback()
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create participant")
                return
        }

        // Create family members
        var familyMembers []models.MudikFamilyMember
        for _, fm := range req.FamilyMembers {
                familyMember := models.MudikFamilyMember{
                        ID:            models.GenerateID(),
                        ParticipantID: participant.ID,
                        Relationship:  fm.Relationship,
                        Name:          fm.Name,
                        Phone:         fm.Phone,
                        Age:           fm.Age,
                }
                if err := tx.Create(&familyMember).Error; err != nil {
                        tx.Rollback()
                        utils.SendError(c, http.StatusInternalServerError, err, "Failed to create family member")
                        return
                }
                familyMembers = append(familyMembers, familyMember)
        }

        // Update bus availability
        if err := tx.Model(&bus).Update("available", bus.Available-totalPeople).Error; err != nil {
                tx.Rollback()
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update bus availability")
                return
        }

        tx.Commit()

        utils.SendSuccess(c, http.StatusCreated, gin.H{
                "participant":    participant,
                "familyMembers":  familyMembers,
        }, "Participant created successfully")
}

// UpdateParticipant updates a participant
func (h *MudikGratisHandler) UpdateParticipant(c *gin.Context) {
        id := c.Param("id")
        var participant models.MudikParticipant

        if err := h.DB.First(&participant, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Participant not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch participant")
                return
        }

        var req struct {
                BusID           *string `json:"busId"`
                StopID          *string `json:"stopId"`
                ParticipantType *string `json:"participantType"`
                Name            *string `json:"name"`
                NIP             *string `json:"nip"`
                Phone           *string `json:"phone"`
                Address         *string `json:"address"`
                Status          *string `json:"status"`
                Notes           *string `json:"notes"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        if req.BusID != nil {
                participant.BusID = *req.BusID
        }
        if req.StopID != nil {
                participant.StopID = *req.StopID
        }
        if req.ParticipantType != nil {
                participant.ParticipantType = *req.ParticipantType
        }
        if req.Name != nil {
                participant.Name = *req.Name
        }
        if req.NIP != nil {
                participant.NIP = *req.NIP
        }
        if req.Phone != nil {
                participant.Phone = *req.Phone
        }
        if req.Address != nil {
                participant.Address = *req.Address
        }
        if req.Status != nil {
                participant.Status = *req.Status
        }
        if req.Notes != nil {
                participant.Notes = *req.Notes
        }

        if err := h.DB.Save(&participant).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update participant")
                return
        }

        utils.SendSuccess(c, http.StatusOK, participant, "Participant updated successfully")
}

// DeleteParticipant deletes a participant
func (h *MudikGratisHandler) DeleteParticipant(c *gin.Context) {
        id := c.Param("id")
        var participant models.MudikParticipant

        if err := h.DB.First(&participant, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Participant not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch participant")
                return
        }

        // Count family members
        var familyCount int64
        h.DB.Model(&models.MudikFamilyMember{}).Where("participant_id = ?", id).Count(&familyCount)
        totalPeople := 1 + int(familyCount)

        // Start transaction
        tx := h.DB.Begin()

        // Delete family members
        if err := tx.Where("participant_id = ?", id).Delete(&models.MudikFamilyMember{}).Error; err != nil {
                tx.Rollback()
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to delete family members")
                return
        }

        // Delete participant
        if err := tx.Delete(&participant).Error; err != nil {
                tx.Rollback()
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to delete participant")
                return
        }

        // Restore bus availability
        var bus models.MudikBus
        if err := tx.First(&bus, "id = ?", participant.BusID).Error; err == nil {
                if err := tx.Model(&bus).Update("available", bus.Available+totalPeople).Error; err != nil {
                        tx.Rollback()
                        utils.SendError(c, http.StatusInternalServerError, err, "Failed to restore bus availability")
                        return
                }
        }

        tx.Commit()

        utils.SendSuccess(c, http.StatusOK, gin.H{"message": "Participant deleted successfully"}, "Participant deleted successfully")
}

// === FAMILY MEMBERS HANDLERS ===

// GetFamilyMembers returns all family members for a participant
func (h *MudikGratisHandler) GetFamilyMembers(c *gin.Context) {
        participantID := c.Param("participantId")
        var familyMembers []models.MudikFamilyMember

        if err := h.DB.Where("participant_id = ?", participantID).Find(&familyMembers).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch family members")
                return
        }

        utils.SendSuccess(c, http.StatusOK, familyMembers, "Family members retrieved successfully")
}

// CreateFamilyMember creates a new family member
func (h *MudikGratisHandler) CreateFamilyMember(c *gin.Context) {
        var req struct {
                ParticipantID string `json:"participantId" binding:"required"`
                Relationship  string `json:"relationship" binding:"required"`
                Name          string `json:"name" binding:"required"`
                Phone         string `json:"phone"`
                Age           int    `json:"age" binding:"min=0,max=120"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        // Check participant exists
        var participant models.MudikParticipant
        if err := h.DB.First(&participant, "id = ?", req.ParticipantID).Error; err != nil {
                utils.SendError(c, http.StatusNotFound, err, "Participant not found")
                return
        }

        // Count existing family members
        var count int64
        h.DB.Model(&models.MudikFamilyMember{}).Where("participant_id = ?", req.ParticipantID).Count(&count)
        if int(count) >= 5 {
                utils.SendError(c, http.StatusBadRequest, nil, "Maximum 5 family members allowed")
                return
        }

        // Check bus availability
        var bus models.MudikBus
        if err := h.DB.First(&bus, "id = ?", participant.BusID).Error; err != nil {
                utils.SendError(c, http.StatusNotFound, err, "Bus not found")
                return
        }

        if bus.Available < 1 {
                utils.SendError(c, http.StatusBadRequest, nil, "Not enough seats available")
                return
        }

        // Start transaction
        tx := h.DB.Begin()

        // Create family member
        familyMember := models.MudikFamilyMember{
                ID:            models.GenerateID(),
                ParticipantID: req.ParticipantID,
                Relationship:  req.Relationship,
                Name:          req.Name,
                Phone:         req.Phone,
                Age:           req.Age,
        }

        if err := tx.Create(&familyMember).Error; err != nil {
                tx.Rollback()
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to create family member")
                return
        }

        // Update participant family count
        if err := tx.Model(&participant).Update("total_family", int(count)+1).Error; err != nil {
                tx.Rollback()
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update participant")
                return
        }

        // Update bus availability
        if err := tx.Model(&bus).Update("available", bus.Available-1).Error; err != nil {
                tx.Rollback()
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update bus availability")
                return
        }

        tx.Commit()

        utils.SendSuccess(c, http.StatusCreated, familyMember, "Family member created successfully")
}

// UpdateFamilyMember updates a family member
func (h *MudikGratisHandler) UpdateFamilyMember(c *gin.Context) {
        id := c.Param("id")
        var familyMember models.MudikFamilyMember

        if err := h.DB.First(&familyMember, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Family member not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch family member")
                return
        }

        var req struct {
                Relationship *string `json:"relationship"`
                Name         *string `json:"name"`
                Phone        *string `json:"phone"`
                Age          *int    `json:"age"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
                utils.SendError(c, http.StatusBadRequest, err, "Invalid request body")
                return
        }

        if req.Relationship != nil {
                familyMember.Relationship = *req.Relationship
        }
        if req.Name != nil {
                familyMember.Name = *req.Name
        }
        if req.Phone != nil {
                familyMember.Phone = *req.Phone
        }
        if req.Age != nil {
                familyMember.Age = *req.Age
        }

        if err := h.DB.Save(&familyMember).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update family member")
                return
        }

        utils.SendSuccess(c, http.StatusOK, familyMember, "Family member updated successfully")
}

// DeleteFamilyMember deletes a family member
func (h *MudikGratisHandler) DeleteFamilyMember(c *gin.Context) {
        id := c.Param("id")
        var familyMember models.MudikFamilyMember

        if err := h.DB.First(&familyMember, "id = ?", id).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        utils.SendError(c, http.StatusNotFound, nil, "Family member not found")
                        return
                }
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to fetch family member")
                return
        }

        participantID := familyMember.ParticipantID

        // Start transaction
        tx := h.DB.Begin()

        // Delete family member
        if err := tx.Delete(&familyMember).Error; err != nil {
                tx.Rollback()
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to delete family member")
                return
        }

        // Update participant family count
        var participant models.MudikParticipant
        if err := tx.First(&participant, "id = ?", participantID).Error; err == nil {
                if participant.TotalFamily > 0 {
                        if err := tx.Model(&participant).Update("total_family", participant.TotalFamily-1).Error; err != nil {
                                tx.Rollback()
                                utils.SendError(c, http.StatusInternalServerError, err, "Failed to update participant")
                                return
                        }
                }

                // Restore bus availability
                var bus models.MudikBus
                if err := tx.First(&bus, "id = ?", participant.BusID).Error; err == nil {
                        if err := tx.Model(&bus).Update("available", bus.Available+1).Error; err != nil {
                                tx.Rollback()
                                utils.SendError(c, http.StatusInternalServerError, err, "Failed to restore bus availability")
                                return
                        }
                }
        }

        tx.Commit()

        utils.SendSuccess(c, http.StatusOK, gin.H{"message": "Family member deleted successfully"}, "Family member deleted successfully")
}

// === SUMMARY HANDLERS ===

// GetDashboardSummary returns summary statistics for the dashboard
func (h *MudikGratisHandler) GetDashboardSummary(c *gin.Context) {
        var totalCities int64
        var totalBuses int64
        var totalParticipants int64
        var totalASNs int64
        var totalNonASNs int64
        var totalCapacity int64
        var totalAvailable int64

        if err := h.DB.Model(&models.MudikCity{}).Where("is_active = ?", true).Count(&totalCities).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to count cities")
                return
        }

        if err := h.DB.Model(&models.MudikBus{}).Where("is_active = ?", true).Count(&totalBuses).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to count buses")
                return
        }

        if err := h.DB.Model(&models.MudikParticipant{}).Count(&totalParticipants).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to count participants")
                return
        }

        if err := h.DB.Model(&models.MudikParticipant{}).Where("participant_type = ?", "ASN").Count(&totalASNs).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to count ASN participants")
                return
        }

        if err := h.DB.Model(&models.MudikParticipant{}).Where("participant_type = ?", "Non-ASN").Count(&totalNonASNs).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to count Non-ASN participants")
                return
        }

        // Get total capacity and available seats
        if err := h.DB.Model(&models.MudikBus{}).Where("is_active = ?", true).Select("COALESCE(SUM(capacity), 0)").Scan(&totalCapacity).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to calculate total capacity")
                return
        }

        if err := h.DB.Model(&models.MudikBus{}).Where("is_active = ?", true).Select("COALESCE(SUM(available), 0)").Scan(&totalAvailable).Error; err != nil {
                utils.SendError(c, http.StatusInternalServerError, err, "Failed to calculate available seats")
                return
        }

        utils.SendSuccess(c, http.StatusOK, gin.H{
                "totalCities":      totalCities,
                "totalBuses":       totalBuses,
                "totalParticipants": totalParticipants,
                "totalASNs":        totalASNs,
                "totalNonASNs":     totalNonASNs,
                "totalCapacity":    totalCapacity,
                "totalAvailable":   totalAvailable,
                "totalBooked":      totalCapacity - totalAvailable,
        }, "Dashboard summary retrieved successfully")
}