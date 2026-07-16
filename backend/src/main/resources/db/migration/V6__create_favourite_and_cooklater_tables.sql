-- =============================================
-- V6: Create Favourite and Cook Later Tables
-- =============================================

CREATE TABLE IF NOT EXISTS favourite_dishes (
    id              BIGSERIAL       PRIMARY KEY,
    resident_id     BIGINT          NOT NULL REFERENCES residents(id),
    dish_id         BIGINT          NOT NULL REFERENCES dishes(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (resident_id, dish_id)
);

CREATE INDEX IF NOT EXISTS idx_favourite_dishes_resident ON favourite_dishes(resident_id);
CREATE INDEX IF NOT EXISTS idx_favourite_dishes_dish ON favourite_dishes(dish_id);

CREATE TABLE IF NOT EXISTS cook_later (
    id              BIGSERIAL       PRIMARY KEY,
    resident_id     BIGINT          NOT NULL REFERENCES residents(id),
    dish_id         BIGINT          NOT NULL REFERENCES dishes(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (resident_id, dish_id)
);

CREATE INDEX IF NOT EXISTS idx_cook_later_resident ON cook_later(resident_id);
CREATE INDEX IF NOT EXISTS idx_cook_later_dish ON cook_later(dish_id);
