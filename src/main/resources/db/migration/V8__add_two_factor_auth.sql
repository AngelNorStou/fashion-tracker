ALTER TABLE users
    ADD COLUMN two_factor_enabled boolean NOT NULL DEFAULT false,
    ADD COLUMN two_factor_code varchar(10),
    ADD COLUMN two_factor_code_expires_at timestamp;