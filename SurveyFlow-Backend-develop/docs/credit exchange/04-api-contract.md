# Credit V1 — API Contract

Base path: `/api/v1`

## 1. Wallet API

| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/credits/wallet` | Xem ví của user hiện tại |
| `GET` | `/credits/transactions` | Xem lịch sử giao dịch |

`CreditWalletResponse` hiện vẫn trả `reservedBalance` để tương thích API, nhưng Survey V1 không tạo khoản giữ mới và giá trị này bằng 0 sau migration.

## 2. Survey credit policy

- `POST /surveys` tự động trừ `11 × targetResponseCount` credit.
- Request tạo hoặc cập nhật survey không nhận `rewardCredit`.
- Survey response trả `rewardCredit = 10` dưới dạng chính sách chỉ đọc.
- Webhook hợp lệ tự động cộng 10 credit cho Participant.
- Không còn API reserve, release hoặc xem survey budget.

## 3. Idempotency

- Phí tạo survey dùng reference `SURVEY` và survey ID.
- Reward dùng reference `SURVEY_PARTICIPATION` và participation ID.
- Retry cùng reference không được làm thay đổi balance lần thứ hai.
