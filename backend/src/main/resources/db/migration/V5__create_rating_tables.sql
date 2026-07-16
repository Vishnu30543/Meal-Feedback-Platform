-- =============================================
-- V5: Create Rating Tables
-- =============================================

CREATE TABLE IF NOT EXISTS dish_ratings (
    id              BIGSERIAL       PRIMARY KEY,
    resident_id     BIGINT          NOT NULL REFERENCES residents(id),
    menu_id         BIGINT          NOT NULL REFERENCES daily_menus(id),
    dish_id         BIGINT          NOT NULL REFERENCES dishes(id),
    rating          INTEGER         NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    UNIQUE (resident_id, menu_id, dish_id)
);

CREATE INDEX IF NOT EXISTS idx_dish_ratings_resident ON dish_ratings(resident_id);
CREATE INDEX IF NOT EXISTS idx_dish_ratings_menu ON dish_ratings(menu_id);
CREATE INDEX IF NOT EXISTS idx_dish_ratings_dish ON dish_ratings(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_ratings_rating ON dish_ratings(rating);

CREATE TABLE IF NOT EXISTS overall_lunch_ratings (
    id              BIGSERIAL       PRIMARY KEY,
    resident_id     BIGINT          NOT NULL REFERENCES residents(id),
    menu_id         BIGINT          NOT NULL REFERENCES daily_menus(id),
    rating          INTEGER         NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    UNIQUE (resident_id, menu_id)
);

CREATE INDEX IF NOT EXISTS idx_overall_ratings_resident ON overall_lunch_ratings(resident_id);
CREATE INDEX IF NOT EXISTS idx_overall_ratings_menu ON overall_lunch_ratings(menu_id);
