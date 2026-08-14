-- ============================================================================
-- V19: Seed Sadhakas, Menus, Dishes, and Feedback Ratings (Jul 31 - Aug 14, 2026)
-- Generates full dashboard trend graphs and realistic satvik feedback.
-- ============================================================================

-- 1. Ensure 4 Active Sadhakas exist with camps spanning July to end of August 2026
INSERT INTO residents (resident_code, name, phone, archived, created_at)
VALUES
('1001', 'Sadhaka Ram', '9876543210', false, NOW()),
('1002', 'Sadhaka Shyam', '9876543211', false, NOW()),
('1003', 'Sadhaka Sita', '9876543212', false, NOW()),
('1004', 'Sadhaka Krishna', '9876543213', false, NOW())
ON CONFLICT (resident_code) DO UPDATE SET archived = false;

-- Update or insert camps covering 2026-07-01 through 2026-08-31 for all 4 sadhakas
DELETE FROM camps WHERE resident_id IN (SELECT id FROM residents WHERE resident_code IN ('1001', '1002', '1003', '1004'));

INSERT INTO camps (resident_id, start_date, end_date, duration, active, created_at)
VALUES
((SELECT id FROM residents WHERE resident_code = '1001'), '2026-07-01', '2026-08-31', 'SIXTY', true, NOW()),
((SELECT id FROM residents WHERE resident_code = '1002'), '2026-07-01', '2026-08-31', 'SIXTY', true, NOW()),
((SELECT id FROM residents WHERE resident_code = '1003'), '2026-07-01', '2026-08-31', 'SIXTY', true, NOW()),
((SELECT id FROM residents WHERE resident_code = '1004'), '2026-07-01', '2026-08-31', 'SIXTY', true, NOW());

-- 2. Clean up any existing menus and ratings between 2026-07-31 and 2026-08-14
DELETE FROM dish_ratings WHERE menu_id IN (SELECT id FROM daily_menus WHERE menu_date BETWEEN '2026-07-31' AND '2026-08-14');
DELETE FROM overall_lunch_ratings WHERE menu_id IN (SELECT id FROM daily_menus WHERE menu_date BETWEEN '2026-07-31' AND '2026-08-14');
DELETE FROM daily_menu_dishes WHERE menu_id IN (SELECT id FROM daily_menus WHERE menu_date BETWEEN '2026-07-31' AND '2026-08-14');
DELETE FROM daily_menus WHERE menu_date BETWEEN '2026-07-31' AND '2026-08-14';

-- 3. Create Daily Menus for Jul 31 to Aug 14 (15 Days)
INSERT INTO daily_menus (menu_date, published, remarks, special_day, festival_name, created_by, created_at)
VALUES
('2026-07-31', true, 'Energizing Friday nature-cure lunch with seasonal gourds and sprouts.', false, NULL, 1, '2026-07-31 08:00:00'),
('2026-08-01', true, 'Weekend detox menu featuring alkaline ash gourd curry and brown rice.', false, NULL, 1, '2026-08-01 08:00:00'),
('2026-08-02', true, 'Special Sunday Feast with brown rice pulao and sugar-free dates laddu.', true, 'Sunday Nature Feast', 1, '2026-08-02 08:00:00'),
('2026-08-03', true, 'Monday vitalizing lunch with fresh drumstick curry and tomato dal.', false, NULL, 1, '2026-08-03 08:00:00'),
('2026-08-04', true, 'Digestive balance lunch featuring ridge gourd and probiotic curd.', false, NULL, 1, '2026-08-04 08:00:00'),
('2026-08-05', true, 'Mid-week antioxidant rich lunch with beetroot carrot fry and sprouts.', false, NULL, 1, '2026-08-05 08:00:00'),
('2026-08-06', true, 'High iron nutrition lunch with munagaku dal and ash gourd curry.', false, NULL, 1, '2026-08-06 08:00:00'),
('2026-08-07', true, 'Refreshing lunch with bottle gourd curry and whole wheat phulkas.', false, NULL, 1, '2026-08-07 08:00:00'),
('2026-08-08', true, 'Saturday strength lunch with raw banana curry and ragi malt.', false, NULL, 1, '2026-08-08 08:00:00'),
('2026-08-09', true, 'Sunday special celebration lunch with vegetable pulao and dates laddu.', true, 'Spiritual Sunday Lunch', 1, '2026-08-09 08:00:00'),
('2026-08-10', true, 'Cleansing lunch with tomato soup and ash gourd curry.', false, NULL, 1, '2026-08-10 08:00:00'),
('2026-08-11', true, 'Immunity booster lunch with drumstick curry and mixed sprouts.', false, NULL, 1, '2026-08-11 08:00:00'),
('2026-08-12', true, 'Cooling sattvik lunch with bottle gourd curry and fresh curd.', false, NULL, 1, '2026-08-12 08:00:00'),
('2026-08-13', true, 'Nutritious lunch with ridge gourd curry and oil-free tomato dal.', false, NULL, 1, '2026-08-13 08:00:00'),
('2026-08-14', true, 'Today special nutritious lunch featuring Ash Gourd Curry and Drumstick Curry.', true, 'Ashram Special Lunch', 1, '2026-08-14 08:00:00');

