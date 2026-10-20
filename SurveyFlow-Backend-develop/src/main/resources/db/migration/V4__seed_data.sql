BEGIN;


-- =========================================================
-- 3. USER PROFILES
-- =========================================================

INSERT INTO user_profiles (
    user_id,
    display_name,
    avatar_url,
    birth_year,
    gender,
    school,
    occupation,
    bio,
    created_at,
    updated_at
)
VALUES
(
    1,
    'Nguyễn Minh Anh',
    'https://example.com/avatars/user1.jpg',
    2004,
    'FEMALE',
    'FPT University',
    'Student',
    'AI student interested in machine learning, Python and data science.',
    '2026-08-01 08:10:00+07',
    '2026-08-01 08:10:00+07'
),
(
    2,
    'Trần Quốc Bảo',
    'https://example.com/avatars/user2.jpg',
    2003,
    'MALE',
    'Duy Tan University',
    'Student',
    'Software-oriented student interested in programming and application development.',
    '2026-08-02 09:25:00+07',
    '2026-08-02 09:25:00+07'
),
(
    3,
    'Lê Thùy Tiên',
    'https://example.com/avatars/user3.jpg',
    2005,
    'FEMALE',
    'University of Education - The University of Danang',
    'Student',
    'Data science student interested in machine learning and Python.',
    '2026-08-03 10:40:00+07',
    '2026-08-03 10:40:00+07'
),
(
    4,
    'Phạm Hoàng Nam',
    'https://example.com/avatars/user4.jpg',
    2002,
    'MALE',
    'FPT University',
    'Student',
    'Student interested in cybersecurity, Linux and software engineering.',
    '2026-08-04 14:30:00+07',
    '2026-08-04 14:30:00+07'
),
(
    5,
    'Võ Thanh Hà',
    'https://example.com/avatars/user5.jpg',
    2004,
    'FEMALE',
    'University of Economics - The University of Danang',
    'Student',
    'Marketing student interested in digital marketing and consumer behavior.',
    '2026-08-05 16:55:00+07',
    '2026-08-05 16:55:00+07'
);


-- =========================================================
-- 5. REFRESH TOKENS
-- =========================================================

INSERT INTO refresh_tokens (
    token_hash,
    user_id,
    expires_at,
    revoked_at,
    created_at
)
VALUES
(
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    1,
    '2026-10-01 08:00:00+07',
    NULL,
    '2026-09-01 08:10:00+07'
),
(
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    2,
    '2026-10-01 09:30:00+07',
    NULL,
    '2026-09-01 09:30:00+07'
),
(
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    3,
    '2026-10-05 10:00:00+07',
    NULL,
    '2026-09-05 10:10:00+07'
);


-- =========================================================
-- 6. INTERESTS
-- =========================================================

INSERT INTO interests (
    name,
    slug,
    description,
    is_active,
    created_at,
    updated_at
)
VALUES
(
    'Artificial Intelligence',
    'artificial-intelligence',
    'Artificial intelligence and intelligent systems',
    TRUE,
    '2026-08-01 07:00:00+07',
    '2026-08-01 07:00:00+07'
),
(
    'Machine Learning',
    'machine-learning',
    'Machine learning algorithms and applications',
    TRUE,
    '2026-08-01 07:05:00+07',
    '2026-08-01 07:05:00+07'
),
(
    'Python',
    'python',
    'Python programming and development',
    TRUE,
    '2026-08-01 07:10:00+07',
    '2026-08-01 07:10:00+07'
),
(
    'Data Science',
    'data-science',
    'Data analysis, statistics and data science',
    TRUE,
    '2026-08-01 07:15:00+07',
    '2026-08-01 07:15:00+07'
),
(
    'Software Engineering',
    'software-engineering',
    'Software development and engineering practices',
    TRUE,
    '2026-08-01 07:20:00+07',
    '2026-08-01 07:20:00+07'
),
(
    'Java',
    'java',
    'Java programming and backend development',
    TRUE,
    '2026-08-01 07:25:00+07',
    '2026-08-01 07:25:00+07'
),
(
    'Cybersecurity',
    'cybersecurity',
    'Cybersecurity and information security',
    TRUE,
    '2026-08-01 07:30:00+07',
    '2026-08-01 07:30:00+07'
),
(
    'Linux',
    'linux',
    'Linux systems and administration',
    TRUE,
    '2026-08-01 07:35:00+07',
    '2026-08-01 07:35:00+07'
),
(
    'Digital Marketing',
    'digital-marketing',
    'Digital marketing and online campaigns',
    TRUE,
    '2026-08-01 07:40:00+07',
    '2026-08-01 07:40:00+07'
),
(
    'Consumer Behavior',
    'consumer-behavior',
    'Consumer behavior and purchasing decisions',
    TRUE,
    '2026-08-01 07:45:00+07',
    '2026-08-01 07:45:00+07'
);


-- =========================================================
-- 7. USER INTERESTS
-- =========================================================

INSERT INTO user_interests (
    user_id,
    interest_id,
    created_at
)
VALUES
-- User 1
(1, 1, '2026-08-01 08:20:00+07'),
(1, 2, '2026-08-01 08:20:00+07'),
(1, 3, '2026-08-01 08:20:00+07'),
(1, 4, '2026-08-01 08:20:00+07'),

-- User 2
(2, 3, '2026-08-02 09:35:00+07'),
(2, 5, '2026-08-02 09:35:00+07'),
(2, 6, '2026-08-02 09:35:00+07'),

