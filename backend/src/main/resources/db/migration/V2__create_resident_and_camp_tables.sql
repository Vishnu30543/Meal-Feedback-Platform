-- =============================================
-- V2: Create Resident and Camp Tables
-- =============================================

CREATE TABLE IF NOT EXISTS residents (
    id              BIGSERIAL       PRIMARY KEY,
    resident_code   VARCHAR(50)     NOT NULL UNIQUE,
    name            VARCHAR(255),
    phone           VARCHAR(20),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_residents_code ON residents(resident_code);
CREATE INDEX IF NOT EXISTS idx_residents_name ON residents(name);

CREATE TABLE IF NOT EXISTS camps (
    id              BIGSERIAL       PRIMARY KEY,
    resident_id     BIGINT          NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    duration        VARCHAR(20)     NOT NULL,
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_camps_resident_id ON camps(resident_id);
CREATE INDEX IF NOT EXISTS idx_camps_active ON camps(active);
CREATE INDEX IF NOT EXISTS idx_camps_start_date ON camps(start_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_camps_resident_start ON camps(resident_id, start_date);
