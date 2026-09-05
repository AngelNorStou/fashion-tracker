BEGIN;

-- ============================================================
-- 1. Make the existing main categories top-level
-- ============================================================

UPDATE categories
SET parent_id = NULL
WHERE id IN (
             5,  -- Tops
             6,  -- Bottoms
             7,  -- Dresses & Jumpsuits
             8,  -- Outerwear
             9,  -- Activewear
             10, -- Sleep & Lounge
             11, -- Swimwear
             12, -- Intimates
             13, -- Socks & Hosiery
             14, -- Shoes
             15, -- Bags
             16  -- Accessories
    );


-- ============================================================
-- 2. Make sure all existing subcategories are attached
--    to the correct parent category
-- ============================================================

-- Tops
UPDATE categories
SET parent_id = 5
WHERE id IN (
             17, -- T-Shirts
             18, -- Blouses
             19, -- Tank Tops
             20, -- Sweaters
             21  -- Hoodies
    );

-- Bottoms
UPDATE categories
SET parent_id = 6
WHERE id IN (
             22, -- Jeans
             23, -- Trousers
             24, -- Shorts
             25, -- Skirts
             26, -- Leggings
             27  -- Joggers
    );

-- Dresses & Jumpsuits
UPDATE categories
SET parent_id = 7
WHERE id IN (
             28, -- Casual Dresses
             29, -- Evening Dresses
             30, -- Work Dresses
             31, -- Jumpsuits
             32  -- Rompers
    );

-- Outerwear
UPDATE categories
SET parent_id = 8
WHERE id IN (
             33, -- Jackets
             34, -- Coats
             35, -- Blazers
             36  -- Vests
    );

-- Intimates
UPDATE categories
SET parent_id = 12
WHERE id IN (
             37, -- Bras
             38, -- Underwear
             39, -- Shapewear
             40  -- Camisoles
    );

-- Socks & Hosiery
UPDATE categories
SET parent_id = 13
WHERE id IN (
             41, -- Socks
             42, -- Tights
             43  -- Stockings
    );

-- Shoes
UPDATE categories
SET parent_id = 14
WHERE id IN (
             44, -- Sneakers
             45, -- Boots
             46, -- Sandals
             47, -- Heels
             48, -- Flats
             49, -- Mules
             50  -- Wedges
    );

-- Bags
UPDATE categories
SET parent_id = 15
WHERE id IN (
             51, -- Handbags
             52, -- Crossbody Bags
             53, -- Tote Bags
             54, -- Backpacks
             55, -- Clutches
             56  -- Wallets
    );

-- Accessories
UPDATE categories
SET parent_id = 16
WHERE id IN (
             57, -- Belts
             58, -- Hats
             59, -- Scarves
             60, -- Jewelry
             61  -- Sunglasses
    );


-- ============================================================
-- 3. Remove the old gender-specific "women-" prefix
--    from the existing category slugs
-- ============================================================

UPDATE categories
SET slug = REGEXP_REPLACE(slug, '^women-', '')
WHERE id BETWEEN 5 AND 61;


-- ============================================================
-- 4. Remove the old gender categories
-- ============================================================

DELETE FROM categories
WHERE id IN (
             1, -- Women
             2, -- Men
             3, -- Kids
             4  -- Unisex
    );


-- ============================================================
-- 5. Verify the final structure before committing
-- ============================================================

SELECT
    id,
    name,
    slug,
    parent_id
FROM categories
ORDER BY
    CASE
        WHEN parent_id IS NULL THEN id
        ELSE parent_id
        END,
    parent_id NULLS FIRST,
    id;


-- ============================================================
-- 6. Commit the changes
-- ============================================================

COMMIT;