-- User 3
(3, 2, '2026-08-03 10:50:00+07'),
(3, 3, '2026-08-03 10:50:00+07'),
(3, 4, '2026-08-03 10:50:00+07'),

-- User 4
(4, 5, '2026-08-04 14:40:00+07'),
(4, 7, '2026-08-04 14:40:00+07'),
(4, 8, '2026-08-04 14:40:00+07'),

-- User 5
(5, 9, '2026-08-05 17:05:00+07'),
(5, 10, '2026-08-05 17:05:00+07');


-- =========================================================
-- 8. SURVEY CATEGORIES
-- =========================================================

INSERT INTO survey_categories (
    name,
    slug,
    description,
    is_active,
    created_at,
    updated_at
)
VALUES
(
    'Technology',
    'technology',
    'Technology and computing related surveys',
    TRUE,
    '2026-08-01 07:00:00+07',
    '2026-08-01 07:00:00+07'
),
(
    'Education',
    'education',
    'Education and student life surveys',
    TRUE,
    '2026-08-01 07:05:00+07',
    '2026-08-01 07:05:00+07'
),
(
    'Cybersecurity',
    'cybersecurity',
    'Cybersecurity and online safety surveys',
    TRUE,
    '2026-08-01 07:10:00+07',
    '2026-08-01 07:10:00+07'
),
(
    'Marketing',
    'marketing',
    'Marketing and consumer behavior surveys',
    TRUE,
    '2026-08-01 07:15:00+07',
    '2026-08-01 07:15:00+07'
);


-- =========================================================
-- 9. SURVEY TAGS
-- =========================================================

INSERT INTO survey_tags (
    name,
    slug,
    created_at
)
VALUES
(
    'AI',
    'ai',
    '2026-08-01 07:00:00+07'
),
(
    'Programming',
    'programming',
    '2026-08-01 07:05:00+07'
),
(
    'Students',
    'students',
    '2026-08-01 07:10:00+07'
),
(
    'Machine Learning',
    'machine-learning',
    '2026-08-01 07:15:00+07'
),
(
    'Cybersecurity',
    'cybersecurity',
    '2026-08-01 07:20:00+07'
),
(
    'Linux',
    'linux',
    '2026-08-01 07:25:00+07'
),
(
    'Marketing',
    'marketing',
    '2026-08-01 07:30:00+07'
),
(
    'Consumer Behavior',
    'consumer-behavior',
    '2026-08-01 07:35:00+07'
),
(
    'Education',
    'education',
    '2026-08-01 07:40:00+07'
),
(
    'Online Learning',
    'online-learning',
    '2026-08-01 07:45:00+07'
);


-- =========================================================
-- 10. SURVEYS
-- =========================================================

INSERT INTO surveys (
    creator_id,
    category_id,
    title,
    description,
    research_purpose,
    participant_instructions,
    provider,
    external_form_url,
    estimated_duration_seconds,
    question_count,
    language,
    contains_sensitive_questions,
    data_usage_notice,
    reward_credit,
    target_response_count,
    current_response_count,
    slot_ttl_seconds,
    status,
    published_at,
    deadline,
    created_at,
    updated_at
)
VALUES
(
    1,
    1,
    'Student Interest in Artificial Intelligence Tools',
    'A survey about how university students use and perceive AI tools in study and daily work.',
    'Understand which AI tools students use, how frequently they use them and the main learning outcomes they expect.',
    'Answer every required question, submit the external form, then copy the completion code back to UniSurvey for verification.',
    'OTHER',
    'https://forms.example.test/ai-tools-students',
    300,
    12,
    'vi',
    FALSE,
    'Responses are used only for aggregated academic analysis and are not shared with advertisers.',
    50,
    100,
    2,
    1800,
    'PUBLISHED',
    '2026-08-12 15:00:00+07',
    '2026-10-15 23:59:59+07',
    '2026-08-12 14:00:00+07',
    '2026-08-20 09:10:00+07'
),
(
    3,
    2,
    'Programming Language Preferences Among Students',
    'A survey exploring programming language preferences and learning habits among university students.',
    'Identify preferred programming languages and the factors influencing students'' learning choices.',
    'Complete the form in one session and return the generated completion code to UniSurvey.',
    'OTHER',
    'https://forms.example.test/programming-preferences',
    240,
    10,
    'vi',
    FALSE,
    'Responses are anonymized before being included in curriculum research reports.',
    40,
    80,
    1,
    1800,
    'PUBLISHED',
    '2026-08-13 16:00:00+07',
    '2026-10-20 23:59:59+07',
    '2026-08-13 15:30:00+07',
    '2026-08-20 10:35:00+07'
),
(
    4,
    3,
    'Cybersecurity Awareness of University Students',
    'A survey about cybersecurity awareness, online safety habits and basic security knowledge.',
    'Measure student awareness of phishing, password hygiene and common online security risks.',
    'Do not provide passwords or account identifiers. Submit the form and enter its completion code on UniSurvey.',
    'OTHER',
    'https://forms.example.test/cybersecurity-awareness',
    420,
    18,
    'vi',
    TRUE,
    'Potentially sensitive security-habit responses are aggregated and retained only for the stated research purpose.',
    60,
    120,
    1,
    2400,
    'PUBLISHED',
    '2026-08-14 12:00:00+07',
    '2026-10-25 23:59:59+07',
    '2026-08-14 11:00:00+07',
    '2026-08-21 09:10:00+07'
),
(
    5,
    4,
    'Social Media Usage and Online Shopping Behavior',
    'A survey about social media usage and how online content influences shopping behavior.',
    'Study how social content affects product discovery and purchase decisions among students.',
    'Do not enter payment details. Submit all required answers and return the completion code to UniSurvey.',
    'OTHER',
    'https://forms.example.test/social-shopping-behavior',
    360,
    15,
    'vi',
    TRUE,
    'Shopping-behavior data is used in aggregate; direct financial identifiers are not requested.',
    45,
    100,
    1,
    1800,
    'PUBLISHED',
    '2026-08-15 17:00:00+07',
    '2026-10-30 23:59:59+07',
    '2026-08-15 16:00:00+07',
    '2026-08-21 19:10:00+07'
),
(
    2,
    2,
    'Online Learning Experience of University Students',
    'A survey about students'' experiences with online learning platforms and digital study tools.',
    'Evaluate usability, engagement and learning barriers across common online learning platforms.',
    'Complete the survey without leaving the form idle, then enter the completion code before your slot expires.',
    'OTHER',
    'https://forms.example.test/online-learning-experience',
    300,
    14,
    'vi',
    FALSE,
    'Responses are analyzed in aggregate to improve digital learning experiences.',
    35,
    150,
    2,
    1800,
    'PUBLISHED',
    '2026-08-16 10:00:00+07',
    '2026-11-01 23:59:59+07',
    '2026-08-16 09:00:00+07',
    '2026-08-24 08:35:00+07'
);