-- 4. Associate Dishes to Daily Menus
-- Jul 31
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-07-31'), (SELECT id FROM dishes WHERE slug = 'oil-free-tomato-dal'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-07-31'), (SELECT id FROM dishes WHERE slug = 'bottle-gourd-curry'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-07-31'), (SELECT id FROM dishes WHERE slug = 'mixed-sprouts-salad'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-07-31'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 4);

-- Aug 01
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-01'), (SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-01'), (SELECT id FROM dishes WHERE slug = 'drumstick-leaves-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-01'), (SELECT id FROM dishes WHERE slug = 'carrot-beetroot-fry'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-01'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 4);

-- Aug 02 (Sunday Feast)
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-02'), (SELECT id FROM dishes WHERE slug = 'brown-rice-vegetable-pulao'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-02'), (SELECT id FROM dishes WHERE slug = 'oil-free-tomato-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-02'), (SELECT id FROM dishes WHERE slug = 'mixed-sprouts-salad'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-02'), (SELECT id FROM dishes WHERE slug = 'dates-and-nuts-laddu'), 'LUNCH', 4);

-- Aug 03
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-03'), (SELECT id FROM dishes WHERE slug = 'drumstick-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-03'), (SELECT id FROM dishes WHERE slug = 'bottle-gourd-curry'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-03'), (SELECT id FROM dishes WHERE slug = 'wheat-roti'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-03'), (SELECT id FROM dishes WHERE slug = 'fresh-curd'), 'LUNCH', 4);

-- Aug 04
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-04'), (SELECT id FROM dishes WHERE slug = 'ridge-gourd-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-04'), (SELECT id FROM dishes WHERE slug = 'oil-free-tomato-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-04'), (SELECT id FROM dishes WHERE slug = 'mixed-sprouts-salad'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-04'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 4);

-- Aug 05
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-05'), (SELECT id FROM dishes WHERE slug = 'carrot-beetroot-fry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-05'), (SELECT id FROM dishes WHERE slug = 'drumstick-leaves-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-05'), (SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-05'), (SELECT id FROM dishes WHERE slug = 'wheat-roti'), 'LUNCH', 4);

-- Aug 06
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-06'), (SELECT id FROM dishes WHERE slug = 'raw-banana-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-06'), (SELECT id FROM dishes WHERE slug = 'oil-free-tomato-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-06'), (SELECT id FROM dishes WHERE slug = 'mixed-sprouts-salad'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-06'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 4);

-- Aug 07
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-07'), (SELECT id FROM dishes WHERE slug = 'bottle-gourd-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-07'), (SELECT id FROM dishes WHERE slug = 'drumstick-curry'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-07'), (SELECT id FROM dishes WHERE slug = 'wheat-roti'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-07'), (SELECT id FROM dishes WHERE slug = 'fresh-curd'), 'LUNCH', 4);

-- Aug 08
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-08'), (SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-08'), (SELECT id FROM dishes WHERE slug = 'carrot-beetroot-fry'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-08'), (SELECT id FROM dishes WHERE slug = 'ragi-malt'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-08'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 4);

-- Aug 09 (Sunday Feast)
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-09'), (SELECT id FROM dishes WHERE slug = 'brown-rice-vegetable-pulao'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-09'), (SELECT id FROM dishes WHERE slug = 'oil-free-tomato-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-09'), (SELECT id FROM dishes WHERE slug = 'mixed-sprouts-salad'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-09'), (SELECT id FROM dishes WHERE slug = 'dates-and-nuts-laddu'), 'LUNCH', 4);

-- Aug 10
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-10'), (SELECT id FROM dishes WHERE slug = 'tomato-soup'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-10'), (SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-10'), (SELECT id FROM dishes WHERE slug = 'wheat-roti'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-10'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 4);

-- Aug 11
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-11'), (SELECT id FROM dishes WHERE slug = 'drumstick-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-11'), (SELECT id FROM dishes WHERE slug = 'oil-free-tomato-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-11'), (SELECT id FROM dishes WHERE slug = 'mixed-sprouts-salad'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-11'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 4);

-- Aug 12
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-12'), (SELECT id FROM dishes WHERE slug = 'bottle-gourd-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-12'), (SELECT id FROM dishes WHERE slug = 'drumstick-leaves-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-12'), (SELECT id FROM dishes WHERE slug = 'wheat-roti'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-12'), (SELECT id FROM dishes WHERE slug = 'fresh-curd'), 'LUNCH', 4);

