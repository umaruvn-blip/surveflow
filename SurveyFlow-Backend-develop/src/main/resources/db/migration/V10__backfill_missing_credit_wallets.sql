-- Repair users created without a wallet after the previous backfill ran.
-- Wallet creation does not move credits, so it must not create a credit transaction.
INSERT INTO credit_wallets (user_id, balance, reserved_balance, created_at, updated_at)
SELECT u.id, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM credit_wallets w
    WHERE w.user_id = u.id
);
