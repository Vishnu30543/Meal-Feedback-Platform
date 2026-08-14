-- ==========================================================
-- V18: Add Info, Images, and Zero-Oil/Salt/Sugar Recipes for
--      Ash Gourd Curry and Drumstick Curry
-- ==========================================================

-- 1. Insert or Update Ash Gourd Curry
INSERT INTO dishes (name, display_name, slug, category, description, preparation_time, difficulty, health_benefits, youtube_url, status, created_at, updated_at)
VALUES (
    'Ash Gourd Curry',
    'Boodida Gummadikaya Kura (Zero Oil/Salt/Sugar)',
    'ash-gourd-curry',
    'CURRY',
    'A deeply cooling, alkalizing ash gourd curry cooked in its own natural juices with freshly grated coconut, slit green chilies, and dry-roasted cumin seeds—strictly zero oil, zero salt, and zero sugar.',
    30,
    'EASY',
    'Highly alkaline and rich in dietary water and minerals. Cleanses the kidneys, relieves acidity, improves digestion, and supports healthy weight loss.',
    'https://www.youtube.com/results?search_query=manthena+satyanarayana+ash+gourd+curry',
    'ACTIVE',
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    preparation_time = EXCLUDED.preparation_time,
    difficulty = EXCLUDED.difficulty,
    health_benefits = EXCLUDED.health_benefits,
    youtube_url = EXCLUDED.youtube_url,
    status = 'ACTIVE',
    updated_at = NOW();

-- 2. Insert or Update Drumstick Curry
INSERT INTO dishes (name, display_name, slug, category, description, preparation_time, difficulty, health_benefits, youtube_url, status, created_at, updated_at)
VALUES (
    'Drumstick Curry',
    'Munakkaya Tomato Kura (Zero Oil/Salt/Sugar)',
    'drumstick-curry',
    'CURRY',
    'Tender drumstick (moringa) pods cooked in a juicy tomato, onion, and roasted seed gravy, spiced with dry-roasted cumin and coriander—completely free from oil, salt, and sugar.',
    35,
    'MEDIUM',
    'Powerhouse of bio-available iron, calcium, and Vitamin C. Strengthens bone density, regulates blood glucose levels, and boosts overall vitality.',
    'https://www.youtube.com/results?search_query=manthena+satyanarayana+drumstick+curry',
    'ACTIVE',
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    preparation_time = EXCLUDED.preparation_time,
    difficulty = EXCLUDED.difficulty,
    health_benefits = EXCLUDED.health_benefits,
    youtube_url = EXCLUDED.youtube_url,
    status = 'ACTIVE',
    updated_at = NOW();

-- 3. Dish Images
DELETE FROM dish_images WHERE dish_id IN (SELECT id FROM dishes WHERE slug IN ('ash-gourd-curry', 'drumstick-curry'));

INSERT INTO dish_images (dish_id, image_url, display_order)
VALUES 
((SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), '/images/dishes/ash-gourd-curry.png', 0),
((SELECT id FROM dishes WHERE slug = 'drumstick-curry'), '/images/dishes/drumstick-curry.png', 0);

-- 4. Recipes
INSERT INTO recipes (dish_id, ingredients, preparation_steps, preparation_notes, health_benefits, youtube_url)
VALUES (
    (SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'),
    '- 2.5 cups fresh Ash Gourd (Boodida Gummadikaya), peeled, seeds removed, and cut into cubes
- 2 tbsp fresh grated coconut
- 3-4 green chilies, slit (natural spice without salt)
- 1/2 tsp cumin seeds (jeera)
- 1/4 tsp turmeric powder
- 1 sprig fresh curry leaves
- 1 tbsp fresh lemon juice
- 2 tbsp finely chopped fresh coriander leaves',
    '1. Heat a dry, thick-bottomed pot. Add cumin seeds and curry leaves; dry roast for 30 seconds on low flame until aromatic (no oil).
2. Add slit green chilies and turmeric powder, stirring briefly.
3. Add the cubed ash gourd and mix well with the roasted spices.
4. Cover tightly with a lid and cook on low heat. Ash gourd will release its own natural moisture to cook thoroughly.
5. Simmer for 12-15 minutes until the ash gourd pieces are soft and translucent.
6. Add freshly grated coconut and gently stir. Cook uncovered for 2 minutes.
7. Turn off the flame, add fresh lemon juice for natural tanginess, and garnish with chopped coriander leaves before serving.',
    'Strictly Zero Oil, Salt & Sugar: Ash gourd is naturally rich in water. Grated fresh coconut adds gentle natural sweetness and wholesome fats, while green chilies and fresh lemon juice provide balanced flavor without salt.',
    'Alkalizes the digestive system, promotes detoxification, cools body heat, and aids natural weight management.',
    'https://www.youtube.com/results?search_query=manthena+satyanarayana+ash+gourd+curry'
)
ON CONFLICT (dish_id) DO UPDATE SET
    ingredients = EXCLUDED.ingredients,
    preparation_steps = EXCLUDED.preparation_steps,
    preparation_notes = EXCLUDED.preparation_notes,
    health_benefits = EXCLUDED.health_benefits,
    youtube_url = EXCLUDED.youtube_url;

INSERT INTO recipes (dish_id, ingredients, preparation_steps, preparation_notes, health_benefits, youtube_url)
VALUES (
    (SELECT id FROM dishes WHERE slug = 'drumstick-curry'),
    '- 3 fresh green Drumsticks (Munakkaya), cut into 2-inch pieces
- 2 medium ripe tomatoes, finely pureed or chopped
- 1 medium onion, finely chopped
- 3-4 green chilies, slit
- 1 tbsp roasted sesame seed / melon seed powder (or roasted peanut powder)
- 1/2 tsp cumin seeds
- 1/4 tsp mustard seeds
- 1/4 tsp turmeric powder
- 1 sprig curry leaves
- 1/2 tsp crushed ginger
- Fresh coriander leaves for garnish',
    '1. In a pot, cook the drumstick pieces with 1 cup of water and turmeric for 7-8 minutes until tender but intact.
2. In a heavy-bottomed pan, dry roast mustard seeds, cumin seeds, and curry leaves until they splutter (zero oil).
3. Add chopped onions and crushed ginger; dry sauté on medium flame. Sprinkle 1-2 tbsp water if needed to prevent sticking.
4. Add pureed tomatoes and slit green chilies. Simmer for 5-6 minutes until tomatoes break down into a thick sauce.
5. Add the boiled drumsticks along with their remaining cooking water.
6. Stir in the roasted seed powder to create a rich, natural thickness without any added oil.
7. Simmer for 5 minutes so the drumsticks absorb all the herbal and tangy flavors.
8. Turn off the heat and garnish generously with chopped coriander leaves.',
    'Strictly Zero Oil, Salt & Sugar: Fresh drumsticks and ripe tomatoes give natural sweetness and acidity. The roasted seed powder provides creamy richness, replacing the need for cooking oils.',
    'High in calcium and iron for bone and blood health. Helps lower blood sugar and reduces bodily inflammation.',
    'https://www.youtube.com/results?search_query=manthena+satyanarayana+drumstick+curry'
)
ON CONFLICT (dish_id) DO UPDATE SET
    ingredients = EXCLUDED.ingredients,
    preparation_steps = EXCLUDED.preparation_steps,
    preparation_notes = EXCLUDED.preparation_notes,
    health_benefits = EXCLUDED.health_benefits,
    youtube_url = EXCLUDED.youtube_url;

-- 5. Nutrition Data
INSERT INTO nutrition (dish_id, energy, carbohydrates, protein, fat, fiber)
VALUES 
((SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), 38.0, 4.5, 1.2, 1.6, 2.2)
ON CONFLICT (dish_id) DO UPDATE SET
    energy = EXCLUDED.energy,
    carbohydrates = EXCLUDED.carbohydrates,
    protein = EXCLUDED.protein,
    fat = EXCLUDED.fat,
    fiber = EXCLUDED.fiber;

INSERT INTO nutrition (dish_id, energy, carbohydrates, protein, fat, fiber)
VALUES 
((SELECT id FROM dishes WHERE slug = 'drumstick-curry'), 68.0, 8.5, 3.6, 2.2, 4.0)
ON CONFLICT (dish_id) DO UPDATE SET
    energy = EXCLUDED.energy,
    carbohydrates = EXCLUDED.carbohydrates,
    protein = EXCLUDED.protein,
    fat = EXCLUDED.fat,
    fiber = EXCLUDED.fiber;

-- 6. Allergens
INSERT INTO allergens (dish_id, milk, gluten, peanut, soy, sesame, tree_nuts, mustard, celery, sulphites)
VALUES 
((SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), false, false, false, false, false, true, false, false, false)
ON CONFLICT (dish_id) DO UPDATE SET
    milk = EXCLUDED.milk,
    gluten = EXCLUDED.gluten,
    peanut = EXCLUDED.peanut,
    soy = EXCLUDED.soy,
    sesame = EXCLUDED.sesame,
    tree_nuts = EXCLUDED.tree_nuts,
    mustard = EXCLUDED.mustard,
    celery = EXCLUDED.celery,
    sulphites = EXCLUDED.sulphites;

INSERT INTO allergens (dish_id, milk, gluten, peanut, soy, sesame, tree_nuts, mustard, celery, sulphites)
VALUES 
((SELECT id FROM dishes WHERE slug = 'drumstick-curry'), false, false, false, false, true, false, true, false, false)
ON CONFLICT (dish_id) DO UPDATE SET
    milk = EXCLUDED.milk,
    gluten = EXCLUDED.gluten,
    peanut = EXCLUDED.peanut,
    soy = EXCLUDED.soy,
    sesame = EXCLUDED.sesame,
    tree_nuts = EXCLUDED.tree_nuts,
    mustard = EXCLUDED.mustard,
    celery = EXCLUDED.celery,
    sulphites = EXCLUDED.sulphites;
