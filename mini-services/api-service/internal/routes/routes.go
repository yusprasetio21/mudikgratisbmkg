package routes

import (
        "github.com/gin-gonic/gin"
        "gorm.io/gorm"

        "korpri-bmkg-api/internal/handlers"
        "korpri-bmkg-api/internal/middleware"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine, db *gorm.DB) {
        // Apply middleware
        r.Use(middleware.CORS())
        r.Use(middleware.SecurityMiddleware())
        r.Use(middleware.RateLimiter())
        r.Use(middleware.ValidateContentType())

        // API v1 group
        v1 := r.Group("/api/v1")
        {
                // Health check
                v1.GET("/health", func(c *gin.Context) {
                        c.JSON(200, gin.H{
                                "status":  "ok",
                                "message": "KORPRI BMKG API is running",
                        })
                })

                // Initialize handlers
                sliderHandler := handlers.NewSliderHandler(db)
                kegiatanHandler := handlers.NewKegiatanHandler(db)
                peraturanHandler := handlers.NewPeraturanHandler(db)
                programHandler := handlers.NewProgramHandler(db)
                mudikGratisHandler := handlers.NewMudikGratisHandler(db)
                asnEmployeeHandler := handlers.NewASNEmployeeHandler(db)

                // File upload routes
                v1.POST("/upload", func(c *gin.Context) {
                        fileType := c.PostForm("type")
                        if fileType == "" {
                                fileType = "image"
                        }

                        switch fileType {
                        case "image":
                                sliderHandler.UploadSliderImage(c)
                        case "pdf":
                                peraturanHandler.UploadPeraturanPDF(c)
                        case "video":
                                kegiatanHandler.UploadKegiatanImage(c)
                        default:
                                sliderHandler.UploadSliderImage(c)
                        }
                })

                // Slider routes
                sliders := v1.Group("/sliders")
                {
                        sliders.GET("", sliderHandler.GetSliders)
                        sliders.POST("", sliderHandler.CreateSlider)
                        sliders.GET("/:id", sliderHandler.GetSlider)
                        sliders.PUT("/:id", sliderHandler.UpdateSlider)
                        sliders.DELETE("/:id", sliderHandler.DeleteSlider)
                        sliders.PATCH("/:id/status", sliderHandler.UpdateSliderStatus)
                }

                // Kegiatan (Activities) routes
                kegiatan := v1.Group("/kegiatan")
                {
                        kegiatan.GET("", kegiatanHandler.GetKegiatan)
                        kegiatan.POST("", kegiatanHandler.CreateKegiatan)
                        kegiatan.GET("/:id", kegiatanHandler.GetKegiatanByID)
                        kegiatan.PUT("/:id", kegiatanHandler.UpdateKegiatan)
                        kegiatan.DELETE("/:id", kegiatanHandler.DeleteKegiatan)
                }

                // Peraturan (Regulations) routes
                peraturan := v1.Group("/peraturan")
                {
                        peraturan.GET("", peraturanHandler.GetPeraturan)
                        peraturan.POST("", peraturanHandler.CreatePeraturan)
                        peraturan.GET("/:id", peraturanHandler.GetPeraturanByID)
                        peraturan.PUT("/:id", peraturanHandler.UpdatePeraturan)
                        peraturan.DELETE("/:id", peraturanHandler.DeletePeraturan)
                }

                // Program routes
                programs := v1.Group("/programs")
                {
                        programs.GET("", programHandler.GetPrograms)
                        programs.POST("", programHandler.CreateProgram)
                        programs.GET("/:id", programHandler.GetProgramByID)
                        programs.GET("/slug/:slug", programHandler.GetProgramBySlug)
                        programs.PUT("/:id", programHandler.UpdateProgram)
                        programs.DELETE("/:id", programHandler.DeleteProgram)
                }

                // Mudik Gratis routes
                mudik := v1.Group("/mudikgratis")
                {
                        // Dashboard summary
                        mudik.GET("/summary", mudikGratisHandler.GetDashboardSummary)

                        // Cities routes
                        cities := mudik.Group("/cities")
                        {
                                cities.GET("", mudikGratisHandler.GetCities)
                                cities.POST("", mudikGratisHandler.CreateCity)
                                cities.GET("/:id", mudikGratisHandler.GetCity)
                                cities.PUT("/:id", mudikGratisHandler.UpdateCity)
                                cities.DELETE("/:id", mudikGratisHandler.DeleteCity)
                        }

                        // City Stops routes
                        stops := mudik.Group("/stops")
                        {
                                stops.GET("", mudikGratisHandler.GetAllStops)
                                stops.POST("", mudikGratisHandler.CreateStop)
                                stops.GET("/city/:cityId", mudikGratisHandler.GetCityStops)
                                stops.GET("/:id", mudikGratisHandler.GetStop)
                                stops.PUT("/:id", mudikGratisHandler.UpdateStop)
                                stops.DELETE("/:id", mudikGratisHandler.DeleteStop)
                        }

                        // Buses routes
                        buses := mudik.Group("/buses")
                        {
                                buses.GET("", mudikGratisHandler.GetBuses)
                                buses.POST("", mudikGratisHandler.CreateBus)
                                buses.GET("/:id", mudikGratisHandler.GetBus)
                                buses.PUT("/:id", mudikGratisHandler.UpdateBus)
                                buses.DELETE("/:id", mudikGratisHandler.DeleteBus)
                        }

                        // Participants routes
                        participants := mudik.Group("/participants")
                        {
                                participants.GET("", mudikGratisHandler.GetParticipants)
                                participants.POST("", mudikGratisHandler.CreateParticipant)
                                participants.GET("/:id", mudikGratisHandler.GetParticipant)
                                participants.PUT("/:id", mudikGratisHandler.UpdateParticipant)
                                participants.DELETE("/:id", mudikGratisHandler.DeleteParticipant)
                        }

                        // Family Members routes
                        family := mudik.Group("/family-members")
                        {
                                family.GET("/participant/:participantId", mudikGratisHandler.GetFamilyMembers)
                                family.POST("", mudikGratisHandler.CreateFamilyMember)
                                family.PUT("/:id", mudikGratisHandler.UpdateFamilyMember)
                                family.DELETE("/:id", mudikGratisHandler.DeleteFamilyMember)
                        }
                }

                // ASN Employees routes
                asnEmployees := v1.Group("/asn-employees")
                {
                        asnEmployees.GET("", asnEmployeeHandler.GetAllEmployees)
                        asnEmployees.POST("", asnEmployeeHandler.CreateEmployee)
                        asnEmployees.GET("/search", asnEmployeeHandler.SearchEmployees)
                        asnEmployees.GET("/nip/:nip", asnEmployeeHandler.GetEmployeeByNIP)
                        asnEmployees.GET("/:id", asnEmployeeHandler.GetEmployeeByNIP)
                        asnEmployees.PUT("/:id", asnEmployeeHandler.UpdateEmployee)
                        asnEmployees.DELETE("/:id", asnEmployeeHandler.DeleteEmployee)
                }
        }
}
