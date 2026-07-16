-- =============================================
-- V10: Add Numeric Sadhakas and Admin
-- =============================================

-- Clean up RES001
DELETE FROM camps WHERE resident_id = (SELECT id FROM residents WHERE resident_code = 'RES001');
DELETE FROM residents WHERE resident_code = 'RES001';

-- Seed two numeric Sadhakas
INSERT INTO residents (resident_code, name, phone, created_at) VALUES
('1001', 'Sadhaka Ram', '9876543210', NOW()),
('1002', 'Sadhaka Shyam', '9876543211', NOW())
ON CONFLICT (resident_code) DO NOTHING;

-- Camps for Sadhakas
INSERT INTO camps (resident_id, start_date, end_date, duration, active, created_at) VALUES
((SELECT id FROM residents WHERE resident_code = '1001'), '2026-07-01', '2026-07-31', 'THIRTY', true, NOW()),
((SELECT id FROM residents WHERE resident_code = '1002'), '2026-07-01', '2026-07-31', 'THIRTY', true, NOW());

-- Seed one additional Admin
INSERT INTO admins (name, email, password, role, created_at)
VALUES (
    'Co-Admin',
    'admin2@ashram.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: admin123
    'ADMIN',
    NOW()
) ON CONFLICT (email) DO NOTHING;
