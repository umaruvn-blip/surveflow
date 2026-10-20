# Frontend quản lý khảo sát

## Plan và phạm vi

1. Viết tài liệu trước khi triển khai.
2. Tạo/sửa draft với React Hook Form + Zod, API riêng và TanStack Query.
3. Sinh cấu hình Google Forms webhook, hướng dẫn Apps Script và đọc trạng thái xác minh từ server.
4. Publish/close với xác nhận ngân sách và cập nhật cache.
5. Kiểm tra validation, mock, typecheck, lint, tests, build; cập nhật kết quả.

## Luồng Creator

- `/create-survey`: tạo draft. Lưu thành công mở `/my-surveys/:surveyId`.
- `/my-surveys`: danh sách có phân trang; mở từng khảo sát để quản lý.
- `/my-surveys/:surveyId`: chỉ Creator sở hữu khảo sát được quản lý. Sửa khi DRAFT; PUBLISHED/CLOSED chỉ xem cấu hình.
- Nhập URL đầy đủ `https://docs.google.com/forms/d/.../viewform` (hoặc `/d/e/.../viewform`), không dùng link rút gọn forms.gle.
- Google Form phải được mở cho đối tượng trả lời dự kiến; kiểm tra URL người trả lời trong cửa sổ riêng trước khi đưa lên hệ thống.
- Google Form có câu hỏi trả lời ngắn bắt buộc tên `Mã hoàn thành SurveyFlow`.
- Lưu draft trước khi cấu hình webhook. Mỗi lần sinh lại token vô hiệu hóa token cũ và trạng thái verified. Token/script chỉ ở bộ nhớ trang, không lưu local/session storage.
- Dán script vào Apps Script gắn với Google Form, chạy setup để cấp quyền và tạo trigger, chạy verifyConnection; sau đó bấm kiểm tra trạng thái trong SurveyFlow.
- Backend phải có HTTPS công khai để Google Apps Script truy cập. URL localhost chỉ dùng phát triển, không dùng kết nối thật.
- Publish yêu cầu webhook verified, deadline còn hiệu lực và đủ ngân sách `rewardCredit × targetResponseCount`. Backend quyết định cuối cùng.
- Close ngừng nhận lượt tham gia mới. Backend xử lý các lượt đang hoạt động và hoàn ngân sách khi đủ điều kiện.

## API

Base URL lấy từ `VITE_API_BASE_URL`, có prefix `/api/v1`. Không có biến môi trường mới.

| Hành động              | Endpoint                                        |
| ---------------------- | ----------------------------------------------- |
| Tạo draft              | POST /surveys                                   |
| Sửa draft              | PUT /surveys/:id                                |
| Danh sách              | GET /surveys/mine?page=&size=                   |
| Chi tiết               | GET /surveys/:id                                |
| Sinh token             | POST /surveys/:id/webhook-configuration         |
| Đọc trạng thái kết nối | GET /surveys/:id → verification.webhookVerified |
| Publish/close          | POST /surveys/:id/publish hoặc /close           |

Apps Script gửi `X-Webhook-Token` đến endpoint verify và callback. Frontend không gọi verify để tránh tạo trạng thái xác minh giả. Script có hàng đợi retry callback; responseId là khóa chống trùng phía backend. Không chia sẻ script đã chứa token.

## Kiểm tra thủ công

1. Tạo draft, tải lại trang, sửa và kiểm tra dữ liệu được giữ.
2. Sinh token, setup Apps Script, verifyConnection, đọc trạng thái thành công.
3. Sinh lại token: verified trở về false; script cũ không hoạt động.
4. Publish khi đủ credit; lỗi thiếu credit hiển thị và giữ DRAFT.
5. Khảo sát xuất hiện trong discovery nếu phù hợp targeting.
6. Submit Google Form với completion code thật, kiểm tra phản hồi backend.
7. Close, kiểm tra CLOSED và trạng thái ngân sách.
8. Kiểm tra bàn phím và giao diện ở 390px/1440px.

