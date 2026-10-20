# 02 — Trạng thái giao diện

## Danh sách `/exchange`

| Trạng thái          | Hành vi                                                 |
| ------------------- | ------------------------------------------------------- |
| Đang tải            | Skeleton card                                           |
| Có dữ liệu          | Card summary, phân trang và sắp xếp                     |
| Lỗi API             | Thông báo tiếng Việt và nút thử lại                     |
| Rỗng                | Thông báo chưa có khảo sát phù hợp, link cập nhật hồ sơ |
| Trang ngoài phạm vi | Nút về trang đầu                                        |
| Làm mới             | Tải lại trang dữ liệu hiện tại                          |

## Chi tiết `/exchange/:surveyId`

| Trạng thái                   | Hành vi                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------- |
| ID không hợp lệ              | Báo mã khảo sát không hợp lệ, không gọi API detail                            |
| Đang tải                     | Skeleton nội dung                                                             |
| 404 hoặc không có quyền      | Báo không tìm thấy khảo sát                                                   |
| Lỗi tải                      | Thông báo lỗi và nút thử lại                                                  |
| Có dữ liệu                   | Tiêu đề, trạng thái, nội dung nghiên cứu, targeting, reward và thông tin form |
| Có câu hỏi nhạy cảm          | Badge cảnh báo và thông báo sử dụng dữ liệu                                   |
| Thiếu nội dung tùy chọn      | Text fallback cho từng trường                                                 |
| Hết hạn/hết chỗ/chưa mở      | Thông báo tình trạng tiếp nhận                                                |
| Chủ khảo sát                 | Link quản lý khảo sát của tôi                                                 |
| URL HTTPS hợp lệ             | Link và nút Mở biểu mẫu, tab mới với noopener noreferrer                      |
| URL thiếu/sai/có credentials | Thông báo chưa có link hợp lệ                                                 |

Nội dung text được render bằng React, không chèn HTML tùy ý. URL dài xuống dòng. Ngày giờ hiển thị GMT+7. Credits xuất hiện ở header trên mobile và sidebar ở desktop. Button/link dùng semantic và focus theo design system.

Trạng thái đăng ký, lấy mã và xác minh xem [Participant UI states](../participant/02-ui-states.md).
