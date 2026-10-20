# AI Matching V1 — API Contract

Base path: `/api/v1`

Tài liệu này định nghĩa giao diện lập trình ứng dụng (API Contract) cho cả 2 tầng:
1. **Client-Facing API**: Endpoint do Spring Boot Backend cung cấp cho Participant (yêu cầu JWT Access Token).
2. **Internal Microservice API**: Endpoint do Python FastAPI AI Service cung cấp cho Spring Boot Backend giao tiếp nội bộ.

---

## 1. Client-Facing API (Spring Boot Backend)

### 1.1. Lấy danh sách khảo sát gợi ý cá nhân hóa

- **Method**: `GET`
- **Path**: `/api/v1/surveys/recommendations`
- **Authentication**: Bắt buộc (`Authorization: Bearer <access_token>`)
- **Mô tả**: Trả về danh sách khảo sát đang ở trạng thái `PUBLISHED` phù hợp nhất với hồ sơ và sở thích của người dùng hiện tại, sắp xếp theo điểm tương đồng ngữ nghĩa giảm dần.

#### Request Parameters

| Tham số | Vị trí | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|---|
| `limit` | Query | `Integer` | Không | `10` | Số lượng khảo sát gợi ý tối đa cần lấy |

#### Response Headers
- `Content-Type: application/json`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Recommended surveys retrieved successfully",
  "data": [
    {
      "id": 101,
      "title": "Nghiên cứu ứng dụng AI trong học tập",
      "description": "Khảo sát trải nghiệm sử dụng các công cụ Generative AI của sinh viên",
      "categoryName": "Công nghệ thông tin",
      "status": "PUBLISHED",
      "rewardCredit": 10,
      "targetResponseCount": 100,
      "currentResponseCount": 15,
      "deadline": "2026-12-31T23:59:59Z",
      "targetInterests": [
        "Trí tuệ nhân tạo",
        "Khoa học dữ liệu"
      ],
      "matchScore": 0.8942
    },
    {
      "id": 105,
      "title": "Khảo sát thói quen tự học lập trình",
      "description": "Tìm hiểu phương pháp học qua các nền tảng trực tuyến",
      "categoryName": "Giáo dục",
      "status": "PUBLISHED",
      "rewardCredit": 10,
      "targetResponseCount": 50,
      "currentResponseCount": 8,
      "deadline": "2026-11-30T18:00:00Z",
      "targetInterests": [
        "Lập trình",
        "Công nghệ"
      ],
      "matchScore": 0.7215
    }
  ]
}
```

*Lưu ý*: Trường `matchScore` sẽ có giá trị `null` nếu hệ thống kích hoạt cơ chế Fallback khi AI Service ngoại tuyến.

#### Error Responses

- **401 Unauthorized**: Token JWT không hợp lệ hoặc đã hết hạn.
  ```json
  {
    "success": false,
    "message": "Full authentication is required to access this resource",
    "errorCode": "UNAUTHORIZED"
  }
  ```

---

## 2. Internal Microservice API (Python FastAPI)

Dịch vụ chạy nội bộ (mặc định cổng `8000`), không yêu cầu JWT nhưng được bảo vệ trong mạng nội bộ / docker network.

### 2.1. Kiểm tra sức khỏe và trạng thái Model

- **Method**: `GET`
- **Path**: `/health`
- **Mô tả**: Kiểm tra dịch vụ AI Matching có đang hoạt động và mô hình đã được nạp sẵn sàng vào RAM hay chưa.

#### Response (200 OK)

```json
{
  "status": "UP",
  "model_loaded": true
}
```

---

### 2.2. So khớp độ tương đồng ngữ nghĩa khảo sát

- **Method**: `POST`
- **Path**: `/api/v1/match`
- **Header**: `Content-Type: application/json`
- **Mô tả**: Tiếp nhận văn bản đại diện người dùng và danh sách văn bản khảo sát, tính toán cosine similarity và trả về danh sách đã xếp hạng theo `top_k`.

#### Request Body Schema (`MatchRequest`)

```json
{
  "user_text": "Student at FPT University. Occupation: Student. Interested in Machine Learning Interests: Artificial Intelligence, Data Science.",
  "surveys": [
    {
      "id": 101,
      "text": "Nghiên cứu ứng dụng AI trong học tập. Khảo sát trải nghiệm sử dụng AI Target interests: Trí tuệ nhân tạo, Khoa học dữ liệu."
    },
    {
      "id": 102,
      "text": "Khảo sát thị trường thức uống sinh viên. Tìm hiểu thói quen dùng trà sữa Target interests: Ẩm thực, Đời sống."
    }
  ],
  "top_k": 10
}
```

#### Field Specifications

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `user_text` | `string` | Bắt buộc, không rỗng | Chuỗi văn bản đại diện hồ sơ và sở thích người dùng |
| `surveys` | `array[SurveyItem]` | Bắt buộc | Danh sách các khảo sát ứng viên cần chấm điểm |
| `surveys[].id` | `integer` | Bắt buộc | Mã định danh khảo sát |
| `surveys[].text` | `string` | Bắt buộc | Chuỗi văn bản đại diện nội dung khảo sát |
| `top_k` | `integer` | Tùy chọn, $\ge 1$, mặc định 10 | Số lượng kết quả tương đồng cao nhất cần trả về |

#### Response Body Schema (`MatchResponse`)

```json
{
  "results": [
    {
      "survey_id": 101,
      "score": 0.8942
    },
    {
      "survey_id": 102,
      "score": 0.1834
    }
  ]
}
```

#### Error Responses

- **503 Service Unavailable**: Mô hình AI chưa được nạp vào bộ nhớ.
  ```json
  {
    "detail": "AI Model is not loaded yet"
  }
  ```
- **422 Unprocessable Entity**: Dữ liệu gửi lên sai định dạng Pydantic schema.
  ```json
  {
    "detail": [
      {
        "loc": ["body", "user_text"],
        "msg": "field required",
        "type": "value_error.missing"
      }
    ]
  }
  ```
- **500 Internal Server Error**: Lỗi tính toán toán học / bộ nhớ trong quá trình encode embeddings.
  ```json
  {
    "detail": "Error description string"
  }
  ```