-- =========================================================
-- 10A. SURVEY VERIFICATION CONFIGS
-- =========================================================

INSERT INTO survey_verification_configs (
    survey_id,
    version,
    method,
    min_completion_seconds,
    max_completion_seconds,
    max_attempts,
    valid_from,
    valid_until,
    created_at
)
VALUES
(1, 1, 'EXTERNAL_CODE', 120, 900, 3, '2026-08-12 15:00:00+07', '2026-10-15 23:59:59+07', '2026-08-12 14:00:00+07'),
(2, 1, 'EXTERNAL_CODE', 90, 720, 3, '2026-08-13 16:00:00+07', '2026-10-20 23:59:59+07', '2026-08-13 15:30:00+07'),
(3, 1, 'EXTERNAL_CODE', 180, 1200, 3, '2026-08-14 12:00:00+07', '2026-10-25 23:59:59+07', '2026-08-14 11:00:00+07'),
(4, 1, 'EXTERNAL_CODE', 150, 900, 3, '2026-08-15 17:00:00+07', '2026-10-30 23:59:59+07', '2026-08-15 16:00:00+07'),
(5, 1, 'EXTERNAL_CODE', 120, 900, 3, '2026-08-16 10:00:00+07', '2026-11-01 23:59:59+07', '2026-08-16 09:00:00+07');


-- =========================================================
-- 11. SURVEY TAG MAPPINGS
-- =========================================================

INSERT INTO survey_tag_mappings (
    survey_id,
    tag_id,
    created_at
)
VALUES
-- Survey 1
(1, 1, '2026-08-12 14:10:00+07'),
(1, 3, '2026-08-12 14:10:00+07'),
(1, 4, '2026-08-12 14:10:00+07'),

-- Survey 2 (creator user 3 is excluded)
(2, 2, '2026-08-13 15:40:00+07'),
(2, 3, '2026-08-13 15:40:00+07'),

-- Survey 3
(3, 3, '2026-08-14 11:10:00+07'),
(3, 5, '2026-08-14 11:10:00+07'),
(3, 6, '2026-08-14 11:10:00+07'),

-- Survey 4
(4, 3, '2026-08-15 16:10:00+07'),
(4, 7, '2026-08-15 16:10:00+07'),
(4, 8, '2026-08-15 16:10:00+07'),

-- Survey 5
(5, 3, '2026-08-16 09:10:00+07'),
(5, 9, '2026-08-16 09:10:00+07'),
(5, 10, '2026-08-16 09:10:00+07');


-- =========================================================
-- 12. SURVEY TARGETING
-- =========================================================
--
-- V1 uses birth year, not age.
--
-- 2001 - 2008 roughly represents students aged
-- 18 - 25 in 2026.
--
-- occupation = Student because profiles use the
-- standardized value "Student".
-- =========================================================

INSERT INTO survey_targeting (
    survey_id,
    min_birth_year,
    max_birth_year,
    gender,
    school,
    occupation,
    created_at,
    updated_at
)
VALUES
(
    1,
    2001,
    2008,
    NULL,
    NULL,
    'Student',
    '2026-08-12 14:05:00+07',
    '2026-08-12 14:05:00+07'
),
(
    2,
    2001,
    2008,
    NULL,
    NULL,
    'Student',
    '2026-08-13 15:35:00+07',
    '2026-08-13 15:35:00+07'
),
(
    3,
    1999,
    2008,
    NULL,
    NULL,
    'Student',
    '2026-08-14 11:05:00+07',
    '2026-08-14 11:05:00+07'
),
(
    4,
    1999,
    2008,
    NULL,
    NULL,
    'Student',
    '2026-08-15 16:05:00+07',
    '2026-08-15 16:05:00+07'
),
(
    5,
    1999,
    2008,
    NULL,
    NULL,
    'Student',
    '2026-08-16 09:05:00+07',
    '2026-08-16 09:05:00+07'
);


