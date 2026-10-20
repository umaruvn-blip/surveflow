# Business rules — AI Quality Check V1

- Chỉ dùng `slot_reserved_at` và `submitted_at` để tính thời gian hoàn thành. `slot_reserved_at` được ghi lúc giữ chỗ, nên có thể sớm hơn lúc người dùng thực sự mở form.
- Hai timestamp phải có múi giờ và `submitted_at` phải sau `slot_reserved_at`.
- `estimated_duration_seconds` có thể thiếu; nếu có thì phải lớn hơn 0.
- `completion_seconds = max(1, int(submitted_at - slot_reserved_at))` theo đơn vị giây.
- Khi có thời lượng dự kiến: `score = round(min(completion_seconds / estimated_duration_seconds, 1), 4)`.
- Tỷ lệ dưới `0.30` cho `VERY_LOW`; từ `0.30` đến dưới `0.70` cho `REVIEW`; từ `0.70` trở lên cho `GOOD`.
- Khi thiếu thời lượng dự kiến: `score = 0.5`, `status = REVIEW`, `reason_codes = ["ESTIMATED_DURATION_MISSING"]`.
- Các ngưỡng `0.30` và `0.70` là giá trị ban đầu, chưa được kiểm chứng bằng dữ liệu đã đánh giá thủ công. Điểm không được dùng để tự động từ chối xác minh hoặc giữ Credits.
