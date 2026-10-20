# Payment Demo — Trạng thái và luồng xử lý

| Trạng thái hiện tại | Yêu cầu | Kết quả | Ví Credits |
| --- | --- | --- | --- |
| `PENDING` | `SUCCESS` | `SUCCESS`, có `paidAt` | Cộng Credits và ghi một ledger entry. |
| `PENDING` | `FAILED` | `FAILED`, có `failedAt` | Không đổi. |
| `PENDING` | `CANCELLED` | `CANCELLED`, có `cancelledAt` | Không đổi. |
| Trạng thái cuối | Cùng kết quả | Trả lại đơn hiện có | Không đổi. |
| Trạng thái cuối | Kết quả khác | `409 CONFLICT` | Không đổi. |

`REFUNDED` có trong enum chung nhưng không phải kết quả hợp lệ của checkout demo và không có API hoàn tiền trong phạm vi này.

## Luồng thành công

1. `POST /payments/topups` tạo payment `PENDING` với số Credits và VND đã chốt.
2. Trang checkout đọc đơn bằng `GET /payments/{paymentId}`.
3. Người dùng chọn thành công; frontend gửi `POST /payments/{paymentId}/demo-result` với `SUCCESS`.
4. Backend kiểm tra chủ sở hữu và loại đơn, khóa payment, khóa ví, cộng số dư, ghi `credit_transactions` tham chiếu `payment_id`, rồi cập nhật payment. Tất cả cùng một transaction.
5. Trang ví tải lại số dư và lịch sử giao dịch.

## Luồng thất bại hoặc hủy

Các bước 1–3 tương tự, nhưng kết quả là `FAILED` hoặc `CANCELLED`. Backend chỉ đổi trạng thái payment và thời điểm tương ứng. Người dùng muốn thử kết quả khác phải tạo **đơn mới**.