-- =========================================================
-- 13. SURVEY TARGET INTERESTS
-- =========================================================

INSERT INTO survey_target_interests (
    survey_id,
    interest_id,
    created_at
)
VALUES
-- Survey 1
(1, 1, '2026-08-12 14:06:00+07'),
(1, 2, '2026-08-12 14:06:00+07'),
(1, 3, '2026-08-12 14:06:00+07'),

-- Survey 2
(2, 5, '2026-08-13 15:36:00+07'),
(2, 6, '2026-08-13 15:36:00+07'),
(2, 3, '2026-08-13 15:36:00+07'),

-- Survey 3
(3, 7, '2026-08-14 11:06:00+07'),
(3, 8, '2026-08-14 11:06:00+07'),

-- Survey 4
(4, 9, '2026-08-15 16:06:00+07'),
(4, 10, '2026-08-15 16:06:00+07'),

-- Survey 5
(5, 3, '2026-08-16 09:06:00+07'),
(5, 5, '2026-08-16 09:06:00+07');


-- =========================================================
-- 14. SURVEY PARTICIPATIONS
-- =========================================================
--
-- Participation IDs after RESTART IDENTITY:
--
-- 1  User 2 -> Survey 1 -> 252 sec -> reward
-- 2  User 1 -> Survey 5 -> 225 sec -> reward
-- 3  User 2 -> Survey 2 -> 198 sec -> reward
-- 4  User 4 -> Survey 5 -> 18 sec  -> rejected
-- 5  User 3 -> Survey 1 -> 320 sec -> reward
-- 6  User 3 -> Survey 5 -> 450 sec -> reward
-- 7  User 2 -> Survey 3 -> 402 sec -> reward
-- 8  User 4 -> Survey 1 -> 15 sec  -> rejected
-- 9  User 4 -> Survey 4 -> 295 sec -> reward
-- 10 User 5 -> Survey 5 -> 22 sec  -> rejected
--
-- Survey creators never participate in their own surveys.
-- =========================================================

