# Luồng người dùng và trạng thái giao diện

## Tạo đơn ở ví Credits

1. Đăng nhập và mở `/credits`.
2. Form **Nạp Credits** xuất hiện khi `VITE_ENABLE_PAYMENT_DEMO=true` hoặc `VITE_ENABLE_MOCK=true`.
3. Nhập một số nguyên từ **10 Credits** trở lên. Ví dụ `11` hiển thị số tiền **tham khảo** `1.100 VNĐ` theo công thức `credits × 100`.
4. Bấm **Tiếp tục giả lập thanh toán**. Trong lúc tạo đơn, nút bị khóa và hiện trạng thái đang tạo. Nếu request lỗi, trang hiện thông báo lỗi; người dùng vẫn ở `/credits`.
5. Khi API trả `payment.id`, frontend chuyển sang `/payments/demo/{paymentId}`.

Frontend chỉ cho gửi khi số Credits và số VNĐ ước tính đều là số nguyên an toàn của JavaScript. Ô trống, số dưới 10 hoặc số thập phân không thể tiếp tục. Backend kiểm tra lại request và tự tính `amountVnd`; số tiền hiển thị ở checkout lấy từ response của backend, không lấy từ phép tính ước lượng trên form.

## Chọn kết quả trên trang checkout

Trang checkout gọi API để lấy đơn theo ID trên URL. Khi đơn còn `PENDING`, người dùng có ba lựa chọn:

| Lựa chọn               | Trạng thái đơn sau khi xử lý | Ảnh hưởng tới ví                                 |
| ---------------------- | ---------------------------- | ------------------------------------------------ |
| **Giả lập thành công** | `SUCCESS`                    | Cộng Credits và có một giao dịch `CREDIT_TOPUP`. |
| **Giả lập thất bại**   | `FAILED`                     | Không đổi.                                       |
| **Hủy thanh toán**     | `CANCELLED`                  | Không đổi.                                       |

Trong lúc gửi kết quả, cả ba nút bị khóa. Khi request thành công, frontend tải lại chi tiết đơn, ví và lịch sử giao dịch; các nút kết quả biến mất sau khi đơn đã kết thúc. Nút **Về ví Credits** quay về `/credits`. Muốn thử một kết quả khác, hãy tạo **đơn mới**.

## Những trường hợp giao diện cần nhận biết

| Tình huống                                                              | Hiển thị hoặc xử lý hiện tại                                                     |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Đang tải đơn                                                            | Thông báo “Đang tải đơn thanh toán...”.                                          |
| ID trên URL không phải số nguyên dương                                  | Thông báo mã đơn không hợp lệ; không gọi API xem đơn.                            |
| Không tải được đơn, kể cả đơn không tồn tại hoặc không thuộc người dùng | Hiển thị lỗi trả về từ lớp xử lý lỗi chung.                                      |
| Gửi kết quả thất bại                                                    | Thông báo lỗi; người dùng có thể xem trạng thái đơn hiện tại.                    |
| Đơn đã `SUCCESS`, `FAILED` hoặc `CANCELLED`                             | Hiển thị trạng thái đã lưu, không còn nút chọn kết quả.                          |
| Frontend tắt cả demo lẫn mock                                           | Route checkout chỉ hiện thông báo tính năng dành cho dev/staging; không tải đơn. |

Hai route nằm trong layout yêu cầu đăng nhập. Cờ frontend quyết định **hiển thị giao diện**; backend quyết định quyền truy cập và chỉ đăng ký API demo trên profile `dev` hoặc `staging` khi không bật `prod`.
