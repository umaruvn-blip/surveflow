ALTER TABLE payments ADD COLUMN credit_amount BIGINT;

ALTER TABLE credit_transactions ADD COLUMN payment_id BIGINT;

ALTER TABLE credit_transactions
    ADD CONSTRAINT fk_credit_transactions_payment
    FOREIGN KEY (payment_id) REFERENCES payments (id);

ALTER TABLE credit_transactions
    ADD CONSTRAINT uk_credit_transactions_payment_id UNIQUE (payment_id);

ALTER TABLE payments
    ADD CONSTRAINT uk_payments_transaction_code UNIQUE (transaction_code);

ALTER TABLE payments
    ADD CONSTRAINT ck_payments_credit_amount_positive
    CHECK (credit_amount IS NULL OR credit_amount > 0);

UPDATE payments SET status = 'SUCCESS' WHERE status = 'COMPLETED';

INSERT INTO credit_wallets (user_id, balance, reserved_balance, created_at, updated_at)
SELECT u.id, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM credit_wallets w WHERE w.user_id = u.id);
