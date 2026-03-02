-- KORPRI BMKG Database Schema for MySQL

CREATE DATABASE IF NOT EXISTS korpri_bmkg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE korpri_bmkg;

-- Sliders table
CREATE TABLE IF NOT EXISTS sliders (
    id VARCHAR(36) PRIMARY KEY,
    category VARCHAR(50) DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    highlight VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    button_label VARCHAR(255) NOT NULL,
    button_url TEXT,
    card_title VARCHAR(255) NOT NULL,
    card_desc TEXT NOT NULL,
    card_tag VARCHAR(255) NOT NULL,
    card_link TEXT,
    image_url TEXT,
    image_path TEXT,
    image_overlay VARCHAR(255),
    label VARCHAR(255),
    label_icon VARCHAR(10),
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kegiatan (Activities) table
CREATE TABLE IF NOT EXISTS kegiatan (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'olahraga',
    event_date DATE,
    location VARCHAR(255),
    images TEXT,
    video_url TEXT,
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_event_date (event_date),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Peraturan (Regulations) table
CREATE TABLE IF NOT EXISTS peraturan (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'kepala',
    pdf_path TEXT NOT NULL,
    pdf_url TEXT,
    publish_date DATE,
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_publish_date (publish_date),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'kesejahteraan',
    image_url TEXT,
    image_path TEXT,
    content TEXT,
    start_date DATE,
    end_date DATE,
    registration_link TEXT,
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_slug (slug),
    INDEX idx_start_date (start_date),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mudik Gratis tables

-- Mudik Cities (Destination cities)
CREATE TABLE IF NOT EXISTS mudik_cities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mudik City Stops (Intermediate stops)
CREATE TABLE IF NOT EXISTS mudik_city_stops (
    id VARCHAR(36) PRIMARY KEY,
    city_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    `order` INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES mudik_cities(id) ON DELETE CASCADE,
    INDEX idx_city_id (city_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mudik Buses (Bus management)
CREATE TABLE IF NOT EXISTS mudik_buses (
    id VARCHAR(36) PRIMARY KEY,
    bus_number VARCHAR(50) NOT NULL UNIQUE,
    plate_number VARCHAR(20),
    city_id VARCHAR(36) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    available INT NOT NULL DEFAULT 40,
    description TEXT,
    departure_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES mudik_cities(id) ON DELETE CASCADE,
    INDEX idx_city_id (city_id),
    INDEX idx_bus_number (bus_number),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mudik Participants (Participant registration)
CREATE TABLE IF NOT EXISTS mudik_participants (
    id VARCHAR(36) PRIMARY KEY,
    bus_id VARCHAR(36) NOT NULL,
    stop_id VARCHAR(36),
    participant_type VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    nip VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    total_family INT DEFAULT 0,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES mudik_buses(id) ON DELETE CASCADE,
    INDEX idx_bus_id (bus_id),
    INDEX idx_participant_type (participant_type),
    INDEX idx_status (status),
    INDEX idx_registration_date (registration_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mudik Family Members (Family members of participants)
CREATE TABLE IF NOT EXISTS mudik_family_members (
    id VARCHAR(36) PRIMARY KEY,
    participant_id VARCHAR(36) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES mudik_participants(id) ON DELETE CASCADE,
    INDEX idx_participant_id (participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ASN Employees (Data pegawai ASN untuk pencarian otomatis)
CREATE TABLE IF NOT EXISTS asn_employees (
    id VARCHAR(36) PRIMARY KEY,
    nip VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    gelar_depan VARCHAR(50),
    gelar_belakang VARCHAR(50),
    jabatan VARCHAR(255),
    unit_kerja VARCHAR(255),
    alamat TEXT,
    no_hp VARCHAR(20),
    email VARCHAR(100),
    golongan VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nip (nip),
    INDEX idx_nama (nama),
    INDEX idx_is_active (is_active),
    FULLTEXT idx_search (nama, nip, alamat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
