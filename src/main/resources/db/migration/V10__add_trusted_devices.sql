CREATE TABLE trusted_devices (
                                 id bigserial PRIMARY KEY,
                                 user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                 device_token_hash varchar(255) NOT NULL UNIQUE,
                                 expires_at timestamp NOT NULL,
                                 created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_trusted_devices_user_id ON trusted_devices (user_id);