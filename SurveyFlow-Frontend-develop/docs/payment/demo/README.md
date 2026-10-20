# Payment Demo — Frontend

## Phạm vi

Frontend hiện hỗ trợ **nạp Credits bằng thanh toán giả lập** (`CREDIT_TOPUP`) trên dev và staging. Người dùng đã đăng nhập tạo đơn ở `/credits`, sau đó chọn kết quả tại `/payments/demo/:paymentId`. Không cần thẻ, tài khoản ngân hàng hay chuyển tiền thật. Tỷ lệ hiện tại là **1.000 VNĐ = 10 Credits**; backend quyết định số tiền của đơn.

| Trang                       | Vai trò                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `/credits`                  | Hiển thị ví, lịch sử biến động Credits và form tạo đơn demo khi tính năng được bật.                                                             |
| `/payments/demo/:paymentId` | Tải một đơn cụ thể, hiển thị trạng thái và cho chọn kết quả khi đơn còn `PENDING`. Đây là trang checkout của đơn, không phải danh sách payment. |

Chỉ đơn `SUCCESS` cộng Credits và tạo dòng lịch sử ví. Đơn `FAILED` hoặc `CANCELLED` vẫn có trạng thái payment nhưng không tạo giao dịch Credits. Frontend không có trang liệt kê mọi payment trong phạm vi này.

## Tài liệu

1. [Luồng người dùng và trạng thái giao diện](01-user-flow.md)
2. [Cấu hình dev, staging và mock](02-environments.md)
3. [Tích hợp frontend và API](03-integration.md)
4. [Kịch bản kiểm thử cho nhóm](04-qa-runbook.md)

Quy tắc nghiệp vụ, trạng thái lưu trong database và API contract chuẩn: [Payment Demo backend](../../../../survey_flow-backend/docs/payment/demo/README.md).

Subscription plans, mua subscription bằng Credits, rút Credits và cổng thanh toán production thuộc các giai đoạn khác.
