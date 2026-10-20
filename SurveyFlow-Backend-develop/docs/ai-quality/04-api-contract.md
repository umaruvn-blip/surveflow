# API contract — AI Quality Check V1

Python service mặc định chạy tại `http://localhost:8001` khi khởi động theo [README](../../ai-quality/README.md).

| Method | Path | Mục đích |
| --- | --- | --- |
| `GET` | `/health` | Kiểm tra service và `model_version` |
| `POST` | `/api/v1/quality/check` | Chấm tín hiệu thời gian của một participation |

## Request mẫu

```json
{
  "participation_id": 123,
  "survey_id": 45,
  "slot_reserved_at": "2026-09-24T09:00:00Z",
  "submitted_at": "2026-09-24T09:03:30Z",
  "estimated_duration_seconds": 300
}
```

`participation_id` và `survey_id` phải là số nguyên dương. `estimated_duration_seconds` là tùy chọn và phải dương nếu được gửi. API từ chối timestamp thiếu múi giờ, thứ tự thời gian sai và các trường không khai báo bằng HTTP `422`.

## Response thành công mẫu — HTTP 200

```json
{
  "participation_id": 123,
  "completion_seconds": 210,
  "score": 0.7,
  "status": "GOOD",
  "reason_codes": ["COMPLETION_TIME_OK"],
  "model_version": "quality-v1-time"
}
```

Nếu không gửi `estimated_duration_seconds`, response tương ứng có `score: 0.5`, `status: "REVIEW"` và `reason_codes: ["ESTIMATED_DURATION_MISSING"]`. Swagger UI của Python service có tại `/docs`.
