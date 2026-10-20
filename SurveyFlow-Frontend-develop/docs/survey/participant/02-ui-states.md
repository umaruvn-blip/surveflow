# 02 — Trạng thái giao diện

| Trạng thái                         | Hành vi                                          |
| ---------------------------------- | ------------------------------------------------ |
| Đang tải lượt                      | Khóa đăng ký                                     |
| Chưa có lượt                       | Hiển thị Đăng ký tham gia                        |
| Đang đăng ký                       | Khóa nút, hiển thị Đang đăng ký                  |
| RESERVED, chưa đến codeAvailableAt | Đếm ngược theo giây, khóa lấy mã                 |
| RESERVED, đến thời điểm và còn hạn | Cho phép lấy hoặc tạo lại mã                     |
| Đã có mã                           | Hiển thị mã, sao chép và hướng dẫn nhập vào form |
| SUBMITTED                          | Đang xác minh                                    |
| VERIFIED/VALID                     | Đã xác minh và nhận thưởng / Đã hoàn thành       |
| REJECTED                           | Không được xác minh                              |
| EXPIRED/CANCELLED                  | Hiển thị trạng thái và nút đăng ký lượt mới      |
| Lỗi tải lượt                       | Hiển thị lỗi và Tải lại lượt tham gia            |
| Lỗi đăng ký/lấy mã                 | Hiển thị lỗi, cho phép thử lại                   |
| Clipboard thất bại                 | Hướng dẫn sao chép mã thủ công                   |

Nút đăng ký khóa khi chưa đăng nhập, là chủ khảo sát, khảo sát chưa mở/hết hạn/hết chỗ hoặc phương thức chưa hỗ trợ. Backend vẫn kiểm tra nghiệp vụ.

Hạn giữ chỗ hiển thị bằng ngày giờ. Sau slotExpiresAt không cho lấy mã dù backend chưa cập nhật trạng thái. Thông báo dùng role=status, lỗi dùng role=alert. Các nút dùng Button có focus/keyboard; mã cho phép xuống dòng trên màn hình nhỏ.
