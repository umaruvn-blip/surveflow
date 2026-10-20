# Survey Documentation

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | V1 |
| Domain | Survey |

## Mục tiêu và phạm vi

Bộ tài liệu này định nghĩa nghiệp vụ Survey V1, bao gồm:

- Tạo, cấu hình, xuất bản, ẩn và đóng survey.
- Targeting và kiểm tra điều kiện tham gia.
- Giữ chỗ và quản lý vòng đời participation.
- Xác minh kết quả survey.
- Giữ, phân phối và hoàn trả credit.
- Các bất biến nghiệp vụ và tác vụ nền liên quan.

Ngoài phạm vi V1:

- Form nội bộ và lưu câu trả lời trực tiếp trong Survey Flow.
- Phí nền tảng và survey boost.
- Quality score tác động trực tiếp đến reward.
- Quy trình consent và kiểm duyệt dữ liệu nhạy cảm nâng cao.
- Thay đổi reward, target response hoặc targeting sau publish.
- Cho phép tham gia lại sau `REJECTED`.
- Admin override participation và reconciliation thủ công.

## Actor

- **Creator**: người tạo, cấu hình và xuất bản survey.
- **Participant**: người tìm và tham gia survey.
- **System**: kiểm tra điều kiện, giữ chỗ, xác minh, chuyển credit và đóng survey tự động.
- **Admin/Reviewer**: xử lý kiểm duyệt hoặc xác minh thủ công khi nghiệp vụ yêu cầu.

## Thuật ngữ

- **Survey**: metadata và cấu hình chung của khảo sát. Nội dung form có thể nằm trong hệ thống hoặc ở provider bên ngoài.
- **Targeting**: điều kiện người tham gia theo năm sinh, giới tính, trường, nghề nghiệp và sở thích.
- **Participation**: một lượt tham gia survey; đồng thời là bản ghi giữ chỗ và theo dõi xác minh.
- **Verification config**: quy tắc xác minh có version để một lượt tham gia luôn dùng đúng cấu hình tại thời điểm bắt đầu.
- **Credit wallet**: số dư khả dụng và số dư đang được giữ của người dùng.
- **Completion code**: mã dùng một lần do Survey Flow phát hành để liên kết một participation với một Google Form response.
- **Form webhook**: callback do Google Apps Script gửi về Survey Flow khi Google Form được submit.

## Danh sách tài liệu

1. [Business Rules](./01-business-rules.md): các quy tắc và bất biến nghiệp vụ của Survey V1.
2. [State Transitions](./02-state-transitions.md): vòng đời và điều kiện chuyển trạng thái của Survey và Participation.
3. [Business Flows](./03-business-flows.md): các luồng tạo, publish, khám phá, tham gia, xác minh và trả thưởng.
4. [API Contract](./04-api-contract.md): endpoint, payload, authorization và idempotency của Survey API V1.

## Domain model liên quan

- `Survey`, `SurveyTargeting`, `SurveyTargetInterest`, `SurveyTagMapping`
- `SurveyVerificationConfig`, `SurveyParticipation`
- `CreditWallet`, `CreditTransaction`
- `SurveyStatus`, `ParticipationStatus`
- `SurveyProvider`, `SurveyVerificationMethod`