INSERT INTO survey_participations (
    public_id,
    survey_id,
    user_id,
    verification_config_version,
    reward_credit_snapshot,
    eligibility_snapshot,
    verification_code_hash,
    status,
    slot_reserved_at,
    slot_expires_at,
    submitted_at,
    verified_at,
    rejected_at,
    verification_attempt_count,
    failure_reason,
    created_at,
    updated_at
)
VALUES
(
    'c1a7649e-31f0-4a0b-8a11-3a903cf11001',
    1,
    2,
    1,
    50,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation"],"matchingScore":0.45}',
    'b8caf93aae884e284ec9e26ba0a5af11f31ad86b4d7ddfea90e025642808708d',
    'VERIFIED',
    '2026-08-20 09:10:00+07',
    '2026-08-20 09:40:00+07',
    '2026-08-20 09:14:12+07',
    '2026-08-20 09:15:00+07',
    NULL,
    1,
    NULL,
    '2026-08-20 09:10:00+07',
    '2026-08-20 09:16:00+07'
),
(
    'b5d8132c-8baf-4e4f-9122-55b5acb22002',
    5,
    1,
    1,
    35,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation"],"matchingScore":0.76}',
    '47de4e45ef4df8e2d1bba00e5c22d282037397daedf1094c04d5eb3c0d445152',
    'VERIFIED',
    '2026-08-21 13:20:00+07',
    '2026-08-21 13:50:00+07',
    '2026-08-21 13:23:45+07',
    '2026-08-21 13:25:00+07',
    NULL,
    1,
    NULL,
    '2026-08-21 13:20:00+07',
    '2026-08-21 13:26:00+07'
),
(
    'e4307ab1-f72b-4d1a-a333-9ce5d4433003',
    2,
    2,
    1,
    40,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation","interests"],"matchingScore":0.93}',
    'f8f780cdf6a7e4f2f7fefd6b7de88d1de332b7a7d282325e2cc1cd91011adb01',
    'VERIFIED',
    '2026-08-20 14:00:00+07',
    '2026-08-20 14:30:00+07',
    '2026-08-20 14:03:18+07',
    '2026-08-20 14:05:00+07',
    NULL,
    1,
    NULL,
    '2026-08-20 14:00:00+07',
    '2026-08-20 14:06:00+07'
),
(
    '902fd621-0f25-43c7-b444-1740f9944004',
    5,
    4,
    1,
    35,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation","interests"],"matchingScore":0.82}',
    'ef6e627fe802a80d7cbc8141b3fb335de9c10f4196de738d398501e8abea44c1',
    'REJECTED',
    '2026-08-22 10:00:00+07',
    '2026-08-22 10:30:00+07',
    '2026-08-22 10:00:18+07',
    NULL,
    '2026-08-22 10:01:00+07',
    1,
    'COMPLETION_BELOW_MINIMUM',
    '2026-08-22 10:00:00+07',
    '2026-08-22 10:01:00+07'
),
(
    '63d70cfa-b195-47ae-8555-8d1e55655005',
    1,
    3,
    1,
    50,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation","interests"],"matchingScore":0.89}',
    'd3936b33309966ab067e21e0a39293b5beb629948a9fbff12311ebb4941e9ff6',
    'VERIFIED',
    '2026-08-20 15:00:00+07',
    '2026-08-20 15:30:00+07',
    '2026-08-20 15:05:20+07',
    '2026-08-20 15:06:00+07',
    NULL,
    1,
    NULL,
    '2026-08-20 15:00:00+07',
    '2026-08-20 15:07:00+07'
),
(
    '7a92e1b8-6d4c-491f-9666-73aacd666006',
    5,
    3,
    1,
    35,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation","interests"],"matchingScore":0.74}',
    'ee7fe101dfd17c87e3e66aaf728e7f2f2ff2bd674e55b22c7650739e26895c22',
    'VERIFIED',
    '2026-08-22 14:00:00+07',
    '2026-08-22 14:30:00+07',
    '2026-08-22 14:07:30+07',
    '2026-08-22 14:08:00+07',
    NULL,
    1,
    NULL,
    '2026-08-22 14:00:00+07',
    '2026-08-22 14:09:00+07'
),
(
    '1984ad35-c8ee-4a26-a777-4f2b8e777007',
    3,
    2,
    1,
    60,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation"],"matchingScore":0.18}',
    '2d4afcca0c1be01a6f1cb6cfad0ffe856926b16d2e8409ab122553445f4cfa45',
    'VERIFIED',
    '2026-08-21 09:00:00+07',
    '2026-08-21 09:30:00+07',
    '2026-08-21 09:06:42+07',
    '2026-08-21 09:08:00+07',
    NULL,
    1,
    NULL,
    '2026-08-21 09:00:00+07',
    '2026-08-21 09:09:00+07'
),
(
    'db71c604-577f-4bb9-8888-0d6b7a888008',
    1,
    4,
    1,
    50,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation"],"matchingScore":0.18}',
    '00123bd747552e3eec4e6480f3f9a1a9b11f326dbd03b68e46858b48464761ba',
    'REJECTED',
    '2026-08-21 11:00:00+07',
    '2026-08-21 11:30:00+07',
    '2026-08-21 11:00:15+07',
    NULL,
    '2026-08-21 11:01:00+07',
    1,
    'COMPLETION_BELOW_MINIMUM',
    '2026-08-21 11:00:00+07',
    '2026-08-21 11:01:00+07'
),
(
    '45e90fb2-a160-4c8d-9999-64c8f4999009',
    4,
    4,
    1,
    45,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation"],"matchingScore":0.10}',
    'fa5f36cc49ce71e5346222edf3f3ae370a362aa984b4a2251acf88f4780bc581',
    'VERIFIED',
    '2026-08-21 19:00:00+07',
    '2026-08-21 19:30:00+07',
    '2026-08-21 19:04:55+07',
    '2026-08-21 19:06:00+07',
    NULL,
    1,
    NULL,
    '2026-08-21 19:00:00+07',
    '2026-08-21 19:07:00+07'
),
(
    'f08a321d-9c63-42e5-a010-15f76aa10010',
    5,
    5,
    1,
    35,
    JSON '{"eligible":true,"matchedCriteria":["birthYear","occupation"],"matchingScore":0.10}',
    'fb8020b3dc1b95526a1230f651fbd68087abf5942ffde13128f353c0ad293198',
    'REJECTED',
    '2026-08-23 08:00:00+07',
    '2026-08-23 08:30:00+07',
    '2026-08-23 08:00:22+07',
    NULL,
    '2026-08-23 08:01:00+07',
    1,
    'COMPLETION_BELOW_MINIMUM',
    '2026-08-23 08:00:00+07',
    '2026-08-23 08:01:00+07'
);


-- =========================================================
-- 15. AI MATCHING RESULTS
-- =========================================================

INSERT INTO matching_results (
    survey_id,
    user_id,
    score,
    model_version,
    explanation,
    created_at
)
VALUES

-- Survey 1 (creator user 1 is excluded)
(
    1,
    2,
    0.4500,
    'matching-v1',
    'Partial match: Python overlaps with the survey target interests, while Artificial Intelligence and Machine Learning are not in the user profile.',
    '2026-08-20 08:00:00+07'
),
(
    1,
    3,
    0.8900,
    'matching-v1',
    'Strong match: Machine Learning and Python overlap with the survey target interests.',
    '2026-08-20 08:00:00+07'
),
(
    1,
    4,
    0.1800,
    'matching-v1',
    'Low match: the user has no direct overlap with the main AI and Machine Learning target interests.',
    '2026-08-20 08:00:00+07'
),
(
    1,
    5,
    0.1000,
    'matching-v1',
    'Very limited match: the user interests are primarily related to marketing rather than AI.',
    '2026-08-20 08:00:00+07'
),

-- Survey 2
(
    2,
    1,
    0.5200,
    'matching-v1',
    'Moderate match: Python overlaps with the target interests, while Software Engineering and Java are not explicit user interests.',
    '2026-08-20 08:05:00+07'
),
(
    2,
    2,
    0.9300,
    'matching-v1',
    'Strong match: Software Engineering, Java and Python overlap directly with the survey target interests.',
    '2026-08-20 08:05:00+07'
),
(
    2,
    4,
    0.7200,
    'matching-v1',
    'Good match: Software Engineering overlaps directly with the survey target interests.',
    '2026-08-20 08:05:00+07'
),

-- Survey 3 (creator user 4 is excluded)
(
    3,
    1,
    0.1200,
    'matching-v1',
    'Low match: the user interests are primarily focused on AI and data science.',
    '2026-08-20 08:10:00+07'
),
(
    3,
    2,
    0.1800,
    'matching-v1',
    'Low match: no direct Cybersecurity or Linux interest is present.',
    '2026-08-20 08:10:00+07'
),
(
    3,
    3,
    0.1500,
    'matching-v1',
    'Low match: the user profile is mainly focused on data science and machine learning.',
    '2026-08-20 08:10:00+07'
),

