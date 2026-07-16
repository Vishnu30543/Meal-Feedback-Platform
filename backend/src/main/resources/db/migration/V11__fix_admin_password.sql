-- =============================================
-- V11: Fix Admin Password Hash
-- =============================================

-- The original hash for admin123 was invalid. Updating it to the correct BCrypt hash.
UPDATE admins 
SET password = '$2b$10$vS6TQqzwAgruef3B7zDHTukGB5eC/SwI8Kpxa289b6mJh1ZBXbGsm' 
WHERE email = 'admin@ashram.com';
