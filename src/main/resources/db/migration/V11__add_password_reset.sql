ALTER TABLE users
    ADD COLUMN password_reset_token varchar(255),
    ADD COLUMN password_reset_expires_at timestamp;

CREATE UNIQUE INDEX idx_users_password_reset_token
    ON users (password_reset_token);