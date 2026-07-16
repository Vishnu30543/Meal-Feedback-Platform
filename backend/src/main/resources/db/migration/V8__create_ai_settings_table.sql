-- =============================================
-- V8: Create AI Settings Table
-- =============================================

CREATE TABLE IF NOT EXISTS ai_settings (
    id                      BIGSERIAL       PRIMARY KEY,
    minimum_ratings         INTEGER         DEFAULT 5,
    ai_enabled              BOOLEAN         NOT NULL DEFAULT FALSE,
    recommendation_type     VARCHAR(50),
    updated_at              TIMESTAMP
);

-- Insert default settings
INSERT INTO ai_settings (minimum_ratings, ai_enabled, updated_at)
VALUES (5, FALSE, NOW())
ON CONFLICT DO NOTHING;
