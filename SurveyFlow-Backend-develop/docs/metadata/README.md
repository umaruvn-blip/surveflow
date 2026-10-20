# Metadata Documentation

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | V1 |
| Domain | Survey Metadata & Gamification Reference Data |
| Phạm vi hiện tại | Năm API tra cứu chỉ đọc |

## Mục tiêu và phạm vi

Cung cấp dữ liệu tham chiếu cho client mà không gắn với một người dùng hay khảo sát cụ thể: danh mục khảo sát, sở thích, nhãn, huy hiệu và cấp độ. Mỗi loại có controller, service và repository riêng.

Bộ tài liệu này định nghĩa nghiệp vụ Metadata V1, bao gồm:

- Tra cứu danh mục khảo sát và sở thích đang hoạt động.
- Tra cứu nhãn khảo sát hiện có.
- Tra cứu định nghĩa huy hiệu đang hoạt động và các mốc cấp độ theo XP.
- Quy tắc truy cập công khai, lọc dữ liệu, sắp xếp và định dạng response.
- Ranh giới giữa dữ liệu danh mục và dữ liệu gắn với từng người dùng.

Ngoài phạm vi V1:

- API tạo, sửa, xóa và bật/tắt metadata cho Admin.
- Tìm kiếm, phân trang và thay đổi thứ tự từ client.
- Cấp huy hiệu, cộng XP hoặc tính level cho người dùng.
- Danh sách huy hiệu đã nhận và tiến độ XP của người dùng.

## Actor

- **Guest**: người chưa đăng nhập có thể tra cứu năm danh sách công khai.
- **Creator**: dùng category và interest khi cấu hình survey và targeting.
- **Participant**: xem dữ liệu tham chiếu, huy hiệu và các mốc level.
- **Survey Flow Backend**: truy vấn, lọc và chuyển entity thành response DTO.
- **Frontend**: gọi API, quản lý cache danh sách và xử lý trạng thái loading, empty, error khi làm giao diện.

## Thuật ngữ

- **Category**: danh mục chính của một khảo sát, được tham chiếu bằng `categoryId`.
- **Interest**: sở thích dùng trong hồ sơ hoặc targeting khảo sát.
- **Tag**: nhãn mô tả khảo sát trong danh mục nhãn.
- **Badge**: định nghĩa huy hiệu với mã `code`, tên, mô tả và URL icon.
- **Level**: định nghĩa một cấp độ với `levelNumber` và ngưỡng XP `minXp`.
- **Active**: cờ cho phép category, interest hoặc badge xuất hiện trong danh sách tra cứu.

## Danh sách tài liệu

1. [Business Rules](./01-business-rules.md): nguồn dữ liệu, quy tắc lọc và thứ tự.
2. [State Transitions](./02-state-transitions.md): ý nghĩa trạng thái và giới hạn của API hiện tại.
3. [Business Flows](./03-business-flows.md): luồng tra cứu từ client đến cơ sở dữ liệu.
4. [API Contract](./04-api-contract.md): URL, quyền truy cập và cấu trúc response.

## Domain model và DTO liên quan

| Domain | Entity | Controller / Service | Response DTO |
|---|---|---|---|
| Category | `SurveyCategory` | `SurveyCategoryController` / `SurveyCategoryService` | `CategoryResponse` |
| Interest | `Interest` | `InterestController` / `InterestService` | `InterestResponse` |
| Tag | `SurveyTag` | `SurveyTagController` / `SurveyTagService` | `TagResponse` |
| Badge | `Badge` | `BadgeController` / `BadgeService` | `BadgeResponse` |
| Level | `Level` | `LevelController` / `LevelService` | `LevelResponse` |

Các DTO nằm trong `dto.response.metadata`; các service có implementation riêng trong `service.impl`.

## Domain model liên quan

- `SurveyCategory`, `Interest`, `SurveyTag`: danh mục phục vụ khảo sát và nhắm đối tượng.
- `Badge`, `Level`: định nghĩa huy hiệu và ngưỡng XP của hệ thống gamification.
- `UserBadge`, `UserProgress`: dữ liệu gắn với từng người dùng, không thuộc response metadata.

Các API trong bộ này không tạo, sửa, xóa danh mục hoặc cấp huy hiệu cho người dùng.
