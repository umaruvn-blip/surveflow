ALTER TABLE users
    ADD COLUMN referral_code VARCHAR(12);

DO $$
DECLARE
    user_record RECORD;
    generated_code VARCHAR(12);
BEGIN
    FOR user_record IN
        SELECT id
        FROM users
        WHERE referral_code IS NULL
        ORDER BY id
    LOOP
        LOOP
            generated_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
            EXIT WHEN NOT EXISTS (
                SELECT 1
                FROM users
                WHERE referral_code = generated_code
            );
        END LOOP;

        UPDATE users
        SET referral_code = generated_code
        WHERE id = user_record.id;
    END LOOP;
END $$;

ALTER TABLE users
    ALTER COLUMN referral_code SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT uk_users_referral_code UNIQUE (referral_code);
