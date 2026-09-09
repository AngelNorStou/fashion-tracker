ALTER TABLE users
    ADD COLUMN pending_email varchar(255),
    ADD COLUMN email_change_token varchar(255),
    ADD COLUMN email_change_expires_at timestamp;

CREATE UNIQUE INDEX idx_users_email_change_token
    ON users (email_change_token);