-- =========================================================
-- UNISURVEY - REQUIRED BASE DATA
-- =========================================================

BEGIN;


-- =========================================================
-- 1. ROLES
-- =========================================================

INSERT INTO roles (
    code,
    name,
    description,
    created_at
)
VALUES
(
    'USER',
    'User',
    'Regular UniSurvey user',
    '2026-08-01 07:00:00+07'
),
(
    'ADMIN',
    'Administrator',
    'System administrator',
    '2026-08-01 07:00:00+07'
);


-- =========================================================
-- 2. USERS
-- =========================================================

INSERT INTO users (
    email,
    password_hash,
    auth_provider,
    provider_user_id,
    status,
    created_at,
    updated_at
)
VALUES
(
    'nguyen.minhanh@gmail.com',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL',
    NULL,
    'ACTIVE',
    '2026-08-01 08:00:00+07',
    '2026-08-01 08:00:00+07'
),
(
    'tran.quocbao@gmail.com',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL',
    NULL,
    'ACTIVE',
    '2026-08-02 09:15:00+07',
    '2026-08-02 09:15:00+07'
),
(
    'le.thuytien@gmail.com',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL',
    NULL,
    'ACTIVE',
    '2026-08-03 10:30:00+07',
    '2026-08-03 10:30:00+07'
),
(
    'pham.hoangnam@gmail.com',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL',
    NULL,
    'ACTIVE',
    '2026-08-04 14:20:00+07',
    '2026-08-04 14:20:00+07'
),
(
    'vo.thanhha@gmail.com',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL',
    NULL,
    'ACTIVE',
    '2026-08-05 16:45:00+07',
    '2026-08-05 16:45:00+07'
),
(
    'admin@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL',
    NULL,
    'ACTIVE',
    '2026-08-01 07:00:00+07',
    '2026-08-01 07:00:00+07'
),
(
    'gia.linh@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:00:00+07', '2026-08-06 08:00:00+07'
),
(
    'minh.khang@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:05:00+07', '2026-08-06 08:05:00+07'
),
(
    'ngoc.mai@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:10:00+07', '2026-08-06 08:10:00+07'
),
(
    'tuan.anh@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:15:00+07', '2026-08-06 08:15:00+07'
),
(
    'kim.ngan@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:20:00+07', '2026-08-06 08:20:00+07'
),
(
    'duc.manh@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:25:00+07', '2026-08-06 08:25:00+07'
),
(
    'thanh.truc@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:30:00+07', '2026-08-06 08:30:00+07'
),
(
    'quang.huy@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:35:00+07', '2026-08-06 08:35:00+07'
),
(
    'bao.chau@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:40:00+07', '2026-08-06 08:40:00+07'
),
(
    'hoang.phuc@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:45:00+07', '2026-08-06 08:45:00+07'
),
(
    'thu.uyen@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:50:00+07', '2026-08-06 08:50:00+07'
),
(
    'gia.bao@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 08:55:00+07', '2026-08-06 08:55:00+07'
),
(
    'ngoc.anh@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 09:00:00+07', '2026-08-06 09:00:00+07'
),
(
    'minh.tri@unisurvey.local',
    '$2y$10$zqlnugn2cCn3.iwoi70pWuVdUBDbzorzvqDL5F8ilEwL7zSU8QTyC',
    'LOCAL', NULL, 'ACTIVE',
    '2026-08-06 09:05:00+07', '2026-08-06 09:05:00+07'
);


-- =========================================================
-- 3. USER ROLES
-- =========================================================

INSERT INTO user_roles (
    user_id,
    role_id,
    created_at
)
VALUES
(1, 1, '2026-08-01 08:10:00+07'),
(2, 1, '2026-08-02 09:25:00+07'),
(3, 1, '2026-08-03 10:40:00+07'),
(4, 1, '2026-08-04 14:30:00+07'),
(5, 1, '2026-08-05 16:55:00+07'),
(6, 2, '2026-08-01 07:00:00+07'),
(7, 1, '2026-08-06 08:00:00+07'),
(8, 1, '2026-08-06 08:05:00+07'),
(9, 1, '2026-08-06 08:10:00+07'),
(10, 1, '2026-08-06 08:15:00+07'),
(11, 1, '2026-08-06 08:20:00+07'),
(12, 1, '2026-08-06 08:25:00+07'),
(13, 1, '2026-08-06 08:30:00+07'),
(14, 1, '2026-08-06 08:35:00+07'),
(15, 1, '2026-08-06 08:40:00+07'),
(16, 1, '2026-08-06 08:45:00+07'),
(17, 1, '2026-08-06 08:50:00+07'),
(18, 1, '2026-08-06 08:55:00+07'),
(19, 1, '2026-08-06 09:00:00+07'),
(20, 1, '2026-08-06 09:05:00+07');


COMMIT;
