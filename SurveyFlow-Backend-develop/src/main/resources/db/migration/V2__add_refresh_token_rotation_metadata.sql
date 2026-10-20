ALTER TABLE refresh_tokens
    ADD COLUMN revocation_reason VARCHAR(30);

ALTER TABLE refresh_tokens
    ADD COLUMN replaced_by_token_id BIGINT;

ALTER TABLE refresh_tokens
    ADD CONSTRAINT fk_refresh_tokens_replacement
        FOREIGN KEY (replaced_by_token_id) REFERENCES refresh_tokens (id);

CREATE INDEX idx_refresh_tokens_replaced_by_token_id
    ON refresh_tokens (replaced_by_token_id);
