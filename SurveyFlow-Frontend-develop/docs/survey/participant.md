# Luồng người tham gia khảo sát

## Đăng ký tham gia trên trang chi tiết

Nút Đăng ký tham gia gọi API giữ chỗ, lưu publicId trong sessionStorage theo người dùng và khảo sát. Trang tải lại trạng thái mỗi 5 giây trong lúc chờ xác minh. Nút lấy mã mở khi đến codeAvailableAt; mã chỉ hiển thị trong bộ nhớ, tải lại trang cần tạo mã mới (mã cũ bị vô hiệu hóa). Người tạo không được tự tham gia. Mock mode mô phỏng giữ chỗ và cấp mã; không mô phỏng webhook hay cộng thưởng. Lượt demo đặt lại khi tải trang. API chưa có endpoint tìm lượt theo khảo sát nên phiên trình duyệt khác cần publicId để khôi phục lượt.

## Các bước trên giao diện

1. Mở chi tiết khảo sát đang mở và bấm Đăng ký tham gia.
2. Mở biểu mẫu, trả lời câu hỏi trong thời gian giữ chỗ.
3. Khi hết thời gian chờ, lấy và sao chép mã xác nhận.
4. Nhập mã vào Google Form và gửi; quay lại trang chi tiết để xem kết quả.

## API

- `POST /surveys/{surveyId}/participations`: giữ chỗ.
- `GET /participations/{publicId}`: xem trạng thái.
- `POST /participations/{publicId}/verification-code`: cấp hoặc thay mã.

Backend kiểm tra quyền sở hữu lượt, đối tượng phù hợp và chỗ còn lại. Lấy mã chỉ mở khi lượt còn RESERVED và chưa hết hạn. Google Forms webhook xác minh và phát thưởng.
