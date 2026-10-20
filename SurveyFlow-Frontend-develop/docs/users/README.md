# Users — Frontend

## Phạm vi hiện tại

Module Users cung cấp trang hồ sơ cá nhân tại `/profile`, dành cho người dùng đã đăng nhập. Có thể mở từ mục **Hồ sơ cá nhân** trên sidebar, thanh điều hướng mobile hoặc liên kết trong khu vực tài khoản.

Chức năng hiện có:

- Xem hồ sơ, email và avatar.
- Thay thế toàn bộ sáu trường thông tin cá nhân bằng một lần lưu.
- Chọn và lưu sở thích riêng.
- Bắt đầu liên kết Google trong chế độ API thật; luồng này thuộc module Auth.
- Chạy demo bằng mock mà không cần backend.

Email và avatar chỉ đọc. Chưa có chức năng cập nhật avatar. Hồ sơ không tự lưu khi chỉnh từng trường.

## Tài liệu

- [01 — Luồng người dùng](01-user-flows.md)
- [02 — Trạng thái giao diện](02-ui-states.md)
- [03 — Tích hợp API và cache](03-api-integration.md)
- [04 — Cấu trúc triển khai và kiểm thử](04-implementation.md)

Backend là nguồn chuẩn cho nghiệp vụ và contract: [Users backend](../../../survey_flow-backend/docs/users/README.md), [API contract](../../../survey_flow-backend/docs/users/04-api-contract.md). Các liên kết này yêu cầu hai repository nằm cạnh nhau trong workspace Survey Flow.

Giao diện tuân theo [design system](../design-system.md). Tài liệu hiện đặt trực tiếp tại `docs/users`; khi module có thêm nhiều chức năng, có thể chuyển nhóm hồ sơ sang `docs/users/profile` và cập nhật các liên kết.