-- Survey 4 (creator user 5 is excluded)
(
    4,
    1,
    0.0800,
    'matching-v1',
    'Very limited match: the user interests are primarily technology and AI related.',
    '2026-08-20 08:15:00+07'
),
(
    4,
    4,
    0.1000,
    'matching-v1',
    'Very limited match: the user interests are primarily cybersecurity and software engineering.',
    '2026-08-20 08:15:00+07'
),

-- Survey 5 (creator user 2 is excluded)
(
    5,
    1,
    0.7600,
    'matching-v1',
    'Good match: Python overlaps directly with the survey target interests.',
    '2026-08-20 08:20:00+07'
),
(
    5,
    3,
    0.7400,
    'matching-v1',
    'Good match: Python directly overlaps with the survey target interests.',
    '2026-08-20 08:20:00+07'
),
(
    5,
    4,
    0.8200,
    'matching-v1',
    'Good match: Software Engineering directly overlaps with the survey target interests.',
    '2026-08-20 08:20:00+07'
),
(
    5,
    5,
    0.1000,
    'matching-v1',
    'Very limited match: the user interests are focused on marketing rather than Python or Software Engineering.',
    '2026-08-20 08:20:00+07'
);


-- =========================================================
-- 16. AI QUALITY SCORES
-- =========================================================
--
-- Current AI Quality Check uses completion time only.
--
-- Very short:
--   15 sec -> VERY_LOW
--   18 sec -> VERY_LOW
--   22 sec -> VERY_LOW
--
-- Reasonable:
--   198 - 450 sec -> GOOD
-- =========================================================

INSERT INTO quality_scores (
    participation_id,
    completion_seconds,
    score,
    status,
    model_version,
    created_at
)
VALUES
(
    1,
    252,
    0.8800,
    'GOOD',
    'quality-v1-time',
    '2026-08-20 09:15:00+07'
),
(
    2,
    225,
    0.8200,
    'GOOD',
    'quality-v1-time',
    '2026-08-21 13:25:00+07'
),
(
    3,
    198,
    0.7600,
    'GOOD',
    'quality-v1-time',
    '2026-08-20 14:05:00+07'
),
(
    4,
    18,
    0.1500,
    'VERY_LOW',
    'quality-v1-time',
    '2026-08-22 10:01:00+07'
),
(
    5,
    320,
    0.9400,
    'GOOD',
    'quality-v1-time',
    '2026-08-20 15:06:00+07'
),
(
    6,
    450,
    0.9800,
    'GOOD',
    'quality-v1-time',
    '2026-08-22 14:08:00+07'
),
(
    7,
    402,
    0.9700,
    'GOOD',
    'quality-v1-time',
    '2026-08-21 09:08:00+07'
),
(
    8,
    15,
    0.1000,
    'VERY_LOW',
    'quality-v1-time',
    '2026-08-21 11:01:00+07'
),
(
    9,
    295,
    0.9100,
    'GOOD',
    'quality-v1-time',
    '2026-08-21 19:06:00+07'
),
(
    10,
    22,
    0.1200,
    'VERY_LOW',
    'quality-v1-time',
    '2026-08-23 08:01:00+07'
);


-- =========================================================
-- 17. SURVEY CREDIT BUDGETS
-- =========================================================
--
-- reserved_credit is zero because every seeded slot is terminal.
-- distributed_credit contains rewards paid to VERIFIED participations.
-- released_credit records credit released by rejected reservations.
-- =========================================================

INSERT INTO survey_credit_budgets (
    survey_id,
    total_credit,
    reserved_credit,
    distributed_credit,
    released_credit,
    status,
    created_at,
    updated_at
)
VALUES
(
    1,
    5000,
    0,
    100,
    50,
    'ACTIVE',
    '2026-08-12 14:00:00+07',
    '2026-08-20 09:16:00+07'
),
(
    2,
    3200,
    0,
    40,
    0,
    'ACTIVE',
    '2026-08-13 15:30:00+07',
    '2026-08-20 14:06:00+07'
),
(
    3,
    7200,
    0,
    60,
    0,
    'ACTIVE',
    '2026-08-14 11:00:00+07',
    '2026-08-21 09:09:00+07'
),
(
    4,
    4500,
    0,
    45,
    0,
    'ACTIVE',
    '2026-08-15 16:00:00+07',
    '2026-08-21 19:07:00+07'
),
(
    5,
    5250,
    0,
    70,
    70,
    'ACTIVE',
    '2026-08-16 09:00:00+07',
    '2026-08-22 14:09:00+07'
);


-- =========================================================
-- 18. LEVELS
-- =========================================================

INSERT INTO levels (
    level_number,
    name,
    min_xp,
    created_at
)
VALUES
(
    1,
    'Beginner',
    0,
    '2026-08-01 07:00:00+07'
),
(
    2,
    'Explorer',
    100,
    '2026-08-01 07:00:00+07'
),
(
    3,
    'Active Member',
    250,
    '2026-08-01 07:00:00+07'
),
(
    4,
    'Contributor',
    500,
    '2026-08-01 07:00:00+07'
),
(
    5,
    'Expert',
    1000,
    '2026-08-01 07:00:00+07'
);


