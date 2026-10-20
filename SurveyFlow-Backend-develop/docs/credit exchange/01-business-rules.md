# Credit V1 — Business Rules

## 1. Ví và giao dịch

- Mỗi user có đúng một `CreditWallet`.
- `balance` luôn không âm.
- Mọi thay đổi balance phải tạo `CreditTransaction` trong cùng transaction.
- `referenceType` và `referenceId` xác định nguồn nghiệp vụ và hỗ trợ idempotency.

## 2. Phí tạo survey

- Creator trả `11 × targetResponseCount` credit khi tạo survey.
- Nếu không đủ balance, toàn bộ thao tác tạo survey rollback.
- Mỗi survey chỉ bị trừ phí tạo một lần.
- `targetResponseCount` không được thay đổi sau khi survey được tạo.
- Publish và đóng survey không tạo thêm khoản trừ hoặc hoàn credit.

## 3. Reward hoàn thành survey

- Participation chỉ nhận reward sau khi chuyển sang `VERIFIED` hoặc `VALID`.
- Reward cố định là 10 credit và do hệ thống phát hành.
- Reward không lấy từ ví Creator và Survey không có `rewardCredit` hay `SurveyCreditBudget`.
- Một participation chỉ được tạo một transaction `SURVEY_COMPLETION`.
- Callback webhook lặp lại không được cộng reward lần nữa.

## 4. Các khoản credit khác

- User mới nhận 200 credit đúng một lần.
- Người giới thiệu nhận 50 credit đúng một lần khi referral hợp lệ.
- Top-up thành công cộng credit đúng một lần theo payment.
