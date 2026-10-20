# Credit V1 — Business Flows

## 1. Tạo survey

1. Backend validate request và `targetResponseCount`.
2. Backend tạo survey `DRAFT` trong transaction.
3. Backend tính phí `11 × targetResponseCount`.
4. Nếu đủ balance, backend trừ phí và ghi transaction `SURVEY_CREATION`.
5. Nếu bất kỳ bước nào thất bại, survey và thay đổi ví cùng rollback.

## 2. Hoàn thành survey

1. Webhook xác minh form, completion code và participation.
2. Participation chuyển sang `VERIFIED`.
3. Backend khóa ví Participant.
4. Backend cộng cố định 10 credit.
5. Backend ghi transaction `SURVEY_COMPLETION` tham chiếu participation ID.
6. Callback trùng trả kết quả cũ và không cộng thêm credit.

## 3. Xem ví

1. User gọi API wallet hoặc transaction history.
2. Backend xác định ví theo user đang đăng nhập.
3. Backend trả balance và lịch sử theo thời gian giảm dần.
