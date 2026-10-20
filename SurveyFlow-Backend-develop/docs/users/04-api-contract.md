# Users V1 — API Contract

Base path: `/api/v1`. Tất cả endpoint yêu cầu `Authorization: Bearer <access-token>`. Backend xác định user từ access token; client không gửi user ID.

| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/users/me/profile` | Xem tài khoản, hồ sơ và sở thích hiện tại |
| `PUT` | `/users/me/profile` | Lưu toàn bộ thông tin hồ sơ có thể sửa |
| `PUT` | `/users/me/interests` | Thay thế toàn bộ sở thích |

Response thành công dùng `ApiResponse<T>` với HTTP `200`, `status: 200`, `code: "SUCCESS"`, `success: true`. Response lỗi dùng `ErrorResponse` chung của hệ thống.

## 1. `GET /api/v1/users/me/profile`

Không có request body. `data` là `UserProfileResponse`:

```json
{
  "status": 200,
  "code": "SUCCESS",
  "success": true,
  "message": "Success",
  "data": {
    "userId": 42,
    "email": "user@example.com",
    "displayName": "Nguyễn An",
    "avatarUrl": "https://example.com/avatar.jpg",
    "birthYear": 2002,
    "gender": "OTHER",
    "school": "Đại học A",
    "occupation": "Student",
    "bio": "Quan tâm đến công nghệ",
    "interests": [
      { "id": 1, "name": "Technology", "slug": "technology", "active": true },
      { "id": 2, "name": "Education", "slug": "education", "active": true }
    ]
  }
}
```

`interests` luôn là mảng, có thể rỗng, sắp xếp theo `id` tăng dần. Các trường hồ sơ chưa có giá trị là `null`. `email` và `avatarUrl` chỉ đọc; ba API này không cập nhật hai trường đó.

## 2. `PUT /api/v1/users/me/profile`

`Content-Type: application/json`. Client gửi đầy đủ các trường sau, dùng `null` khi không có giá trị:

```json
{
  "displayName": "Nguyễn An",
  "birthYear": 2002,
  "gender": "OTHER",
  "school": "Đại học A",
  "occupation": "Student",
  "bio": "Quan tâm đến công nghệ"
}
```

| Field | Kiểu | Quy tắc |
|---|---|---|
| `displayName` | string hoặc `null` | Tối đa 100 ký tự sau khi trim. |
| `birthYear` | integer hoặc `null` | Từ 1900 đến năm hiện tại theo UTC. |
| `gender` | string hoặc `null` | `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`. |
| `school` | string hoặc `null` | Tối đa 255 ký tự sau khi trim. |
| `occupation` | string hoặc `null` | Tối đa 255 ký tự sau khi trim. |
| `bio` | string hoặc `null` | Tối đa 2000 ký tự sau khi trim. |

Backend cập nhật toàn bộ sáu trường theo request. Gửi giá trị cũ để giữ nguyên, giá trị mới để thay đổi, `null` để xóa. Trường không xuất hiện cũng được lưu thành `null`. Chuỗi rỗng sau khi trim ở các trường văn bản được lưu thành `null`; `gender` phải là tên enum hợp lệ hoặc `null`. Body `{}` xóa toàn bộ sáu trường. Các field ngoài DTO, bao gồm `avatarUrl`, không được cập nhật. Response `200` trả `UserProfileResponse` giống `GET`, gồm cả `avatarUrl` hiện có và danh sách sở thích hiện tại.

## 3. `PUT /api/v1/users/me/interests`

`Content-Type: application/json`. Body bắt buộc:

```json
{
  "interestIds": [1, 2]
}
```

`interestIds` là mảng ID dương, duy nhất. Mỗi ID phải thuộc interest đang hoạt động. Không chấp nhận thiếu field, `null`, phần tử `null`, ID trùng, ID không tồn tại hoặc interest đã vô hiệu hóa. Mảng rỗng hợp lệ và xóa toàn bộ lựa chọn.

Response `200` trả tập mới trong `data`:

```json
{
  "status": 200,
  "code": "SUCCESS",
  "success": true,
  "message": "Success",
  "data": {
    "interests": [
      { "id": 1, "name": "Technology", "slug": "technology", "active": true },
      { "id": 2, "name": "Education", "slug": "education", "active": true }
    ]
  }
}
```

## 4. Error mapping

| HTTP status | Code | Trường hợp |
|---|---|---|
| `400` | `VALIDATION_ERROR` hoặc `INVALID_REQUEST` | JSON/field sai kiểu, thiếu trường bắt buộc, giá trị sai, interest ID không tồn tại hoặc không active. |
| `401` | `UNAUTHORIZED` | Thiếu, hết hạn hoặc sai access token. |
| `404` | `RESOURCE_NOT_FOUND` | User từ token không còn tồn tại. |

Lỗi không làm thay đổi hồ sơ hoặc sở thích. Ví dụ dạng lỗi hiện hành:

```json
{
  "code": "INVALID_REQUEST",
  "status": 400,
  "message": "One or more interests are invalid or inactive",
  "path": "/api/v1/users/me/interests",
  "timestamp": "2026-09-26T10:30:00"
}
```

## 5. Idempotency và thứ tự

- `GET` không thay đổi dữ liệu.
- Gửi lại cùng một `PUT` với cùng giá trị cho cùng trạng thái hồ sơ cho kết quả như nhau.
- Gửi lại cùng một `PUT` với cùng tập `interestIds` không tạo quan hệ trùng; thứ tự request không ảnh hưởng kết quả.
- Response của danh sách sở thích luôn sắp xếp theo `id` tăng dần.
