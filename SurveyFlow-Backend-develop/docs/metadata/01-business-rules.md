# Metadata V1 — Business Rules

## 1. Quyền truy cập và nguồn dữ liệu

- Năm endpoint tra cứu cho phép `GET` công khai; không yêu cầu user hiện tại hoặc role cụ thể.
- Danh sách trả về không được cá nhân hóa theo Guest, Creator hoặc Participant.
- Mỗi domain có controller và service riêng; service sở hữu truy vấn và mapping DTO.

| Danh sách | Bảng | Quy tắc hiển thị | Thứ tự |
|---|---|---|---|
| Category | `survey_categories` | Chỉ `is_active = true` | `name` tăng dần |
| Interest | `interests` | Chỉ `is_active = true` | `name` tăng dần |
| Tag | `survey_tags` | Tất cả bản ghi | `name` tăng dần |
| Badge | `badges` | Chỉ `is_active = true` | `name` tăng dần |
| Level | `levels` | Tất cả bản ghi | `level_number` tăng dần |

Tag và level không có cột `is_active`; không áp dụng bộ lọc trạng thái cho hai bảng này. Kết quả là mảng rỗng nếu truy vấn không có bản ghi phù hợp. V1 không có tìm kiếm hoặc phân trang cho các danh sách này.

## 2. Dữ liệu được công khai

- Category và interest: `id`, `name`, `slug`, `description`.
- Tag: `id`, `name`, `slug`.
- Badge: `id`, `code`, `name`, `description`, `iconUrl`.
- Level: `id`, `levelNumber`, `name`, `minXp`.
- Các trường thời gian, cờ `active` và liên kết entity không nằm trong response.
- `description`, `iconUrl` và tên level có thể là `null` theo schema; client cần xử lý giá trị này.

## 3. Danh mục khảo sát và sở thích

- Survey dùng `categoryId`; khi tạo hoặc cập nhật survey, backend chỉ chấp nhận category còn active.
- Targeting dùng danh sách interest ID; backend từ chối interest không tồn tại hoặc không active.

Danh sách metadata chỉ cung cấp các lựa chọn tại thời điểm đọc. API tạo/cập nhật survey vẫn kiểm tra lại ID và trạng thái trong database khi ghi; client không được coi dữ liệu cache là kết quả xác thực cuối cùng.

## 4. Nhãn khảo sát

- Danh sách tag chỉ là dữ liệu tham chiếu; việc gắn tag vào survey không thuộc năm API này.
- `SurveyTag` có `name` và `slug` duy nhất trong database.
- Tag không có trạng thái active; mọi bản ghi đều được trả về.

## 5. Huy hiệu và cấp độ

- Danh sách badge mô tả các huy hiệu đang active, không cho biết người dùng đã nhận huy hiệu nào.
- Danh sách level mô tả các ngưỡng XP, không cho biết XP hoặc level hiện tại của người dùng.
- Badge có `code` duy nhất; `name` không có ràng buộc duy nhất, nên các badge trùng tên không có thứ tự phụ được API cam kết.
- Level có `levelNumber` duy nhất và được sắp xếp theo số cấp, không sắp xếp theo `minXp`.
- Endpoint level trả dữ liệu đã cấu hình; không tính level từ XP, không trả khoảng XP hay phần trăm tiến độ.

## 6. Tính nhất quán của response

- Các service sử dụng transaction chỉ đọc và trả DTO, không trả JPA entity.
- Không ghi dữ liệu, cấp badge, cộng XP hoặc tạo liên kết user/survey khi tra cứu.
- `GET` lặp lại không tạo side effect; nội dung có thể thay đổi khi dữ liệu danh mục được cập nhật.
- Thứ tự chuỗi tuân theo phép sắp xếp của database; API không thực hiện sắp xếp theo locale ở tầng Java.

## 7. Phạm vi thay đổi dữ liệu

Năm API hiện tại chỉ đọc. Thay đổi schema và dữ liệu dùng chung phải đi qua Flyway migration; chưa có API quản trị metadata trong V1.
