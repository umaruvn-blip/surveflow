# Metadata V1 — API Contract

Base path: `/api/v1`

## 1. Quy ước chung

- **Authentication**: không bắt buộc access token cho năm endpoint GET tra cứu.
- **Request**: không nhận body, path parameter hoặc query parameter đã định nghĩa trong V1.
- **Response headers**: `Content-Type: application/json`.
- **Success response**: HTTP `200`, sử dụng `ApiResponse<List<ResponseDTO>>`.
- Không có API ghi, tìm kiếm, phân trang hoặc tham số sắp xếp do client truyền vào.

| Method | Path | Response item |
|---|---|---|
| `GET` | `/api/v1/categories` | `CategoryResponse` |
| `GET` | `/api/v1/interests` | `InterestResponse` |
| `GET` | `/api/v1/tags` | `TagResponse` |
| `GET` | `/api/v1/badges` | `BadgeResponse` |
| `GET` | `/api/v1/levels` | `LevelResponse` |

### 1.1. Success envelope

| Field | Kiểu | Giá trị / ý nghĩa |
|---|---|---|
| `status` | Integer | `200` |
| `code` | String | `SUCCESS` |
| `success` | Boolean | `true` |
| `message` | String | `Success` |
| `data` | Array | Danh sách DTO, có thể rỗng |

Ví dụ dưới đây minh họa cấu trúc response, không cam kết ID hoặc nội dung dữ liệu trong từng môi trường.

## 2. Danh mục khảo sát

- **Method**: `GET`
- **Path**: `/api/v1/categories`
- **Authentication**: công khai.
- **Mô tả**: Trả các danh mục đang active, sắp xếp theo `name` tăng dần.

### 2.1. Response fields — `CategoryResponse`

| Field | Kiểu Java / JSON | Nullable | Mô tả |
|---|---|---|---|
| `id` | Long / number | Không | ID danh mục |
| `name` | String / string | Không | Tên danh mục |
| `slug` | String / string | Không | Slug duy nhất |
| `description` | String / string | Có | Mô tả danh mục |

### 2.2. Success Response (200 OK)

```json
{
  "status": 200,
  "code": "SUCCESS",
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Technology and computing related surveys"
    }
  ]
}
```

## 3. Sở thích

- **Method**: `GET`
- **Path**: `/api/v1/interests`
- **Authentication**: công khai.
- **Mô tả**: Trả các sở thích đang active, sắp xếp theo `name` tăng dần.

### 3.1. Response fields — `InterestResponse`

| Field | Kiểu Java / JSON | Nullable | Mô tả |
|---|---|---|---|
| `id` | Long / number | Không | ID sở thích |
| `name` | String / string | Không | Tên sở thích |
| `slug` | String / string | Không | Slug duy nhất |
| `description` | String / string | Có | Mô tả sở thích |

### 3.2. Success Response (200 OK)

```json
{
  "status": 200,
  "code": "SUCCESS",
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Artificial Intelligence",
      "slug": "artificial-intelligence",
      "description": "Artificial intelligence and intelligent systems"
    }
  ]
}
```

## 4. Nhãn khảo sát

- **Method**: `GET`
- **Path**: `/api/v1/tags`
- **Authentication**: công khai.
- **Mô tả**: Trả toàn bộ nhãn khảo sát, sắp xếp theo `name` tăng dần; tag không có cờ active.

### 4.1. Response fields — `TagResponse`

| Field | Kiểu Java / JSON | Nullable | Mô tả |
|---|---|---|---|
| `id` | Long / number | Không | ID nhãn |
| `name` | String / string | Không | Tên nhãn |
| `slug` | String / string | Không | Slug duy nhất |

### 4.2. Success Response (200 OK)

```json
{
  "status": 200,
  "code": "SUCCESS",
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "AI",
      "slug": "ai"
    }
  ]
}
```

## 5. Huy hiệu

- **Method**: `GET`
- **Path**: `/api/v1/badges`
- **Authentication**: công khai.
- **Mô tả**: Trả các định nghĩa huy hiệu đang active, sắp xếp theo `name` tăng dần.

### 5.1. Response fields — `BadgeResponse`

| Field | Kiểu Java / JSON | Nullable | Mô tả |
|---|---|---|---|
| `id` | Long / number | Không | ID huy hiệu |
| `code` | String / string | Không | Mã huy hiệu duy nhất |
| `name` | String / string | Không | Tên huy hiệu |
| `description` | String / string | Có | Mô tả huy hiệu |
| `iconUrl` | String / string | Có | URL icon đã cấu hình |

### 5.2. Success Response (200 OK)

```json
{
  "status": 200,
  "code": "SUCCESS",
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "code": "FIRST_SURVEY",
      "name": "First Survey",
      "description": "Completed the first survey.",
      "iconUrl": "https://example.com/badges/first-survey.png"
    }
  ]
}
```

Response không chứa `earnedAt`, user ID hoặc trạng thái người dùng đã nhận badge. Các trường này thuộc dữ liệu `UserBadge`.

## 6. Cấp độ

- **Method**: `GET`
- **Path**: `/api/v1/levels`
- **Authentication**: công khai.
- **Mô tả**: Trả toàn bộ định nghĩa cấp độ, sắp xếp theo `levelNumber` tăng dần; level không có cờ active.

### 6.1. Response fields — `LevelResponse`

| Field | Kiểu Java / JSON | Nullable | Mô tả |
|---|---|---|---|
| `id` | Long / number | Không | ID cấp độ |
| `levelNumber` | Integer / number | Không | Số cấp độ duy nhất |
| `name` | String / string | Có | Tên hiển thị của cấp độ |
| `minXp` | Long / number | Không | Ngưỡng XP đã cấu hình |

### 6.2. Success Response (200 OK)

```json
{
  "status": 200,
  "code": "SUCCESS",
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "levelNumber": 1,
      "name": "Beginner",
      "minXp": 0
    }
  ]
}
```

Response không chứa `totalXp` hoặc level hiện tại của người dùng. `minXp` là dữ liệu cấu hình, không phải kết quả tính tiến độ trong request này.

## 7. Danh sách rỗng

Khi không có bản ghi phù hợp, API trả HTTP `200`, không trả `404` và không dùng `null` cho `data`:

```json
{
  "status": 200,
  "code": "SUCCESS",
  "success": true,
  "message": "Success",
  "data": []
}
```

## 8. Error mapping

Các endpoint không có validation request riêng hoặc lỗi nghiệp vụ khi không có dữ liệu. Lỗi ngoài dự kiến từ truy vấn hoặc xử lý response đi qua `GlobalExceptionHandler`.

| HTTP status | Code | Trường hợp |
|---|---|---|
| `500` | `INTERNAL_SERVER_ERROR` | Lỗi ngoài dự kiến trong quá trình xử lý |

Ví dụ `ErrorResponse` chung:

```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "status": 500,
  "message": "Unexpected error occurred",
  "path": "/api/v1/categories",
  "timestamp": "2026-09-26T08:00:00"
}
```

Quyền truy cập công khai áp dụng cho `GET` trên năm đường dẫn đã liệt kê. Các HTTP method khác không thuộc API metadata V1.

## 9. Idempotency

- Các request GET chỉ đọc và không tạo side effect.
- Client có thể gọi lại để đọc danh mục; dữ liệu trả về có thể đổi khi database được cập nhật.
