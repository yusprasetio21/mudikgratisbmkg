package models

import (
        "time"

        "github.com/google/uuid"
)

// Slider model
type Slider struct {
        ID          string     `json:"id" gorm:"primaryKey;type:varchar(36)"`
        Category    string     `json:"category" gorm:"type:varchar(50);default:'info'"`
        Title       string     `json:"title" gorm:"type:varchar(255);not null"`
        Highlight   string     `json:"highlight" gorm:"type:varchar(255);not null"`
        Description string     `json:"description" gorm:"type:text;not null"`
        ButtonLabel string     `json:"buttonLabel" gorm:"column:button_label;type:varchar(255);not null"`
        ButtonURL   string     `json:"buttonUrl" gorm:"column:button_url;type:text"`
        CardTitle   string     `json:"cardTitle" gorm:"column:card_title;type:varchar(255);not null"`
        CardDesc    string     `json:"cardDesc" gorm:"column:card_desc;type:text;not null"`
        CardTag     string     `json:"cardTag" gorm:"column:card_tag;type:varchar(255);not null"`
        CardLink    string     `json:"cardLink" gorm:"column:card_link;type:text"`
        ImageURL    string     `json:"imageUrl" gorm:"column:image_url;type:text"`
        ImagePath   string     `json:"imagePath" gorm:"column:image_path;type:text"`
        ImageOverlay string    `json:"imageOverlay" gorm:"column:image_overlay;type:varchar(255)"`
        Label       string     `json:"label" gorm:"type:varchar(255)"`
        LabelIcon   string     `json:"labelIcon" gorm:"column:label_icon;type:varchar(10)"`
        DisplayOrder int      `json:"order" gorm:"column:display_order;default:0"`
        Status      string     `json:"status" gorm:"type:varchar(20);default:'draft'"`
        CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt   time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (Slider) TableName() string {
        return "sliders"
}

// Kegiatan (Activity) model
type Kegiatan struct {
        ID          string     `json:"id" gorm:"primaryKey;type:varchar(36)"`
        Title       string     `json:"title" gorm:"type:varchar(255);not null"`
        Description string     `json:"description" gorm:"type:text;not null"`
        Category    string     `json:"category" gorm:"type:varchar(50);default:'olahraga'"`
        EventDate   *time.Time `json:"date" gorm:"column:event_date;type:date"`
        Location    string     `json:"location" gorm:"type:varchar(255)"`
        Images      string     `json:"images" gorm:"type:text"`
        VideoURL    string     `json:"videoUrl" gorm:"column:video_url;type:text"`
        DisplayOrder int      `json:"order" gorm:"column:display_order;default:0"`
        Status      string     `json:"status" gorm:"type:varchar(20);default:'draft'"`
        CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt   time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (Kegiatan) TableName() string {
        return "kegiatan"
}

// Peraturan (Regulation) model
type Peraturan struct {
        ID          string     `json:"id" gorm:"primaryKey;type:varchar(36)"`
        Title       string     `json:"title" gorm:"type:varchar(255);not null"`
        Description string     `json:"description" gorm:"type:text"`
        Category    string     `json:"category" gorm:"type:varchar(50);default:'kepala'"`
        PDFPath     string     `json:"pdfPath" gorm:"column:pdf_path;type:text;not null"`
        PDFURL      string     `json:"pdfUrl" gorm:"column:pdf_url;type:text"`
        PublishDate *time.Time `json:"publishDate" gorm:"column:publish_date;type:date"`
        DisplayOrder int      `json:"order" gorm:"column:display_order;default:0"`
        Status      string     `json:"status" gorm:"type:varchar(20);default:'draft'"`
        CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt   time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (Peraturan) TableName() string {
        return "peraturan"
}

// Program model
type Program struct {
        ID               string     `json:"id" gorm:"primaryKey;type:varchar(36)"`
        Slug             string     `json:"slug" gorm:"type:varchar(255);uniqueIndex;not null"`
        Title            string     `json:"title" gorm:"type:varchar(255);not null"`
        Description      string     `json:"description" gorm:"type:text;not null"`
        Category         string     `json:"category" gorm:"type:varchar(50);default:'kesejahteraan'"`
        ImageURL         string     `json:"imageUrl" gorm:"column:image_url;type:text"`
        ImagePath        string     `json:"imagePath" gorm:"column:image_path;type:text"`
        Content          string     `json:"content" gorm:"type:text"`
        StartDate        *time.Time `json:"startDate" gorm:"column:start_date;type:date"`
        EndDate          *time.Time `json:"endDate" gorm:"column:end_date;type:date"`
        RegistrationLink string     `json:"registrationLink" gorm:"column:registration_link;type:text"`
        DisplayOrder     int        `json:"order" gorm:"column:display_order;default:0"`
        Status           string     `json:"status" gorm:"type:varchar(20);default:'draft'"`
        CreatedAt        time.Time  `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt        time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (Program) TableName() string {
        return "programs"
}

// MudikCity - Destination cities for mudik gratis
type MudikCity struct {
        ID          string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
        Name        string    `json:"name" gorm:"type:varchar(255);not null"`
        Province    string    `json:"province" gorm:"type:varchar(255)"`
        Description string    `json:"description" gorm:"type:text"`
        IsActive    bool      `json:"isActive" gorm:"column:is_active;default:true"`
        CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (MudikCity) TableName() string {
        return "mudik_cities"
}

// MudikCityStop - Intermediate stop cities
type MudikCityStop struct {
        ID          string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
        CityID      string    `json:"cityId" gorm:"column:city_id;type:varchar(36);not null"`
        Name        string    `json:"name" gorm:"type:varchar(255);not null"`
        Order       int       `json:"order" gorm:"default:0"`
        IsActive    bool      `json:"isActive" gorm:"column:is_active;default:true"`
        CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (MudikCityStop) TableName() string {
        return "mudik_city_stops"
}

// MudikBus - Bus management with capacity
type MudikBus struct {
        ID          string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
        BusNumber   string    `json:"busNumber" gorm:"column:bus_number;type:varchar(50);not null;uniqueIndex"`
        PlateNumber string    `json:"plateNumber" gorm:"column:plate_number;type:varchar(20)"`
        CityID      string    `json:"cityId" gorm:"column:city_id;type:varchar(36);not null"`
        Capacity    int       `json:"capacity" gorm:"not null;default:40"`
        Available   int       `json:"available" gorm:"not null;default:40"`
        Description string    `json:"description" gorm:"type:text"`
        DepartureDate *time.Time `json:"departureDate" gorm:"column:departure_date;type:date"`
        IsActive    bool      `json:"isActive" gorm:"column:is_active;default:true"`
        CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (MudikBus) TableName() string {
        return "mudik_buses"
}

// MudikParticipant - Participant registration
type MudikParticipant struct {
        ID               string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
        BusID            string    `json:"busId" gorm:"column:bus_id;type:varchar(36);not null"`
        StopID           string    `json:"stopId" gorm:"column:stop_id;type:varchar(36)"`
        ParticipantType  string    `json:"participantType" gorm:"column:participant_type;type:varchar(20);not null"` // ASN or Non-ASN
        Name             string    `json:"name" gorm:"type:varchar(255);not null"`
        NIP              string    `json:"nip" gorm:"type:varchar(50)"`
        Phone            string    `json:"phone" gorm:"type:varchar(20)"`
        Address          string    `json:"address" gorm:"type:text"`
        TotalFamily      int       `json:"totalFamily" gorm:"column:total_family;default:0"`
        RegistrationDate time.Time `json:"registrationDate" gorm:"column:registration_date;autoCreateTime"`
        Status           string    `json:"status" gorm:"type:varchar(20);default:'confirmed'"`
        Notes            string    `json:"notes" gorm:"type:text"`
        CreatedAt        time.Time `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt        time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (MudikParticipant) TableName() string {
        return "mudik_participants"
}

// MudikFamilyMember - Family members of participants
type MudikFamilyMember struct {
        ID             string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
        ParticipantID  string    `json:"participantId" gorm:"column:participant_id;type:varchar(36);not null"`
        Relationship   string    `json:"relationship" gorm:"type:varchar(100);not null"`
        Name           string    `json:"name" gorm:"type:varchar(255);not null"`
        Phone          string    `json:"phone" gorm:"type:varchar(20)"`
        Age            int       `json:"age"`
        CreatedAt      time.Time `json:"createdAt" gorm:"autoCreateTime"`
        UpdatedAt      time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (MudikFamilyMember) TableName() string {
        return "mudik_family_members"
}

// ASNEmployee - ASN employee data for auto-fill
type ASNEmployee struct {
        ID           string    `json:"id" gorm:"primaryKey;column:id;type:varchar(36)"`
        NIP          string    `json:"nip" gorm:"column:nip;type:varchar(50)"`  // Pastikan column:nip
        Nama         string    `json:"nama" gorm:"column:nama;type:varchar(255);not null"`
        GelarDepan   string    `json:"gelarDepan" gorm:"column:gelar_depan;type:varchar(50)"`
        GelarBelakang string   `json:"gelarBelakang" gorm:"column:gelar_belakang;type:varchar(50)"`
        Jabatan      string    `json:"jabatan" gorm:"column:jabatan;type:varchar(255)"`
        UnitKerja    string    `json:"unitKerja" gorm:"column:unit_kerja;type:varchar(255)"`
        Alamat       string    `json:"alamat" gorm:"column:alamat;type:text"`
        NoHP         string    `json:"noHp" gorm:"column:no_hp;type:varchar(20)"`
        Email        string    `json:"email" gorm:"column:email;type:varchar(100)"`
        Golongan     string    `json:"golongan" gorm:"column:golongan;type:varchar(10)"`
        IsActive     bool      `json:"isActive" gorm:"column:is_active;default:true"`
        CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
        UpdatedAt    time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

// FileUploadResponse for file upload API
type FileUploadResponse struct {
        Success     bool   `json:"success"`
        URL         string `json:"url"`
        Path        string `json:"path"`
        Filename    string `json:"filename"`
        OriginalName string `json:"originalName"`
        Size        int64  `json:"size"`
}

// ErrorResponse for error responses
type ErrorResponse struct {
        Error string `json:"error"`
}

// GenerateID generates a unique ID
func GenerateID() string {
        return uuid.New().String()
}
