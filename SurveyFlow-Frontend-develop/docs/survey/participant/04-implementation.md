# 04 — Cấu trúc triển khai và kiểm thử

## Phân chia trách nhiệm

| File                                                         | Trách nhiệm                                          |
| ------------------------------------------------------------ | ---------------------------------------------------- |
| `app/pages/SurveyDetailPage/SurveyDetailPage.tsx`            | Ghép phần tham gia vào trang                         |
| `app/components/SurveyParticipation/SurveyParticipation.tsx` | Đăng ký, đếm ngược, mã và trạng thái                 |
| `app/hooks/queries/survey/use-participation.ts`              | Queries, mutations, polling, cache và persistence ID |
| `app/apis/participation.api.ts`                              | Transport, unwrap, lựa chọn mock                     |
| `app/types/participation.type.ts`                            | Participation và CompletionCode                      |
| `app/mocks/participation.mock.ts`                            | Giữ chỗ và cấp mã demo                               |
| `app/constants/query-keys.ts`                                | Query key theo tài khoản và khảo sát                 |

Code giữ cấu trúc theo layer; docs tổ chức theo feature.

## Kiểm thử tự động

- `app/apis/participation.api.test.ts`: đường dẫn đăng ký/cấp mã, unwrap và lỗi.
- `app/mocks/participation.mock.test.ts`: thời gian chờ và hết hạn cấp mã.
- `app/pages/SurveyDetailPage/SurveyDetailPage.test.tsx`: khu vực đăng ký và hướng dẫn cạnh link form.

Quality gates: `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.

## Kiểm tra thủ công

1. Dùng khảo sát PUBLISHED, tài khoản khác người tạo, backend và Apps Script có trigger.
2. Đăng ký, kiểm tra thời gian chờ và hạn giữ chỗ.
3. Reload trong cùng phiên, kiểm tra lượt được khôi phục.
4. Lấy mã, gửi Google Form và chờ VERIFIED, kiểm tra thưởng.
5. Cấp lại mã, xác nhận mã cũ không hợp lệ.
6. Kiểm tra lỗi mạng, hết chỗ, targeting không phù hợp, hết hạn.
7. Kiểm tra mobile/desktop, bàn phím, focus và thông báo lỗi.

Đây là hướng dẫn kiểm tra, không phải tuyên bố E2E đã chạy với Google Form thật. Mock giữ dữ liệu trong bộ nhớ, đặt lại khi reload và không kiểm chứng webhook/cộng thưởng.

## Kết quả review hiện tại

- Typecheck và 63 tests đạt ở lần review; format toàn repository chưa đạt do README gốc. Chưa chạy E2E Google Form thật.
- RESERVED đã quá slotExpiresAt có thể chưa có nút đăng ký lại khi GET backend vẫn trả RESERVED.
- Khi polling nhận VERIFIED, hook chưa invalidate ví/lịch sử Credits và detail/discovery; dữ liệu hiển thị có thể chưa cập nhật.
- Mock reset khi reload nhưng publicId trong sessionStorage vẫn tồn tại, có thể làm lỗi tải lượt và khóa đăng ký.

Các mục trên là giới hạn code đã phát hiện, chưa được sửa trong lần cập nhật docs này.

## Chuẩn tên câu hỏi mã (28/09/2026)

`SURVEY_CODE_QUESTION` trong `app/constants/survey.ts` có giá trị duy nhất `Mã xác nhận SurveyFlow`. Script generator, hướng dẫn Creator và Participant dùng chung cấu hình frontend này trong khi DB backend chưa lưu config. Tests giả lập Apps Script dùng cùng tên; có assertion cố định tên chuẩn. Lint, typecheck, 63 tests và build đạt; format toàn repository vẫn lỗi README gốc, các file sửa đã được format. Chưa kiểm tra lại Google Form thật.
