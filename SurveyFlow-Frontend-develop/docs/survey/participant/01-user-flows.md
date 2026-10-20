# 01 — Luồng người dùng

## Đăng ký và hoàn thành

1. Đăng nhập bằng tài khoản khác người tạo và mở chi tiết khảo sát.
2. Bấm **Đăng ký tham gia** để giữ chỗ và nhận publicId.
3. Mở Google Form, trả lời câu hỏi trong thời gian giữ chỗ.
4. Khi hết thời gian chờ, quay lại lấy và sao chép mã xác nhận.
5. Nhập mã vào câu hỏi trả lời ngắn bắt buộc **`Mã xác nhận SurveyFlow`** trong Google Form rồi gửi biểu mẫu.
6. Quay lại SurveyFlow để xem kết quả tự cập nhật hoặc bấm **Kiểm tra trạng thái**.

Apps Script gửi webhook; backend xác minh và phát thưởng nếu hợp lệ. Chỉ mở form không đăng ký lượt và không đủ điều kiện nhận thưởng.

## Tiếp tục lượt

Ở API mode, tải lại trong cùng phiên trình duyệt sẽ đọc publicId đã lưu và tải trạng thái từ backend. Mã plaintext không được lưu vào storage. Tạo lại mã vô hiệu hóa mã cũ, cần nhập mã mới vào form.

## Lượt kết thúc

EXPIRED/CANCELLED có nút đăng ký lượt mới; backend quyết định có cho phép hay không. VERIFIED/VALID hiển thị đã hoàn thành, không cấp thêm mã. Người tạo không được tự tham gia.
