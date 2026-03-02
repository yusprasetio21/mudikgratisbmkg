-- Dummy data for ASN employees
-- Use this to insert sample employee data into the asn_employees table

USE korpri_bmkg;

-- Insert dummy employee: Akbar
INSERT INTO asn_employees (id, nip, nama, gelar_depan, gelar_belakang, jabatan, unit_kerja, alamat, no_hp, email, golongan, is_active, created_at, updated_at)
VALUES (
    UUID(),
    '198902202010121001',
    'Akbar',
    NULL,
    'S.Kom, M.Kom',
    'Pranata Komputer Ahli Muda',
    'BMKG Pusat',
    'Jl. Angkasa I No.2, Kemayoran, Jakarta Pusat',
    '081234567890',
    'akbar@bmkg.go.id',
    'III/c',
    TRUE,
    NOW(),
    NOW()
);

-- Insert more dummy employees (optional)
INSERT INTO asn_employees (id, nip, nama, gelar_depan, gelar_belakang, jabatan, unit_kerja, alamat, no_hp, email, golongan, is_active, created_at, updated_at)
VALUES
(UUID(), '198805152010011001', 'Budi', 'Drs.', 'M.Si', 'Pranata Komputer Ahli Pertama', 'BMKG Wilayah Jakarta', 'Jl. IR H Juanda No.100, Jakarta', '081298765432', 'budi@bmkg.go.id', 'III/d', TRUE, NOW(), NOW()),
(UUID(), '199001012015022002', 'Citra', NULL, 'S.Kom', 'Perekayasa Komputer Pertama', 'BMKG Pusat', 'Jl. Rasuna Said Kav 10, Jakarta', '081345678901', 'citra@bmkg.go.id', 'III/a', TRUE, NOW(), NOW()),
(UUID(), '198712122009011003', 'Dewi', 'Dra.', NULL, 'Analis Kepegawaian', 'BMKG Pusat', 'Jl. Angkasa I No.2, Kemayoran, Jakarta Pusat', '081398712345', 'dewi@bmkg.go.id', 'III/c', TRUE, NOW(), NOW()),
(UUID(), '199203152016032001', 'Eko', NULL, 'S.Kom, MT', 'Pranata Komputer Penyelia', 'BMKG Wilayah Bandung', 'Jl. Purnawarman No.8, Bandung', '081456789012', 'eko@bmkg.go.id', 'IV/a', TRUE, NOW(), NOW());
