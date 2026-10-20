# 03 — Tích hợp API và cache

Đường dẫn dưới đây tương đối với `/api/v1`, cần đăng nhập.

| Hành động         | API                                         |
| ----------------- | ------------------------------------------- |
| Danh sách phù hợp | GET /surveys?page=&size=12&sortBy=&sortDir= |
| Chi tiết          | GET /surveys/:id                            |

`SurveySummary` và `SurveyDetail` là type domain. Phân trang dùng `ApiResponse<PageResponse<SurveySummary>>`, các response type dùng chung nằm trong `app/types/api-response.type.ts`.

Sắp xếp: mới nhất/cũ nhất (`publishedAt`), thưởng cao nhất (`rewardCredit`). Các field phải thuộc whitelist backend. Danh sách không gọi chi tiết từng survey. Query key chứa page và sort; detail sử dụng key theo id. Creator publish/close invalidate discovery và detail liên quan.

Backend discovery lọc PUBLISHED, chưa quá deadline, còn capacity, phù hợp targeting và loại khảo sát của chính người xem. Chi tiết chỉ cho non-owner xem PUBLISHED; Creator có thể xem khảo sát của mình ở mọi trạng thái. Frontend không thay thế authorization backend.

Mock có fixtures đủ thông tin và đọc các khảo sát Creator đã publish trong cùng phiên demo. Draft/closed của người khác không thể đọc qua detail. Mock lọc targeting dựa trên profile demo. Không fallback sang mock nếu API thật lỗi.

## Query và cập nhật dữ liệu

- Danh sách: `['surveys', 'exchange', { page, sort }]`, 12 item/trang.
- Detail: `['surveys', 'detail', id]`; chỉ query khi ID là số nguyên dương an toàn.
- Page/sort nằm trong URL; giá trị không hợp lệ được chuẩn hóa.
- Thay đổi hồ sơ/sở thích và Creator publish/close invalidate discovery.
- Đăng ký tham gia thành công invalidate detail/discovery để đọc capacity mới.
- Quyền đọc detail không đồng nghĩa đủ điều kiện giữ chỗ. API participant quyết định eligibility, thời gian và capacity.
- Targeting là contract chính thức; việc tắt tạm kiểm tra khi test giữ chỗ không thay đổi contract discovery.

Xem [Participant API/cache](../participant/03-api-integration.md) cho POST giữ chỗ và cấp mã.
