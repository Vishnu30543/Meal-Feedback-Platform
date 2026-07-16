-- =============================================
-- V3: Create Dish Tables
-- =============================================

-- Dishes
CREATE TABLE IF NOT EXISTS dishes (
    id                  BIGSERIAL       PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
    display_name        VARCHAR(255),
    slug                VARCHAR(255)    NOT NULL UNIQUE,
    category            VARCHAR(20)     NOT NULL,
    description         TEXT,
    preparation_time    INTEGER,
    difficulty          VARCHAR(20),
    health_benefits     TEXT,
    youtube_url         VARCHAR(500),
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_by          BIGINT,
    updated_by          BIGINT,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dishes_slug ON dishes(slug);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_dishes_status ON dishes(status);
CREATE INDEX IF NOT EXISTS idx_dishes_name ON dishes(name);

-- Dish Images (Gallery)
CREATE TABLE IF NOT EXISTS dish_images (
    id              BIGSERIAL       PRIMARY KEY,
    dish_id         BIGINT          NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    image_url       VARCHAR(500)    NOT NULL,
    display_order   INTEGER         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_dish_images_dish_id ON dish_images(dish_id);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
    id                  BIGSERIAL       PRIMARY KEY,
    dish_id             BIGINT          NOT NULL UNIQUE REFERENCES dishes(id) ON DELETE CASCADE,
    ingredients         TEXT,
    preparation_steps   TEXT,
    preparation_notes   TEXT,
    health_benefits     TEXT,
    youtube_url         VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_recipes_dish_id ON recipes(dish_id);

-- Nutrition (per 100g)
CREATE TABLE IF NOT EXISTS nutrition (
    id              BIGSERIAL       PRIMARY KEY,
    dish_id         BIGINT          NOT NULL UNIQUE REFERENCES dishes(id) ON DELETE CASCADE,
    energy          NUMERIC(8,2),
    carbohydrates   NUMERIC(8,2),
    protein         NUMERIC(8,2),
    fat             NUMERIC(8,2),
    fiber           NUMERIC(8,2)
);

CREATE INDEX IF NOT EXISTS idx_nutrition_dish_id ON nutrition(dish_id);

-- Allergens
CREATE TABLE IF NOT EXISTS allergens (
    id          BIGSERIAL   PRIMARY KEY,
    dish_id     BIGINT      NOT NULL UNIQUE REFERENCES dishes(id) ON DELETE CASCADE,
    milk        BOOLEAN     NOT NULL DEFAULT FALSE,
    gluten      BOOLEAN     NOT NULL DEFAULT FALSE,
    peanut      BOOLEAN     NOT NULL DEFAULT FALSE,
    soy         BOOLEAN     NOT NULL DEFAULT FALSE,
    sesame      BOOLEAN     NOT NULL DEFAULT FALSE,
    tree_nuts   BOOLEAN     NOT NULL DEFAULT FALSE,
    mustard     BOOLEAN     NOT NULL DEFAULT FALSE,
    celery      BOOLEAN     NOT NULL DEFAULT FALSE,
    sulphites   BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_allergens_dish_id ON allergens(dish_id);
