# 04 — Cấu trúc triển khai và kiểm thử

## Phân chia trách nhiệm

| File                                                         | Trách nhiệm                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| `app/pages/SurveyExchangePage/SurveyExchangePage.tsx`        | Danh sách, sort, pagination và các trạng thái                 |
| `app/components/SurveyDiscoveryCard/SurveyDiscoveryCard.tsx` | Card summary và link detail                                   |
| `app/pages/SurveyDetailPage/SurveyDetailPage.tsx`            | Nội dung chi tiết, link form và ghép participant              |
| `app/routes/survey-detail.tsx`                               | Route module mỏng                                             |
| `app/hooks/queries/survey/use-survey-discovery.ts`           | Queries danh sách/detail                                      |
| `app/apis/survey.api.ts`                                     | Transport và unwrap response                                  |
| `app/types/survey-discovery.type.ts`                         | Options phân trang/sắp xếp                                    |
| `app/types/survey-management.type.ts`                        | SurveySummary và SurveyDetail dùng chung                      |
| `app/utils/survey-discovery.ts`                              | URL params, format và helpers                                 |
| `app/mocks/survey-discovery.mock.ts`                         | Fixtures, lọc discovery, sort, pagination và quyền đọc detail |

## Kiểm thử tự động

- `app/apis/survey.api.test.ts`: params, GET detail, không N+1 và không tự POST participation.
- `app/utils/survey-discovery.test.ts`: params, format và quy tắc discovery.
- `app/mocks/survey-discovery.mock.test.ts`: pagination, sort, targeting và quyền đọc.
- `app/pages/SurveyDetailPage/SurveyDetailPage.test.tsx`: nội dung chi tiết, back URL, loading/invalid ID, URL form và phần đăng ký.

## Kiểm tra thủ công

- Pagination/sort gửi đúng params, danh sách chỉ gọi một GET, detail gọi đúng ID.
- Refresh/deep-link, quay lại đúng page/sort.
- Loading, empty, lỗi retry, không tìm thấy và ID không hợp lệ.
- Mock: loại owner/draft/closed/hết hạn/hết chỗ/targeting không phù hợp.
- GET detail chỉ đọc: xem trang không tự tạo participation hoặc reward. Nút đăng ký là thao tác riêng, kiểm tra theo [participant](../participant/04-implementation.md).
- Responsive 390px/1440px, labels và keyboard focus.
- Chạy format, lint, typecheck, test và build.

## Kết quả kiểm tra giai đoạn discovery ban đầu (27/09/2026)

Kết quả dưới đây ghi nhận trước khi tích hợp participant, không chứng minh luồng giữ chỗ hoặc webhook hoạt động.

- `/exchange`: card dùng summary từ một request mỗi trang, phân trang 12 item, sắp xếp mới nhất/cũ nhất/thưởng cao nhất, nút làm mới và trạng thái loading/error/empty.
- `/exchange/:surveyId`: nội dung nghiên cứu, thông báo dữ liệu nhạy cảm, reward, thời lượng, số câu hỏi, capacity, deadline, targeting và phương thức xác minh. Mobile hiển thị Credits ngay ở phần đầu trang.
- Query key chứa page/sort; detail dùng key theo survey ID. Thay đổi hồ sơ/sở thích và publish/close tiếp tục invalidation theo prefix discovery hiện có.
- Chuẩn hóa `SurveySummary` theo response backend, giữ `PageResponse<T>` ở nhóm API response chung. Không thêm dependency hay biến môi trường.
- Dữ liệu mock có 15 khảo sát, phân trang được; dùng cùng nguồn khảo sát Creator cho luồng publish → người khác xem → close. Mock trả snapshot để UI không sửa dữ liệu nguồn.
- Browser mock đã kiểm tra: login giữ redirect, sort, trang 2, mở detail, refresh/deep-link, quay lại đúng page/sort, dữ liệu nhạy cảm, ID sai, không tìm thấy, trang ngoài phạm vi và về trang đầu.
- Danh sách và chi tiết không tràn ngang ở 390px/1440px; kiểm tra ảnh mobile và desktop. GET detail không thay đổi số dư Credits.
- Tests tự động kiểm tra params API, không phát POST khi xem, không có N+1 requests, pagination, quyền xem mock, targeting, URL params, format, fallback và nội dung chi tiết.
- Chưa kiểm tra E2E với backend chạy thật; API contract đã đối chiếu controller/service/response types trong repository.
- Quality gates đều đạt: `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`. Tổng cộng **22 test files / 55 tests passed**; `git diff --check` không có lỗi.

## Kết quả bổ sung link biểu mẫu

Kết quả bổ sung: đã hiển thị URL và nút mở tab mới, có fallback khi URL thiếu/không hợp lệ. Tests kiểm tra HTTPS, thuộc tính tab mới, thông báo xác minh và chặn URL có credentials/javascript. Cả năm quality gates đều đạt, **22 files / 60 tests passed**. Phần link mới chưa kiểm tra browser với Google Form thật; bố cục dùng `min-w-0` và `break-all` để URL dài xuống dòng.