-- Aug 13
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-13'), (SELECT id FROM dishes WHERE slug = 'ridge-gourd-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-13'), (SELECT id FROM dishes WHERE slug = 'oil-free-tomato-dal'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-13'), (SELECT id FROM dishes WHERE slug = 'carrot-beetroot-fry'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-13'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 4);

-- Aug 14 (Today's Featured Menu)
INSERT INTO daily_menu_dishes (menu_id, dish_id, meal_type, display_order) VALUES
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-14'), (SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), 'LUNCH', 1),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-14'), (SELECT id FROM dishes WHERE slug = 'drumstick-curry'), 'LUNCH', 2),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-14'), (SELECT id FROM dishes WHERE slug = 'oil-free-tomato-dal'), 'LUNCH', 3),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-14'), (SELECT id FROM dishes WHERE slug = 'mixed-sprouts-salad'), 'LUNCH', 4),
((SELECT id FROM daily_menus WHERE menu_date = '2026-08-14'), (SELECT id FROM dishes WHERE slug = 'brown-rice'), 'LUNCH', 5);

-- 5. Seed Dish Ratings and Overall Ratings for All Days

-- Function-like DO block in PL/pgSQL to seed realistic ratings across dates
DO $$
DECLARE
    rec RECORD;
    d_rec RECORD;
    r_rec RECORD;
    r_rating INT;
    r_overall INT;
    sample_comments TEXT[] := ARRAY[
        'Very light, soothing, and easily digestible.',
        'Zero oil preparation tastes wonderfully fresh and energetic!',
        'Loved the natural flavors without salt. Felt so clean after eating.',
        'Fresh coconut and cumin aroma is delightful.',
        'Soft and tender texture, very soothing for digestion.',
        'Tangy and natural flavor, highly satisfying sattvik meal.',
        'Nutrient dense and filling without feeling heavy.'
    ];
    sample_overall TEXT[] := ARRAY[
        'Wholesome and nourishing nature cure lunch. Feeling energized and light.',
        'Excellent lunch today, digestion feels very smooth and peaceful.',
        'High energy sattvik food! Truly appreciate the zero oil cooking technique.',
        'Satisfying and healthy lunch, balance of sprouts and curry was great.'
    ];
    idx INT := 1;
    res_count INT;
BEGIN
    FOR rec IN SELECT id, menu_date FROM daily_menus WHERE menu_date BETWEEN '2026-07-31' AND '2026-08-14' ORDER BY menu_date LOOP
        -- For dates before today, 3 or 4 residents rate. For today (Aug 14), 3 residents rate (1 pending).
        IF rec.menu_date = '2026-08-14' THEN
            res_count := 3;
        ELSE
            res_count := CASE WHEN MOD(EXTRACT(DAY FROM rec.menu_date)::INT, 3) = 0 THEN 3 ELSE 4 END;
        END IF;

        FOR r_rec IN SELECT id, resident_code FROM residents WHERE resident_code IN ('1001', '1002', '1003', '1004') ORDER BY resident_code LIMIT res_count LOOP
            -- Overall lunch rating
            r_overall := 4 + (MOD(idx + r_rec.id::INT, 2)); -- 4 or 5
            IF r_overall > 5 THEN r_overall := 5; END IF;

            INSERT INTO overall_lunch_ratings (resident_id, menu_id, rating, comment, created_at)
            VALUES (
                r_rec.id, 
                rec.id, 
                r_overall, 
                sample_overall[1 + MOD(idx, ARRAY_LENGTH(sample_overall, 1))], 
                rec.menu_date + TIME '13:15:00'
            )
            ON CONFLICT (resident_id, menu_id) DO NOTHING;

            -- Dish ratings for each dish in this menu
            FOR d_rec IN SELECT dish_id FROM daily_menu_dishes WHERE menu_id = rec.id LOOP
                r_rating := 4 + (MOD(idx * 3 + d_rec.dish_id::INT, 2)); -- 4 or 5
                IF MOD(idx, 7) = 0 THEN r_rating := 4; END IF;

                INSERT INTO dish_ratings (resident_id, menu_id, dish_id, rating, comment, created_at)
                VALUES (
                    r_rec.id,
                    rec.id,
                    d_rec.dish_id,
                    r_rating,
                    sample_comments[1 + MOD(idx + d_rec.dish_id::INT, ARRAY_LENGTH(sample_comments, 1))],
                    rec.menu_date + TIME '13:20:00'
                )
                ON CONFLICT (resident_id, menu_id, dish_id) DO NOTHING;
                
                idx := idx + 1;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
