# Survey V1 — API Contract

Base path: `/api/v1`

Các endpoint survey yêu cầu access token, trừ Google Forms webhook. API tra cứu công khai cho category, interest, tag, badge và level được mô tả riêng trong [Metadata API Contract](../metadata/04-api-contract.md). Response thành công sử dụng `ApiResponse<T>`; lỗi sử dụng `ErrorResponse` chung của hệ thống.

## 1. Creator API

| Method | Path | Mục đích |
|---|---|---|
| `POST` | `/surveys` | Tạo survey `DRAFT` |
| `PUT` | `/surveys/{surveyId}` | Thay thế cấu hình survey `DRAFT` |
| `GET` | `/surveys/mine` | Lấy survey của Creator hiện tại |
| `POST` | `/surveys/{surveyId}/webhook-configuration` | Sinh webhook token mới và trả cấu hình Apps Script |
| `POST` | `/surveys/{surveyId}/publish` | Publish survey |
| `POST` | `/surveys/{surveyId}/close` | Đóng survey |

### 1.1. Tạo và cập nhật draft

Request body:

```json
{
  "categoryId": 1,
  "title": "Khảo sát trải nghiệm học trực tuyến",
  "description": "...",
  "researchPurpose": "...",
  "participantInstructions": "...",
  "provider": "GOOGLE_FORMS",
  "externalFormUrl": "https://docs.google.com/forms/d/e/FORM_ID/viewform",
  "estimatedDurationSeconds": 300,
  "questionCount": 12,
  "language": "vi",
  "containsSensitiveQuestions": false,
  "dataUsageNotice": null,
  "targetResponseCount": 100,
  "slotTtlSeconds": 1800,
  "deadline": "2026-12-31T16:59:59Z",
  "verification": {
    "method": "EXTERNAL_CODE",
    "minCompletionSeconds": 120,
    "maxCompletionSeconds": 900,
    "maxAttempts": 3
  },
  "targeting": {
    "minBirthYear": 2000,
    "maxBirthYear": 2008,
    "gender": null,
    "school": null,
    "occupation": "Student",
    "interestIds": [1, 2]
  }
}
```

`PUT /surveys/{surveyId}` chỉ chấp nhận survey `DRAFT`. `targetResponseCount` phải giữ nguyên vì phí tạo đã được tính khi tạo survey. Response trả `rewardCredit = 10` từ chính sách hệ thống; client không gửi field này.

### 1.2. Cấu hình webhook

`POST /surveys/{surveyId}/webhook-configuration` vô hiệu hóa token cũ, sinh token mới và xóa trạng thái kiểm tra kết nối.

Response:

```json
{
  "surveyId": 10,
  "webhookPath": "/api/v1/webhooks/google-forms/10",
  "verificationPath": "/api/v1/webhooks/google-forms/10/verify",
  "webhookToken": "plaintext-returned-once"
}
```

### 1.3. Publish

Điều kiện chính:

- Survey thuộc Creator hiện tại và đang `DRAFT`.
- Dữ liệu survey và verification config hợp lệ.
- Với `EXTERNAL_CODE`, webhook đã được kiểm tra thành công.
- Phí tạo survey đã được trừ thành công khi tạo draft.

## 2. Discovery API

| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/surveys?page=1&size=20&sortBy=publishedAt&sortDir=DESC` | Danh sách survey phù hợp với user hiện tại |
| `GET` | `/surveys/{surveyId}` | Chi tiết survey |

Danh sách chỉ trả survey `PUBLISHED`, chưa quá deadline, còn capacity và thỏa targeting. `sortBy` chỉ nhận field được endpoint cho phép; giá trị không hợp lệ dùng default sort của endpoint.

## 3. Participation API

| Method | Path | Mục đích |
|---|---|---|
| `POST` | `/surveys/{surveyId}/participations` | Reserve một slot |
| `GET` | `/participations/{publicId}` | Xem trạng thái participation |
| `POST` | `/participations/{publicId}/verification-code` | Phát hành hoặc thay thế completion code |
| `POST` | `/participations/{publicId}/cancel` | Hủy participation `RESERVED` |

Completion code chỉ được phát hành khi:

- Participation thuộc user hiện tại và đang `RESERVED`.
- `now >= slotReservedAt + minCompletionSeconds`.
- `now < slotExpiresAt`.

Plaintext code chỉ xuất hiện trong response của endpoint phát hành code. Database chỉ lưu hash.

## 4. Google Forms Webhook

Hai endpoint sau không dùng JWT. Apps Script phải gửi token trong header `X-Webhook-Token`.

| Method | Path | Mục đích |
|---|---|---|
| `POST` | `/webhooks/google-forms/{surveyId}/verify` | Kiểm tra cấu hình Apps Script |
| `POST` | `/webhooks/google-forms/{surveyId}` | Nhận Google Form response |

### 4.1. Kiểm tra kết nối

```json
{
  "formId": "FORM_ID"
}
```

Backend xác minh token và form ID, sau đó ghi `webhookVerifiedAt`.

### 4.2. Form submit callback

```json
{
  "formId": "FORM_ID",
  "responseId": "GOOGLE_RESPONSE_ID",
  "submittedAt": "2026-09-23T10:30:00Z",
  "completionCode": "7K9MPQ2R4X"
}
```

Backend thực hiện:

1. Xác minh webhook token và form ID.
2. Chống callback trùng bằng `(formId, responseId)`.
3. Hash completion code và tìm participation tương ứng.
4. Kiểm tra thời điểm submit và trạng thái participation.
5. Chuyển `RESERVED → SUBMITTED → VERIFIED`.
6. Tăng response count và cộng cố định 10 credit đúng một lần.

## 5. Error mapping

| HTTP status | Trường hợp |
|---|---|
| `400` | Request hoặc field không hợp lệ |
| `401` | Thiếu/sai access token hoặc webhook token |
| `403` | Access token hợp lệ nhưng không đủ quyền truy cập endpoint |
| `404` | Survey/participation không tồn tại, không thuộc user hoặc không được phép nhìn thấy |
| `409` | Trùng response ID, participation đang hoạt động hoặc state conflict |
| `422` | Vi phạm business rule: hết slot, quá sớm để lấy code hoặc thiếu phí tạo survey |

## 6. Idempotency

- Callback lặp lại với cùng `(formId, responseId)` trả lại kết quả đã xử lý và không tạo reward mới.
- Publish, close, cancel và phát code kiểm tra trạng thái hiện tại trước khi tạo side effect.
- Reward transaction sử dụng participation ID làm business reference duy nhất.
