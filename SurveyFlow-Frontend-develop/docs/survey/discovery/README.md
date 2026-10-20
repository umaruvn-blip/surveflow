# Discovery — Frontend

## Phạm vi hiện tại

Discovery bao gồm **danh sách khảo sát phù hợp và xem chi tiết khảo sát**:

- `/exchange`: phân trang, sắp xếp và khám phá khảo sát phù hợp hồ sơ.
- `/exchange/:surveyId`: thông tin nghiên cứu, đối tượng, phần thưởng, trạng thái và link biểu mẫu.

Chưa có chế độ xem toàn bộ khảo sát. Trang detail tích hợp khu vực đăng ký tham gia; giữ chỗ, cấp mã và theo dõi xác minh được mô tả tại [Participant](../participant/README.md).

## Tài liệu

- [01 — Luồng người dùng](01-user-flows.md)
- [02 — Trạng thái giao diện](02-ui-states.md)
- [03 — Tích hợp API và cache](03-api-integration.md)
- [04 — Cấu trúc triển khai và kiểm thử](04-implementation.md)

[Tổng quan Survey](../README.md), [Design system](../../design-system.md), [API backend](../../../../survey_flow-backend/docs/survey/04-api-contract.md). Link backend yêu cầu hai repository nằm cạnh nhau.
