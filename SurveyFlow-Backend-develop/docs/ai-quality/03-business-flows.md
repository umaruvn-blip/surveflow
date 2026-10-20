# Business flows — AI Quality Check V1

## Đã triển khai trong Python

1. Bên gọi gửi ID participation, ID survey, thời điểm giữ chỗ, thời điểm nộp form và thời lượng dự kiến nếu có.
2. API kiểm tra dữ liệu đầu vào và tính `completion_seconds`.
3. API trả `score`, `status`, `reason_codes` và `model_version`. Python service không truy cập database của Spring Boot.

## Điểm nối Spring Boot dự kiến

1. Survey webhook xác minh form response, đánh dấu participation `VERIFIED` và phát Credits trong transaction hiện có.
2. Sau khi transaction thành công, Spring Boot gọi `POST /api/v1/quality/check`.
3. Spring Boot lưu `participation_id`, `completion_seconds`, `score`, `status`, `model_version` vào `quality_scores`. Bảng này giới hạn một dòng cho mỗi participation.
4. Nếu Python lỗi hoặc timeout, Spring Boot ghi nhận lỗi để xử lý sau; kết quả xác minh và Credits đã hoàn tất vẫn giữ nguyên.

Các bước tích hợp Spring Boot ở trên **chưa được triển khai** trên branch `feat/ai-quality-check`. `reason_codes` hiện chưa có cột tương ứng trong `quality_scores`.
