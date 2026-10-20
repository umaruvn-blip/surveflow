# Payment Demo — Quy tắc nghiệp vụ

## Tạo đơn nạp

- Chỉ người dùng đã đăng nhập được tạo và xem đơn của mình.
- `credits` là số nguyên, tối thiểu 10. Không yêu cầu bội số 10 và không đặt trần nghiệp vụ 100.000 Credits. Kiểu `Long` và độ chính xác lưu trữ vẫn là giới hạn kỹ thuật.
- Backend tính `amountVnd = credits × 100`; frontend chỉ hiển thị số tiền ước tính. Ví dụ: 11 Credits = 1.100 VNĐ; 100 Credits = 10.000 VNĐ.
- Đơn mới có `type=CREDIT_TOPUP`, `provider=DEMO`, `currency=VND`, `status=PENDING` và mã giao dịch demo riêng. Gọi tạo đơn hai lần sẽ tạo hai đơn khác nhau; API tạo đơn chưa có idempotency key.
- Tạo đơn chưa làm thay đổi ví và chưa tạo `credit_transactions`.

## Chốt kết quả

- Chủ đơn có thể chọn `SUCCESS`, `FAILED` hoặc `CANCELLED` khi đơn đang `PENDING`.
- `SUCCESS` cộng đúng số Credits đã lưu trong payment vào ví, ghi một `credit_transactions` loại `CREDIT_TOPUP`, rồi ghi `paidAt` và trạng thái `SUCCESS`.
- `FAILED` ghi `failedAt`; `CANCELLED` ghi `cancelledAt`. Hai kết quả này không cộng ví, không ghi giao dịch Credits.
- Gửi lại **cùng kết quả** trả về trạng thái hiện có, không cộng ví lần nữa. Sau khi đã kết thúc, yêu cầu đổi sang kết quả khác bị từ chối `409`.
- Đơn không tồn tại, không thuộc người gọi hoặc không phải `DEMO/CREDIT_TOPUP` đều được trả như không tìm thấy (`404`).

## Tính nhất quán

- Service khóa bản ghi payment khi chốt kết quả và khóa ví trước khi cộng Credits. Cập nhật payment, ví và sổ cái nằm trong cùng database transaction; lỗi giữa chừng sẽ rollback.
- `credit_transactions.payment_id` có ràng buộc unique để một payment không tạo hai giao dịch cộng ví.
- Log ứng dụng giúp theo dõi thao tác; `payments` và `credit_transactions` mới là dữ liệu để kiểm tra trạng thái và số dư đã lưu.

## Giới hạn môi trường

- Controller và service demo chỉ được đăng ký khi có profile `dev` hoặc `staging` và không có `prod`.
- Database dev/staging phải độc lập với production. Người dùng trong môi trường thử nghiệm tự chọn `SUCCESS`, nên không được trỏ các môi trường này vào dữ liệu hoặc ví production.
- Profile `test` dùng H2 để chạy test tự động; bản thân `test` không mở endpoint demo. Integration test có thể bật đồng thời `staging,test` để kiểm tra service trên H2.
