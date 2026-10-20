-- Ghi nhận việc hoàn toàn bộ credit còn bị giữ bởi cơ chế survey reward budget cũ.
-- Transaction này giữ cho lịch sử ledger khớp với số dư ví sau migration.
INSERT INTO credit_transactions (
    wallet_id,
    type,
    direction,
    amount,
    balance_before,
    balance_after,
    reference_type,
    description,
    created_at
)
SELECT id,
       'SURVEY_BUDGET_RELEASE',
       'CREDIT',
       reserved_balance,
       balance,
       balance + reserved_balance,
       'SURVEY_REWARD_MIGRATION',
       'Release legacy survey reward reserves',
       CURRENT_TIMESTAMP
FROM credit_wallets
WHERE reserved_balance > 0;

-- Chuyển credit đã giữ về số dư khả dụng vì reward mới do hệ thống chi trả.
UPDATE credit_wallets
SET balance = balance + reserved_balance,
    reserved_balance = 0
WHERE reserved_balance > 0;

DROP TABLE survey_credit_budgets;

ALTER TABLE survey_participations
    DROP COLUMN reward_credit_snapshot;

ALTER TABLE surveys
    DROP COLUMN reward_credit;
