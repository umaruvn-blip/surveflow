CREATE TABLE IF NOT EXISTS traffic_attributions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    utm_source VARCHAR(100) NOT NULL,
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    landing_page VARCHAR(500),
    referrer_url VARCHAR(500),
    is_converted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_traffic_attributions_source ON traffic_attributions(utm_source);
CREATE INDEX IF NOT EXISTS idx_traffic_attributions_campaign ON traffic_attributions(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_traffic_attributions_user_id ON traffic_attributions(user_id);
CREATE INDEX IF NOT EXISTS idx_traffic_attributions_session_id ON traffic_attributions(session_id);
CREATE INDEX IF NOT EXISTS idx_traffic_attributions_created_at ON traffic_attributions(created_at);
