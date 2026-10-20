# Payment Demo — API contract

Base path: `/api/v1/payments`. Ba endpoint dưới đây yêu cầu access token của người dùng và chỉ có trên backend bật `dev` hoặc `staging` mà không bật `prod`. Response thành công dùng `ApiResponse<TopupPaymentResponse>`; lỗi dùng `ErrorResponse` chung.

| Method | Path | Mục đích | HTTP thành công |
| --- | --- | --- | --- |
| `POST` | `/topups` | Tạo đơn nạp demo. | `201` |
| `GET` | `/{paymentId}` | Xem đơn nạp demo của chính mình. | `200` |
| `POST` | `/{paymentId}/demo-result` | Chốt một kết quả giả lập. | `200` |

## Tạo đơn

Request:

```http
POST /api/v1/payments/topups
Authorization: Bearer <access-token>
Content-Type: application/json

{"credits":11}
```

`credits` bắt buộc, là số nguyên từ 10 trở lên. Số tiền không được client gửi lên; backend tính 11 × 100 = 1.100 VNĐ. Ví chưa thay đổi sau bước này.

Response `201` (thời điểm và ID chỉ là ví dụ):

```json
{
  "status": 201,
  "code": "CREATED",
  "success": true,
  "message": "Top-up created",
  "data": {
    "id": 123,
    "credits": 11,
    "amountVnd": 1100,
    "status": "PENDING",
    "createdAt": "2026-09-30T03:00:00Z",
    "paidAt": null
  }
}
```

## Xem đơn

`GET /api/v1/payments/123` trả cùng cấu trúc `data` với trạng thái hiện tại, bọc trong `ApiResponse` mã `SUCCESS`. Người dùng khác không thể xem đơn này (`404`).

## Chọn kết quả demo

```http
POST /api/v1/payments/123/demo-result
Authorization: Bearer <access-token>
Content-Type: application/json

{"outcome":"SUCCESS"}
```

`outcome` bắt buộc và chỉ nhận `SUCCESS`, `FAILED`, `CANCELLED`. Response `200` trả đơn đã cập nhật. `paidAt` chỉ có giá trị khi `SUCCESS`; DTO hiện không trả `failedAt` hoặc `cancelledAt`. Đây là thao tác của người dùng dev/staging, **không phải webhook từ cổng thanh toán**.

## Lỗi và gọi lặp

| Tình huống | HTTP | `ErrorResponse.code` |
| --- | --- | --- |
| Thiếu token/phiên không hợp lệ | `401` | Theo cơ chế xác thực chung. |
| Thiếu `credits` hoặc `outcome`; giá trị enum/body sai | `400` | `VALIDATION_ERROR` hoặc `INVALID_REQUEST`. |
| `credits < 10` | `400` | `INVALID_REQUEST`. |
| ID không tồn tại, đơn của người khác, sai provider/type | `404` | `RESOURCE_NOT_FOUND`. |
| Đơn đã kết thúc với kết quả khác | `409` | `CONFLICT`. |

Gửi lại cùng `outcome` sau khi đơn kết thúc trả `200` và không thực hiện cộng Credits lần thứ hai. Tạo đơn lặp lại thì **không** idempotent: mỗi request tạo một payment mới.
