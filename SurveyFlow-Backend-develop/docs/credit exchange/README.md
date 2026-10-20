# Credit V1

Credit V1 quản lý ví người dùng và lịch sử tăng, giảm credit. Survey không có ngân sách reward riêng và Creator không tài trợ reward theo từng participation.

Các chính sách cố định:

- Đăng ký tài khoản: cộng 200 credit.
- Tạo survey: trừ `11 × targetResponseCount` credit một lần.
- Hoàn thành survey hợp lệ: hệ thống cộng 10 credit cho Participant.
- Giới thiệu hợp lệ: cộng 50 credit cho người giới thiệu.

Domain model chính gồm `CreditWallet`, `CreditTransaction`, `Survey` và `SurveyParticipation`.

## Danh sách tài liệu

1. [Business Rules](./01-business-rules.md)
2. [State Transitions](./02-state-transitions.md)
3. [Business Flows](./03-business-flows.md)
4. [API Contract](./04-api-contract.md)
