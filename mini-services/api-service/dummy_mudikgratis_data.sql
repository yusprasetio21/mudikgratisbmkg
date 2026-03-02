-- Dummy data untuk Mudik Gratis
-- Import ini setelah import schema.sql utama

USE korpri_bmkg;

-- Hapus data yang sudah ada (opsional, jika ingin reset)
-- DELETE FROM mudik_family_members WHERE participant_id IN (SELECT id FROM mudik_participants);
-- DELETE FROM mudik_participants;
-- DELETE FROM mudik_buses;
-- DELETE FROM mudik_city_stops;
-- DELETE FROM mudik_cities;

-- Insert Kota Tujuan
INSERT INTO mudik_cities (id, name, province, description, is_active, created_at, updated_at) VALUES
(UUID(), 'Semarang', 'Jawa Tengah', 'Kota Semarang - ibu kota Provinsi Jawa Tengah', TRUE, NOW(), NOW()),
(UUID(), 'Surabaya', 'Jawa Timur', 'Kota Surabaya - ibu kota Provinsi Jawa Timur', TRUE, NOW(), NOW()),
(UUID(), 'Yogyakarta', 'DI Yogyakarta', 'Kota Yogyakarta - ibu kota DI Yogyakarta', TRUE, NOW(), NOW()),
(UUID(), 'Bandung', 'Jawa Barat', 'Kota Bandung - ibu kota Provinsi Jawa Barat', TRUE, NOW(), NOW()),
(UUID(), 'Solo', 'Jawa Tengah', 'Kota Solo / Surakarta', TRUE, NOW(), NOW()),
(UUID(), 'Malang', 'Jawa Timur', 'Kota Malang', TRUE, NOW(), NOW()),
(UUID(), 'Tegal', 'Jawa Tengah', 'Kota Tegal', TRUE, NOW(), NOW()),
(UUID(), 'Pekalongan', 'Jawa Tengah', 'Kota Pekalongan', TRUE, NOW(), NOW());

-- Insert Kota Pemberhentian (Stops) untuk setiap kota
-- Semarang
INSERT INTO mudik_city_stops (id, city_id, name, `order`, is_active, created_at, updated_at)
SELECT 
    UUID(),
    (SELECT id FROM mudik_cities WHERE name = 'Semarang' LIMIT 1),
    stop_name,
    stop_order,
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT 'Terminal Terboyo' AS stop_name, 1 AS stop_order UNION ALL
    SELECT 'Pasar Johar', 2 UNION ALL
    SELECT 'Stasiun Tawang', 3 UNION ALL
    SELECT 'Simpang Lima', 4
) AS stops;

-- Surabaya
INSERT INTO mudik_city_stops (id, city_id, name, `order`, is_active, created_at, updated_at)
SELECT 
    UUID(),
    (SELECT id FROM mudik_cities WHERE name = 'Surabaya' LIMIT 1),
    stop_name,
    stop_order,
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT 'Terminal Bungurasih' AS stop_name, 1 AS stop_order UNION ALL
    SELECT 'Tugu Pahlawan', 2 UNION ALL
    SELECT 'Stasiun Gubeng', 3 UNION ALL
    SELECT 'Tunjungan Plaza', 4
) AS stops;

-- Yogyakarta
INSERT INTO mudik_city_stops (id, city_id, name, `order`, is_active, created_at, updated_at)
SELECT 
    UUID(),
    (SELECT id FROM mudik_cities WHERE name = 'Yogyakarta' LIMIT 1),
    stop_name,
    stop_order,
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT 'Terminal Giwangan' AS stop_name, 1 AS stop_order UNION ALL
    SELECT 'Malioboro', 2 UNION ALL
    SELECT 'Stasiun Tugu', 3 UNION ALL
    SELECT 'Tugu Yogyakarta', 4
) AS stops;

