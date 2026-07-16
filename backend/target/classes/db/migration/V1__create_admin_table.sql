-- =============================================
-- V1: Create Admin Table
-- =============================================

CREATE TABLE IF NOT EXISTS admins (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    role            VARCHAR(50)     NOT NULL DEFAULT 'ADMIN',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Insert default admin (password: admin123 — BCrypt encoded)
INSERT INTO admins (name, email, password, role, created_at)
VALUES (
    'Ashram Admin',
    'admin@ashram.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    NOW()
) ON CONFLICT (email) DO NOTHING;
