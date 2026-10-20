ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS user_subscription_id BIGINT,
    ADD COLUMN IF NOT EXISTS subscription_benefit_credits BIGINT,
    ADD COLUMN IF NOT EXISTS subscription_period_started_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS subscription_period_expired_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_payments_subscription_benefit_credits_nonnegative'
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT chk_payments_subscription_benefit_credits_nonnegative
                CHECK (subscription_benefit_credits IS NULL OR subscription_benefit_credits >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_user_subscription'
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT fk_payments_user_subscription
                FOREIGN KEY (user_subscription_id)
                REFERENCES user_subscriptions (id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_user_subscription_id
    ON payments (user_subscription_id);
