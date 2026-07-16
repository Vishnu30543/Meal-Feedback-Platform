-- =============================================
-- V4: Create Menu Tables
-- =============================================

CREATE TABLE IF NOT EXISTS daily_menus (
    id              BIGSERIAL       PRIMARY KEY,
    menu_date       DATE            NOT NULL UNIQUE,
    published       BOOLEAN         NOT NULL DEFAULT FALSE,
    remarks         TEXT,
    special_day     BOOLEAN         NOT NULL DEFAULT FALSE,
    festival_name   VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_menus_date ON daily_menus(menu_date);
CREATE INDEX IF NOT EXISTS idx_daily_menus_published ON daily_menus(published);

CREATE TABLE IF NOT EXISTS daily_menu_dishes (
    id              BIGSERIAL       PRIMARY KEY,
    menu_id         BIGINT          NOT NULL REFERENCES daily_menus(id) ON DELETE CASCADE,
    dish_id         BIGINT          NOT NULL REFERENCES dishes(id),
    meal_type       VARCHAR(20)     NOT NULL DEFAULT 'LUNCH',
    display_order   INTEGER         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_daily_menu_dishes_menu ON daily_menu_dishes(menu_id);
CREATE INDEX IF NOT EXISTS idx_daily_menu_dishes_dish ON daily_menu_dishes(dish_id);