Mock lưu dữ liệu Creator trong bộ nhớ, tách theo tài khoản; tải lại trang hoặc cập nhật module khi phát triển sẽ reset dữ liệu demo. Mock mô phỏng publish/close và ngân sách; không chứng minh Google Forms kết nối thật. Cần kiểm tra tích hợp bằng backend và tài khoản Google của Creator.

## Cấu trúc triển khai

- `app/apis/survey-creator.api.ts`: transport thật hoặc mock, unwrap ApiResponse.
- `app/hooks/queries/survey/use-survey-creator.ts`: query theo page/id, cập nhật chi tiết và invalidate danh sách; publish/close invalidate discovery, ví và lịch sử Credits.
- `app/schemas/survey.schema.ts`: validation URL, số nguyên, ngân sách, thời hạn, dữ liệu nhạy cảm và khoảng targeting.
- `app/components/SurveyDraftForm`: form dùng chung cho tạo/sửa/xem.
- `app/pages/SurveyManagePage`: hướng dẫn Apps Script, đọc verified, xác nhận token/publish/close.
- `app/utils/google-forms-script.ts`: tạo script gắn với Google Form, kiểm tra form ID thật, trigger và callback có retry.
- `app/mocks/survey-creator.mock.ts`: lifecycle DRAFT/PUBLISHED/CLOSED; không tự publish khi lưu.

Không có dependency mới. Form khóa trong lúc lưu và sau publish. Thay đổi chưa lưu sẽ khóa thao tác webhook/publish. Token không nằm trong URL, storage hoặc logs. Các lỗi API không tự chuyển sang mock.

Script dựa trên [Google Forms events](https://developers.google.com/apps-script/guides/triggers/events), [Form API](https://developers.google.com/apps-script/reference/forms/form) và [installable triggers](https://developers.google.com/apps-script/guides/triggers/installable). Retry queue dùng Script Properties; theo dõi Executions và giới hạn dịch vụ Apps Script khi vận hành khảo sát có lượng phản hồi lớn.

## Kết quả kiểm tra (27/09/2026)

- Browser mock: tạo/sửa draft, validation trường trống, sinh/đổi token, reset verified, mô phỏng và đọc lại verified, publish, close, cập nhật danh sách.
- Budget demo 110 Credits: số dư khả dụng 120 → 10 khi publish → 120 sau close; header và trang quản lý cùng cập nhật.
- Responsive: form và danh sách không tràn ngang ở viewport 390px và 1440px; kiểm tra dialog và điều hướng qua giao diện.
- Tests: schema, API transport không tự publish/không fallback, reset form với trường null, query invalidation, mock ownership và lifecycle, chống publish đồng thời, script verify/callback/retry bằng môi trường giả lập.
- Chưa chạy E2E với Google Form thật/backend thật: cần tài khoản Google của Creator và backend HTTPS công khai. Checklist ở trên là bước kiểm tra tích hợp trước khi vận hành.

- Quality gates: `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` đều thành công. Vitest: **18 test files, 44 tests passed**.

## Quy ước tên type Frontend

Đặt tên theo vai trò dữ liệu: `SurveySummary` cho danh sách, `SurveyDetail` cho chi tiết, `SurveyDraftInput` cho dữ liệu tạo/sửa draft và `SurveyWebhookConfiguration` cho cấu hình webhook. Các type nằm trong `app/types/survey-management.type.ts`. Tên type độc lập với tên class backend; cấu trúc dữ liệu vẫn tuân theo API contract.

`PageResponse<T>` là kiểu phân trang dùng chung, đặt trong `app/types/api-response.type.ts` cùng `ApiResponse<T>` và `ErrorResponse`. `app/utils/api-response.ts` chứa các hàm xử lý response. Các API phân trang sử dụng `ApiResponse<PageResponse<T>>`.
