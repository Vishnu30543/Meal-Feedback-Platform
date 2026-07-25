-- =============================================
-- V17: Remove admin1@ashram.com
-- =============================================

DELETE FROM admins
WHERE email = 'admin1@ashram.com';
