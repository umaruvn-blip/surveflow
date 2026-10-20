CREATE TABLE IF NOT EXISTS user_google_forms_connections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    google_email VARCHAR(255) NOT NULL,
    google_user_id VARCHAR(255),
    access_token VARCHAR(2048) NOT NULL,
    refresh_token VARCHAR(2048),
    token_expires_at TIMESTAMPTZ NOT NULL,
    scope VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_google_forms_connections_user ON user_google_forms_connections(user_id);
