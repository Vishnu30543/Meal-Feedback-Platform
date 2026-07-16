-- =============================================
-- V9: Seed Data
-- =============================================

-- Sample dishes
INSERT INTO dishes (name, display_name, slug, category, description, preparation_time, difficulty, health_benefits, status, created_at) VALUES
('Bottle Gourd Curry', 'Bottle Gourd Curry', 'bottle-gourd-curry', 'CURRY', 'A light and healthy bottle gourd curry cooked with mild spices.', 30, 'EASY', 'Rich in fiber, low calorie, good for digestion', 'ACTIVE', NOW()),
('Ridge Gourd Curry', 'Ridge Gourd Curry', 'ridge-gourd-curry', 'CURRY', 'Traditional ridge gourd curry with subtle flavors.', 25, 'EASY', 'Rich in dietary fiber, helps in weight loss', 'ACTIVE', NOW()),
('Ash Gourd Curry', 'Ash Gourd Curry', 'ash-gourd-curry', 'CURRY', 'Soft ash gourd curry with gentle seasonings.', 35, 'EASY', 'Cooling effect, aids digestion, rich in vitamins', 'ACTIVE', NOW()),
('Snake Gourd Curry', 'Snake Gourd Curry', 'snake-gourd-curry', 'CURRY', 'Nutritious snake gourd prepared in traditional style.', 30, 'MEDIUM', 'Good for heart health, rich in antioxidants', 'ACTIVE', NOW()),
('Drumstick Curry', 'Drumstick Curry', 'drumstick-curry', 'CURRY', 'Aromatic drumstick curry with fresh herbs.', 40, 'MEDIUM', 'Rich in iron, calcium, and vitamins', 'ACTIVE', NOW()),
('Tomato Soup', 'Fresh Tomato Soup', 'tomato-soup', 'SOUP', 'Warm and comforting tomato soup made from fresh tomatoes.', 20, 'EASY', 'Rich in lycopene, vitamin C, low calorie', 'ACTIVE', NOW()),
('Brown Rice', 'Organic Brown Rice', 'brown-rice', 'RICE', 'Wholesome organic brown rice.', 45, 'EASY', 'High fiber, complex carbohydrates, essential minerals', 'ACTIVE', NOW()),
('Wheat Roti', 'Whole Wheat Roti', 'wheat-roti', 'ROTI', 'Fresh whole wheat roti.', 15, 'EASY', 'Good source of fiber and complex carbs', 'ACTIVE', NOW()),
('Fresh Curd', 'Homemade Fresh Curd', 'fresh-curd', 'CURD', 'Fresh homemade curd set daily.', 480, 'EASY', 'Probiotics, calcium, good for gut health', 'ACTIVE', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Sample nutrition data (per 100g)
INSERT INTO nutrition (dish_id, energy, carbohydrates, protein, fat, fiber) VALUES
((SELECT id FROM dishes WHERE slug = 'bottle-gourd-curry'), 15.0, 3.4, 0.6, 0.1, 0.5),
((SELECT id FROM dishes WHERE slug = 'ridge-gourd-curry'), 20.0, 3.0, 1.2, 0.1, 0.5),
((SELECT id FROM dishes WHERE slug = 'ash-gourd-curry'), 12.0, 3.0, 0.4, 0.1, 0.5),
((SELECT id FROM dishes WHERE slug = 'snake-gourd-curry'), 18.0, 3.3, 0.6, 0.3, 0.6),
((SELECT id FROM dishes WHERE slug = 'drumstick-curry'), 64.0, 8.5, 9.4, 1.4, 3.2),
((SELECT id FROM dishes WHERE slug = 'tomato-soup'), 32.0, 5.8, 1.2, 0.6, 1.0),
((SELECT id FROM dishes WHERE slug = 'brown-rice'), 362.0, 76.2, 7.9, 2.7, 3.5),
((SELECT id FROM dishes WHERE slug = 'wheat-roti'), 297.0, 61.3, 10.6, 1.7, 11.4),
((SELECT id FROM dishes WHERE slug = 'fresh-curd'), 61.0, 3.4, 3.1, 4.3, 0.0)
ON CONFLICT (dish_id) DO NOTHING;

-- Sample allergen data
INSERT INTO allergens (dish_id, milk, gluten, peanut, soy, sesame, tree_nuts, mustard, celery, sulphites) VALUES
((SELECT id FROM dishes WHERE slug = 'bottle-gourd-curry'), false, false, false, false, false, false, true, false, false),
((SELECT id FROM dishes WHERE slug = 'ridge-gourd-curry'), false, false, false, false, false, false, true, false, false),
((SELECT id FROM dishes WHERE slug = 'tomato-soup'), false, false, false, false, false, false, false, true, false),
((SELECT id FROM dishes WHERE slug = 'brown-rice'), false, false, false, false, false, false, false, false, false),
((SELECT id FROM dishes WHERE slug = 'wheat-roti'), false, true, false, false, false, false, false, false, false),
((SELECT id FROM dishes WHERE slug = 'fresh-curd'), true, false, false, false, false, false, false, false, false)
ON CONFLICT (dish_id) DO NOTHING;

-- Sample resident
INSERT INTO residents (resident_code, name, phone, created_at) VALUES
('RES001', 'Sadhaka One', '9876543210', NOW())
ON CONFLICT (resident_code) DO NOTHING;

-- Sample camp for resident
INSERT INTO camps (resident_id, start_date, end_date, duration, active, created_at) VALUES
((SELECT id FROM residents WHERE resident_code = 'RES001'), '2026-07-01', '2026-07-31', 'THIRTY', true, NOW());

-- Sample health tip
INSERT INTO health_tips (title, description, active_date, priority, visible, created_at) VALUES
('Drink Warm Water', 'Start your day with a glass of warm water. It helps in flushing toxins, improving digestion, and boosting metabolism.', CURRENT_DATE, 1, true, NOW());

-- Sample announcement
INSERT INTO announcements (title, description, start_date, end_date, priority, visible, created_at) VALUES
('Welcome to Ashram', 'Welcome to Manthena Satyanarayana Ashram. We wish you a healthy and fulfilling stay. Please follow the daily schedule for best results.', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1, true, NOW());
