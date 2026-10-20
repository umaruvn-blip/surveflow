# 01 — Luồng người dùng

## Danh sách và chi tiết

Các route nằm trong protected layout. Chưa đăng nhập sẽ chuyển tới login và giữ redirectTo.

- `/exchange?page=1&sort=newest`: xem khảo sát phù hợp. Card hiển thị title, Credits, thời lượng, availableSlots, tiến độ và deadline.
- Bấm “Xem chi tiết” mở `/exchange/:surveyId`, giữ query danh sách trong URL để quay lại đúng trang/sắp xếp.
- Chi tiết hiển thị description, researchPurpose, participantInstructions, dataUsageNotice, questionCount, language, provider, verification và targeting.
- GET chỉ đọc dữ liệu; không giữ chỗ, phát completion code hay tạo reward. Bấm **Đăng ký tham gia** mới gọi POST giữ chỗ; xem [luồng participant](../participant/01-user-flows.md).
- Loading, lỗi có nút thử lại, danh sách rỗng và ID không hợp lệ có thông báo tiếng Việt.
- Không suy ra số chỗ còn lại chỉ từ số phản hồi: availableSlots do backend tính, bao gồm cả lượt đang giữ chỗ.
- Không hiển thị XP vì API chưa cung cấp trường này.

## Mở biểu mẫu

- Hiển thị `externalFormUrl` và nút “Mở biểu mẫu” ở sidebar chi tiết; URL dài tự xuống dòng trên mobile.
- Chỉ URL HTTPS hợp lệ được tạo link, mở tab mới với `noopener noreferrer`; thiếu/sai URL hiển thị thông báo chưa có link hợp lệ.
- Mở link trực tiếp không giữ chỗ hoặc cấp mã hoàn thành. UI hướng dẫn đăng ký tham gia, lấy mã và nhập vào biểu mẫu để xác minh và nhận Credits.
- Kiểm tra link, thuộc tính tab mới và fallback URL thiếu/không an toàn, sau đó chạy các quality gates.

## Liên kết với participant

- Đăng ký thành công invalidate detail và danh sách discovery để tải lại capacity.
- Discovery không cấp mã hoặc phát thưởng; các API participant và webhook backend đảm nhiệm luồng này.
- Không đồng nhất quyền xem detail với điều kiện đăng ký: non-owner có thể xem PUBLISHED qua link trực tiếp, còn giữ chỗ phải kiểm tra thời gian, capacity và eligibility ở backend.
- Targeting là quy tắc chính thức. Việc tạm tắt kiểm tra targeting khi test backend không thay đổi phạm vi discovery hoặc contract nghiệp vụ.
