ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS subscription_price_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_subscription_price'
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT fk_payments_subscription_price
                FOREIGN KEY (subscription_price_id)
                REFERENCES subscription_prices (id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_subscription_price_id
    ON payments (subscription_price_id);
