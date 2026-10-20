# Google SSO — API Contract (V1)

Base path `/api/v1`. API nghiệp vụ tiếp tục nhận access token Survey Flow; Google ID/access token không phải credential cho API.

| Method | Path | Mục đích | Auth |
|---|---|---|---|
| `GET` | `/api/v1/auth/oauth2/google` | Lưu `redirectTo` an toàn và bắt đầu Google login | Public |
| `GET` | `/login/oauth2/code/google` | Callback do Spring Security xử lý | Provider callback |
| `POST` | `/api/v1/auth/refresh` | Đổi refresh cookie thành app access token sau callback | HttpOnly refresh cookie |
| `POST` | `/api/v1/auth/oauth2/google/link` | Bắt đầu flow liên kết Google | App access token |

## 1. Bắt đầu đăng nhập

`GET /api/v1/auth/oauth2/google?redirectTo=%2Fdashboard` điều hướng trình duyệt qua Spring Security OAuth2 Login. `redirectTo` chỉ nhận relative path nội bộ; backend giữ giá trị trong session OAuth ngắn hạn, không tin callback query tùy ý.

## 2. Callback thành công

Callback do backend xử lý. Backend đặt cookie refresh token HttpOnly, Secure ở môi trường HTTPS, SameSite phù hợp với deployment, sau đó redirect về frontend URL cấu hình cố định với trạng thái hoàn tất không nhạy cảm. Frontend gọi API lấy app session/user theo luồng hiện tại.

Không đưa access token, refresh token, Google code hoặc Google ID token vào URL redirect.

## 3. Email đã tồn tại / identity conflict

Backend redirect về route login với mã lỗi công khai như `ACCOUNT_LINK_REQUIRED` hoặc trang liên kết; không trả email đầy đủ trong URL. Chi tiết user chỉ hiển thị sau khi user đã xác thực bằng phương thức hiện hữu.

## 4. Link / unlink

`POST /api/v1/auth/oauth2/google/link` khởi tạo authorization flow gắn intent và user ID server-side. Callback link không phát app session mới và không chấp nhận user ID từ trình duyệt để chọn tài khoản đích.

V1 chưa có thao tác gỡ liên kết.

## 5. Lỗi dự kiến

| HTTP/status code nội bộ | Trường hợp |
|---|---|
| Redirect `?oauth=failed` | Callback hỏng, tài khoản bị khóa hoặc Google từ chối |
| Redirect `?oauth=link-required` | Email Google thuộc user hiện có chưa được liên kết |
| Redirect `?oauth=link-conflict` | Google identity đã gắn với user khác |
| `401` | Thiếu hoặc access token không hợp lệ khi bắt đầu link |
| `409` | Identity Google đã thuộc user khác |

Thông báo cho người dùng không tiết lộ tài khoản có tồn tại hay không ngoài các bước đã được xác thực.
