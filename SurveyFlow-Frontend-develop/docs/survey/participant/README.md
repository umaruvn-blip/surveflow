# Participant — Frontend

## Phạm vi hiện tại

Luồng trên trang chi tiết `/exchange/:surveyId` hỗ trợ đăng ký giữ chỗ, lấy mã xác nhận và theo dõi kết quả cho phương thức EXTERNAL_CODE.

## Tài liệu

- [01 — Luồng người dùng](01-user-flows.md)
- [02 — Trạng thái giao diện](02-ui-states.md)
- [03 — Tích hợp API và cache](03-api-integration.md)
- [04 — Cấu trúc triển khai và kiểm thử](04-implementation.md)

Backend là nguồn chuẩn: [Survey backend](../../../../survey_flow-backend/docs/survey/README.md), [API contract](../../../../survey_flow-backend/docs/survey/04-api-contract.md). Liên kết yêu cầu hai repository nằm cạnh nhau. Giao diện theo [design system](../../design-system.md). [Tổng quan Survey](../README.md).

## Giới hạn hiện tại

ID lượt được giữ trong sessionStorage theo tài khoản và khảo sát. Backend chưa có API tìm lượt theo khảo sát nên chưa tự khôi phục lượt ở phiên trình duyệt khác. Mã chỉ giữ trong bộ nhớ; tải lại trang cần cấp mã mới. Mock không mô phỏng webhook hoặc cộng thưởng.
