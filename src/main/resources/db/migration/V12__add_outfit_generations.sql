CREATE TABLE outfit_generations (
                                    id bigserial PRIMARY KEY,
                                    user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                    outfit_id bigint NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
                                    mannequin_gender varchar(10) NOT NULL,
                                    status varchar(20) NOT NULL,
                                    generated_image_path varchar(500),
                                    error_message varchar(1000),
                                    created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_outfit_generations_user_id ON outfit_generations (user_id);
CREATE INDEX idx_outfit_generations_outfit_id ON outfit_generations (outfit_id);