-- =========================================================
-- 19. USER PROGRESS
-- =========================================================
--
-- Level IDs after RESTART IDENTITY:
--   1 = Beginner
--   2 = Explorer
--   3 = Active Member
--   4 = Contributor
--   5 = Expert
-- =========================================================

INSERT INTO user_progress (
    user_id,
    level_id,
    total_xp,
    created_at,
    updated_at
)
VALUES
(
    1,
    3,
    320,
    '2026-08-01 08:20:00+07',
    '2026-08-24 09:00:00+07'
),
(
    2,
    2,
    180,
    '2026-08-02 09:35:00+07',
    '2026-08-22 10:30:00+07'
),
(
    3,
    3,
    410,
    '2026-08-03 10:50:00+07',
    '2026-08-24 09:15:00+07'
),
(
    4,
    4,
    620,
    '2026-08-04 14:40:00+07',
    '2026-08-24 11:00:00+07'
),
(
    5,
    2,
    150,
    '2026-08-05 17:05:00+07',
    '2026-08-23 09:00:00+07'
);


-- =========================================================
-- 20. BADGES
-- =========================================================

INSERT INTO badges (
    code,
    name,
    description,
    icon_url,
    is_active,
    created_at,
    updated_at
)
VALUES
(
    'FIRST_SURVEY',
    'First Survey',
    'Completed the first survey.',
    'https://example.com/badges/first-survey.png',
    TRUE,
    '2026-08-01 07:00:00+07',
    '2026-08-01 07:00:00+07'
),
(
    'ACTIVE_PARTICIPANT',
    'Active Participant',
    'Completed multiple surveys.',
    'https://example.com/badges/active-participant.png',
    TRUE,
    '2026-08-01 07:05:00+07',
    '2026-08-01 07:05:00+07'
),
(
    'SURVEY_CREATOR',
    'Survey Creator',
    'Created a survey on UniSurvey.',
    'https://example.com/badges/survey-creator.png',
    TRUE,
    '2026-08-01 07:10:00+07',
    '2026-08-01 07:10:00+07'
);


-- =========================================================
-- 21. USER BADGES
-- =========================================================

INSERT INTO user_badges (
    user_id,
    badge_id,
    earned_at,
    source_type,
    source_id
)
VALUES
(
    1,
    1,
    '2026-08-21 13:26:00+07',
    'SURVEY_PARTICIPATION',
    2
),
(
    1,
    3,
    '2026-08-12 15:05:00+07',
    'SURVEY',
    1
),
(
    2,
    1,
    '2026-08-20 09:16:00+07',
    'SURVEY_PARTICIPATION',
    1
),
(
    2,
    2,
    '2026-08-21 09:09:00+07',
    'SURVEY_PARTICIPATION',
    7
),
(
    2,
    3,
    '2026-08-16 10:05:00+07',
    'SURVEY',
    5
),
(
    3,
    1,
    '2026-08-20 15:07:00+07',
    'SURVEY_PARTICIPATION',
    5
),
(
    3,
    2,
    '2026-08-22 14:09:00+07',
    'SURVEY_PARTICIPATION',
    6
),
(
    3,
    3,
    '2026-08-13 16:05:00+07',
    'SURVEY',
    2
),
(
    4,
    1,
    '2026-08-21 19:07:00+07',
    'SURVEY_PARTICIPATION',
    9
),
(
    4,
    3,
    '2026-08-14 12:05:00+07',
    'SURVEY',
    3
),
(
    5,
    3,
    '2026-08-15 17:05:00+07',
    'SURVEY',
    4
);


-- =========================================================
-- 22. SUBSCRIPTION PLANS
-- =========================================================

INSERT INTO subscription_plans (
    code,
    name,
    description,
    price,
    duration_days,
    survey_limit,
    ai_usage_limit,
    priority_boost_enabled,
    advanced_analytics_enabled,
    is_active,
    created_at,
    updated_at
)
VALUES
(
    'FREE',
    'Free',
    'Basic free subscription.',
    0,
    NULL,
    5,
    20,
    FALSE,
    FALSE,
    TRUE,
    '2026-08-01 07:00:00+07',
    '2026-08-01 07:00:00+07'
),
(
    'STUDENT',
    'Student',
    'Subscription designed for university students.',
    49000,
    30,
    30,
    100,
    TRUE,
    FALSE,
    TRUE,
    '2026-08-01 07:05:00+07',
    '2026-08-01 07:05:00+07'
),
(
    'PRO',
    'Pro',
    'Premium subscription with higher survey and AI usage limits.',
    99000,
    30,
    100,
    500,
    TRUE,
    TRUE,
    TRUE,
    '2026-08-01 07:10:00+07',
    '2026-08-01 07:10:00+07'
);


-- =========================================================
-- 23. USER SUBSCRIPTIONS
-- =========================================================

INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    started_at,
    expired_at,
    cancelled_at,
    created_at,
    updated_at
)
VALUES
(
    1,
    2,
    'ACTIVE',
    '2026-09-01 08:00:00+07',
    '2026-09-30 23:59:59+07',
    NULL,
    '2026-09-01 08:00:00+07',
    '2026-09-01 08:00:00+07'
),
(
    2,
    1,
    'ACTIVE',
    '2026-08-02 09:30:00+07',
    NULL,
    NULL,
    '2026-08-02 09:30:00+07',
    '2026-08-02 09:30:00+07'
),
(
    3,
    3,
    'ACTIVE',
    '2026-09-05 10:00:00+07',
    '2026-10-04 23:59:59+07',
    NULL,
    '2026-09-05 10:00:00+07',
    '2026-09-05 10:00:00+07'
),
(
    4,
    1,
    'ACTIVE',
    '2026-08-04 14:25:00+07',
    NULL,
    NULL,
    '2026-08-04 14:25:00+07',
    '2026-08-04 14:25:00+07'
),
(
    5,
    2,
    'ACTIVE',
    '2026-09-10 16:00:00+07',
    '2026-10-09 23:59:59+07',
    NULL,
    '2026-09-10 16:00:00+07',
    '2026-09-10 16:00:00+07'
);


-- =========================================================
-- 24. CREDIT WALLETS
-- =========================================================
--
-- Wallet IDs after RESTART IDENTITY:
--
-- Balances contain only the VERIFIED survey rewards seeded below.
-- =========================================================

INSERT INTO credit_wallets (
    user_id,
    balance,
    reserved_balance,
    created_at,
    updated_at
)
VALUES
(
    1,
    35,
    0,
    '2026-08-01 08:25:00+07',
    '2026-08-21 13:26:00+07'
),
(
    2,
    150,
    0,
    '2026-08-02 09:40:00+07',
    '2026-08-21 09:09:00+07'
),
(
    3,
    85,
    0,
    '2026-08-03 10:55:00+07',
    '2026-08-22 14:09:00+07'
),
(
    4,
    45,
    0,
    '2026-08-04 14:45:00+07',
    '2026-08-21 19:07:00+07'
),
(
    5,
    0,
    0,
    '2026-08-05 17:10:00+07',
    '2026-08-05 17:10:00+07'
);


-- =========================================================
-- 25. PAYMENTS
-- =========================================================

INSERT INTO payments (
    user_id,
    type,
    provider,
    status,
    amount,
    currency,
    provider_payment_id,
    transaction_code,
    description,
    paid_at,
    failed_at,
    cancelled_at,
    refunded_at,
    created_at,
    updated_at
)
VALUES
(
    1,
    'SUBSCRIPTION',
    'MOMO',
    'COMPLETED',
    49000,
    'VND',
    'MOMO-DEMO-PAY-001',
    'PAY-DEMO-001',
    'Student subscription payment',
    '2026-09-01 08:01:00+07',
    NULL,
    NULL,
    NULL,
    '2026-09-01 08:00:00+07',
    '2026-09-01 08:01:00+07'
),
(
    3,
    'SUBSCRIPTION',
    'VNPAY',
    'COMPLETED',
    99000,
    'VND',
    'VNPAY-DEMO-PAY-002',
    'PAY-DEMO-002',
    'Pro subscription payment',
    '2026-09-05 10:01:00+07',
    NULL,
    NULL,
    NULL,
    '2026-09-05 10:00:00+07',
    '2026-09-05 10:01:00+07'
),
(
    5,
    'SUBSCRIPTION',
    'MOMO',
    'COMPLETED',
    49000,
    'VND',
    'MOMO-DEMO-PAY-003',
    'PAY-DEMO-003',
    'Student subscription payment',
    '2026-09-10 16:01:00+07',
    NULL,
    NULL,
    NULL,
    '2026-09-10 16:00:00+07',
    '2026-09-10 16:01:00+07'
);


-- =========================================================
-- 26. CREDIT TRANSACTIONS
-- =========================================================
--
-- wallet_id is used instead of user_id.
-- =========================================================

INSERT INTO credit_transactions (
    wallet_id,
    type,
    direction,
    amount,
    balance_before,
    balance_after,
    reference_type,
    reference_id,
    description,
    created_at
)
VALUES
(
    2,
    'SURVEY_REWARD',
    'CREDIT',
    50,
    0,
    50,
    'SURVEY_PARTICIPATION',
    1,
    'Reward for completing survey',
    '2026-08-20 09:16:00+07'
),
(
    1,
    'SURVEY_REWARD',
    'CREDIT',
    35,
    0,
    35,
    'SURVEY_PARTICIPATION',
    2,
    'Reward for completing survey',
    '2026-08-21 13:26:00+07'
),
(
    2,
    'SURVEY_REWARD',
    'CREDIT',
    40,
    50,
    90,
    'SURVEY_PARTICIPATION',
    3,
    'Reward for completing survey',
    '2026-08-20 14:06:00+07'
),
(
    3,
    'SURVEY_REWARD',
    'CREDIT',
    50,
    0,
    50,
    'SURVEY_PARTICIPATION',
    5,
    'Reward for completing survey',
    '2026-08-20 15:07:00+07'
),
(
    3,
    'SURVEY_REWARD',
    'CREDIT',
    35,
    50,
    85,
    'SURVEY_PARTICIPATION',
    6,
    'Reward for completing survey',
    '2026-08-22 14:09:00+07'
),
(
    2,
    'SURVEY_REWARD',
    'CREDIT',
    60,
    90,
    150,
    'SURVEY_PARTICIPATION',
    7,
    'Reward for completing survey',
    '2026-08-21 09:09:00+07'
),
(
    4,
    'SURVEY_REWARD',
    'CREDIT',
    45,
    0,
    45,
    'SURVEY_PARTICIPATION',
    9,
    'Reward for completing survey',
    '2026-08-21 19:07:00+07'
);


COMMIT;
