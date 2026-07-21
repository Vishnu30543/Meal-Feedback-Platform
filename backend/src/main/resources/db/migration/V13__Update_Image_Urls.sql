-- Update placeholder example.com URLs to local frontend asset paths

UPDATE dish_images SET image_url = '/images/dishes/oil-free-tomato-dal.png' WHERE image_url LIKE '%tomato-dal-1.jpg';
UPDATE dish_images SET image_url = '/images/dishes/bottle-gourd-curry.png' WHERE image_url LIKE '%bottle-gourd-1.jpg';
UPDATE dish_images SET image_url = '/images/dishes/mixed-sprouts-salad.png' WHERE image_url LIKE '%sprouts-salad.jpg';
UPDATE dish_images SET image_url = '/images/dishes/raw-banana-curry.png' WHERE image_url LIKE '%raw-banana.jpg';
UPDATE dish_images SET image_url = '/images/dishes/dates-and-nuts-laddu.png' WHERE image_url LIKE '%dates-laddu.jpg';
UPDATE dish_images SET image_url = '/images/dishes/ridge-gourd-curry.png' WHERE image_url LIKE '%ridge-gourd.jpg';
UPDATE dish_images SET image_url = '/images/dishes/drumstick-leaves-dal.png' WHERE image_url LIKE '%munagaku-dal.jpg';
UPDATE dish_images SET image_url = '/images/dishes/carrot-beetroot-fry.png' WHERE image_url LIKE '%carrot-beet-1.jpg';
UPDATE dish_images SET image_url = '/images/dishes/brown-rice-vegetable-pulao.png' WHERE image_url LIKE '%brown-rice-pulao.jpg';
UPDATE dish_images SET image_url = '/images/dishes/ragi-malt.png' WHERE image_url LIKE '%ragi-malt.jpg';
