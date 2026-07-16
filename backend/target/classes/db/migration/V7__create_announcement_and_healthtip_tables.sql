-- =============================================
-- V7: Create Announcement and Health Tip Tables
-- =============================================

CREATE TABLE IF NOT EXISTS announcements (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    image_url       VARCHAR(500),
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    priority        INTEGER         DEFAULT 0,
    visible         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_announcements_visible ON announcements(visible);

CREATE TABLE IF NOT EXISTS health_tips (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    image_url       VARCHAR(500),
    active_date     DATE,
    priority        INTEGER         DEFAULT 0,
    visible         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_tips_active_date ON health_tips(active_date);
CREATE INDEX IF NOT EXISTS idx_health_tips_visible ON health_tips(visible);
