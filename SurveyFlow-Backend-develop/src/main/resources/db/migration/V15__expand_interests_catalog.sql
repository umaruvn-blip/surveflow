-- =========================================================
-- V15: EXPAND INTERESTS CATALOG
-- Bổ sung đa dạng các lĩnh vực học tập, đời sống, giải trí, kỹ năng
-- =========================================================

INSERT INTO interests (name, slug, description, is_active, created_at, updated_at)
VALUES
-- 1. Học tập & Phát triển bản thân
(
    'Ngoại ngữ & Ngôn ngữ học',
    'foreign-languages',
    'Học tiếng Anh, Nhật, Hàn, Trung và các ngôn ngữ quốc tế',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Phương pháp học & Năng suất',
    'study-methods-productivity',
    'Quản lý thời gian, phương pháp học tập hiệu quả và phát triển bản thân',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Đọc sách & Văn học',
    'reading-literature',
    'Sách phát triển bản thân, văn học, tiểu thuyết và nghiên cứu',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Định hướng nghề nghiệp & Việc làm',
    'career-orientation-job-search',
    'Tìm kiếm việc làm, phỏng vấn, thực tập và định hướng nghề nghiệp',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Tâm lý học & Sức khỏe tinh thần',
    'psychology-mental-health',
    'Tâm lý học hành vi, cảm xúc và sức khỏe tinh thần',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Kỹ năng mềm & Giao tiếp',
    'soft-skills-communication',
    'Thuyết trình, đàm phán, làm việc nhóm và kỹ năng lãnh đạo',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- 2. Đời sống & Tiêu dùng sinh viên
(
    'Ẩm thực & Nấu ăn',
    'food-and-cooking',
    'Khám phá ẩm thực đường phố, nhà hàng và nấu ăn tại nhà',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Du lịch & Trải nghiệm',
    'travel-and-experience',
    'Du lịch trải nghiệm, phượt, khám phá văn hóa và địa điểm mới',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Cà phê & Văn hóa quán xá',
    'coffee-and-cafe-culture',
    'Thưởng thức cà phê, không gian làm việc và trải nghiệm quán xá',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Tài chính cá nhân & Tiết kiệm',
    'personal-finance-saving',
    'Quản lý chi tiêu, tiết kiệm và lập ngân sách cá nhân',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Mua sắm & Thương mại điện tử',
    'shopping-and-ecommerce',
    'Thói quen mua sắm online, săn sale và sàn thương mại điện tử',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Đời sống nhà trọ & Ký túc xá',
    'housing-and-dorm-life',
    'Trải nghiệm sinh hoạt, thuê trọ và đời sống ký túc xá',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- 3. Thể thao & Sức khỏe
(
    'Gym & Fitness',
    'gym-and-fitness',
    'Tập gym, rèn luyện thể lực và thể hình',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Bóng đá & Thể thao đồng đội',
    'football-and-team-sports',
    'Bóng đá, bóng rổ, cầu lông và các môn thể thao vận động',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Chạy bộ & Marathon',
    'running-and-marathon',
    'Chạy bộ rèn luyện sức bền, jogging và giải chạy marathon',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Yoga & Thiền định',
    'yoga-and-meditation',
    'Thực hành yoga, thiền định và cân bằng thân tâm',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Dinh dưỡng & Sống khỏe',
    'nutrition-and-healthy-living',
    'Chế độ ăn lành mạnh, eat clean và bảo vệ sức khỏe',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- 4. Giải trí & Nghệ thuật
(
    'Game & Esports',
    'gaming-and-esports',
    'Trò chơi điện tử, giải đấu Esports và công nghệ game',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Âm nhạc & Nhạc hội',
    'music-and-concerts',
    'Thưởng thức âm nhạc, nhạc cụ, concert và sự kiện âm nhạc',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Phim ảnh & Điện ảnh',
    'movies-and-cinema',
    'Xem phim chiếu rạp, series truyền hình và bình luận phim',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Nhiếp ảnh & Sáng tạo nội dung',
    'photography-and-content-creation',
    'Chụp ảnh, quay video, chỉnh sửa hình ảnh và làm nội dung số',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Thời trang & Phong cách sống',
    'fashion-and-lifestyle',
    'Xu hướng thời trang, phong cách phối đồ và làm đẹp',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Anime, Manga & Cosplay',
    'anime-manga-cosplay',
    'Truyện tranh, hoạt hình Nhật Bản và văn hóa pop culture',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- 5. Kinh doanh & Đầu tư
(
    'Khởi nghiệp & Startup',
    'startups-and-entrepreneurship',
    'Ý tưởng kinh doanh, đổi mới sáng tạo và mô hình khởi nghiệp',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Chứng khoán & Đầu tư',
    'stock-market-investing',
    'Đầu tư tài chính, thị trường chứng khoán và tài sản số',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Thiết kế đồ họa & UI/UX',
    'graphic-design-ui-ux',
    'Thiết kế giao diện người dùng, trải nghiệm và mỹ thuật số',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- 6. Xã hội & Môi trường
(
    'Môi trường & Sống xanh',
    'environment-and-green-living',
    'Tái chế, giảm rác thải nhựa và bảo vệ môi trường',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Tình nguyện & Hoạt động cộng đồng',
    'volunteering-and-community',
    'Hoạt động thiện nguyện, câu lạc bộ và dự án vì cộng đồng',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (name) DO NOTHING;
