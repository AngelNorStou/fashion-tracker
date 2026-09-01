-- ============================================
-- Phase 4: Outfits
-- Create outfits and outfit_items tables
-- ============================================


-- ============================================
-- Outfits
-- ============================================

CREATE TABLE outfits (
                         id BIGSERIAL PRIMARY KEY,

                         user_id BIGINT NOT NULL
                             REFERENCES users(id)
                                 ON DELETE CASCADE,

                         name VARCHAR(100) NOT NULL,

                         created_at TIMESTAMP NOT NULL
                             DEFAULT CURRENT_TIMESTAMP,

                         updated_at TIMESTAMP NOT NULL
                             DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- Outfit Items
-- ============================================

CREATE TABLE outfit_items (
                              outfit_id BIGINT NOT NULL
                                  REFERENCES outfits(id)
                                      ON DELETE CASCADE,

                              clothing_item_id BIGINT NOT NULL
                                  REFERENCES clothing_items(id)
                                      ON DELETE CASCADE,

                              PRIMARY KEY (outfit_id, clothing_item_id)
);


-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_outfits_user_id
    ON outfits(user_id);

CREATE INDEX idx_outfit_items_clothing_item_id
    ON outfit_items(clothing_item_id);