# 03 — Tích hợp API và cache

## API

Đường dẫn tương đối với `/api/v1`, cần access token của người tham gia.

| Method | Path                                           | Mục đích                                   |
| ------ | ---------------------------------------------- | ------------------------------------------ |
| POST   | `/surveys/{surveyId}/participations`           | Giữ chỗ, trả publicId và các mốc thời gian |
| GET    | `/participations/{publicId}`                   | Đọc trạng thái lượt                        |
| POST   | `/participations/{publicId}/verification-code` | Cấp hoặc thay mã                           |

API layer unwrap ApiResponse, không fallback sang mock khi lỗi. Contract chính thức yêu cầu backend kiểm tra ownership, targeting, thời gian, trạng thái và capacity. Khi test chức năng, kiểm tra targeting ở bước giữ chỗ đang được tắt tạm để không cần chuẩn bị dữ liệu profile/interests; cần bật lại trước khi kiểm tra eligibility hoặc vận hành thật.

## Cache và persistence

- Query key: `['surveys', 'participation', userId, surveyId]`.
- Đọc publicId từ sessionStorage theo tài khoản và khảo sát rồi gọi GET.
- Đăng ký thành công: lưu ID, cập nhật cache lượt, invalidate chi tiết và discovery.
- RESERVED/SUBMITTED: polling mỗi 5 giây; trạng thái khác dừng polling.
- Lỗi tải lượt không tự retry; người dùng bấm tải lại.
- Completion code chỉ nằm trong mutation ở bộ nhớ, không ghi vào storage.

Storage giữ định danh, không giữ bản sao trạng thái backend. Phiên trình duyệt khác chưa tự tìm lại lượt cũ vì thiếu API tìm lượt theo survey.

## Webhook

Frontend không tự xác nhận hoàn thành hay cộng thưởng. Apps Script gửi metadata và mã tới backend; GET participation phản ánh kết quả. Contract backend mô tả điều kiện xác minh và chống xử lý trùng.
