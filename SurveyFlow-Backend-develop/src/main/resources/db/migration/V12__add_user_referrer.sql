ALTER TABLE users
    ADD COLUMN referred_by_user_id BIGINT;

ALTER TABLE users
    ADD CONSTRAINT fk_users_referred_by_user
        FOREIGN KEY (referred_by_user_id) REFERENCES users (id);

ALTER TABLE users
    ADD CONSTRAINT ck_users_referred_by_not_self
        CHECK (referred_by_user_id IS NULL OR referred_by_user_id <> id);

CREATE INDEX idx_users_referred_by_user_id
    ON users (referred_by_user_id);