-- Bandung
INSERT INTO mudik_city_stops (id, city_id, name, `order`, is_active, created_at, updated_at)
SELECT 
    UUID(),
    (SELECT id FROM mudik_cities WHERE name = 'Bandung' LIMIT 1),
    stop_name,
    stop_order,
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT 'Terminal Leuwipanjang' AS stop_name, 1 AS stop_order UNION ALL
    SELECT 'Alun-Alun', 2 UNION ALL
    SELECT 'Stasiun Hall', 3 UNION ALL
    SELECT 'Gedung Sate', 4
) AS stops;

-- Solo
INSERT INTO mudik_city_stops (id, city_id, name, `order`, is_active, created_at, updated_at)
SELECT 
    UUID(),
    (SELECT id FROM mudik_cities WHERE name = 'Solo' LIMIT 1),
    stop_name,
    stop_order,
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT 'Terminal Tirtonadi' AS stop_name, 1 AS stop_order UNION ALL
    SELECT 'Pasar Gede', 2 UNION ALL
    SELECT 'Stasiun Balapan', 3 UNION ALL
    SELECT 'Kraton', 4
) AS stops;

-- Malang
INSERT INTO mudik_city_stops (id, city_id, name, `order`, is_active, created_at, updated_at)
SELECT 
    UUID(),
    (SELECT id FROM mudik_cities WHERE name = 'Malang' LIMIT 1),
    stop_name,
    stop_order,
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT 'Terminal Arjosari' AS stop_name, 1 AS stop_order UNION ALL
    SELECT 'Alun-Alun', 2 UNION ALL
    SELECT 'Stasiun Malang', 3
) AS stops;

-- Tegal
INSERT INTO mudik_city_stops (id, city_id, name, `order`, is_active, created_at, updated_at)
SELECT 
    UUID(),
    (SELECT id FROM mudik_cities WHERE name = 'Tegal' LIMIT 1),
    stop_name,
    stop_order,
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT 'Terminal Tegal' AS stop_name, 1 AS stop_order UNION ALL
    SELECT 'Alun-Alun', 2 UNION ALL
    SELECT 'Stasiun Tegal', 3
) AS stops;

-- Pekalongan
INSERT INTO mudik_city_stops (id, city_id, name, `order`, is_active, created_at, updated_at)
SELECT 
    UUID(),
    (SELECT id FROM mudik_cities WHERE name = 'Pekalongan' LIMIT 1),
    stop_name,
    stop_order,
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT 'Terminal Pekalongan' AS stop_name, 1 AS stop_order UNION ALL
    SELECT 'Alun-Alun', 2 UNION ALL
    SELECT 'Stasiun Pekalongan', 3
) AS stops;

-- Insert Bus untuk setiap kota
INSERT INTO mudik_buses (id, bus_number, plate_number, city_id, capacity, available, description, departure_date, is_active, created_at, updated_at)
SELECT 
    UUID(),
    CONCAT('BUS-', ROW_NUMBER() OVER (ORDER BY c.name) + (o.row_num - 1) * 3),
    CONCAT('B ', ROW_NUMBER() OVER (ORDER BY c.name) + (o.row_num - 1) * 3, ' ABC'),
    c.id,
    40,
    40,
    CONCAT('Bus ke ', c.name, ' - Armada '),
    DATE_ADD(CURDATE(), INTERVAL 30 + (o.row_num - 1) * 7 DAY),
    TRUE,
    NOW(),
    NOW()
FROM mudik_cities c
CROSS JOIN (
    SELECT 1 AS row_num UNION ALL
    SELECT 2 UNION ALL
    SELECT 3
) o
WHERE c.is_active = TRUE
LIMIT 24;

-- Selesai
SELECT 'Data dummy Mudik Gratis berhasil diinsert!' AS Status;
SELECT COUNT(*) AS total_kota FROM mudik_cities WHERE is_active = TRUE;
SELECT COUNT(*) AS total_stops FROM mudik_city_stops WHERE is_active = TRUE;
SELECT COUNT(*) AS total_buses FROM mudik_buses WHERE is_active = TRUE;
