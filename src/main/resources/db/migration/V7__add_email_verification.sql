ALTER TABLE users
    ADD COLUMN email_verified boolean NOT NULL DEFAULT false,
    ADD COLUMN email_verification_token varchar(255),
    ADD COLUMN email_verification_expires_at timestamp;

CREATE UNIQUE INDEX idx_users_email_verification_token
    ON users (email_verification_token);

-- Users who registered before email verification existed should not
-- be locked out of their existing accounts.
UPDATE users SET email_verified = true;