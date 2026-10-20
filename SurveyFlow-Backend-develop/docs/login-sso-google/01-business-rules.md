# Google SSO — Business Rules (V1)

## 1. Tài khoản và danh tính

- `User` là hồ sơ nghiệp vụ duy nhất; có thể gắn một hoặc nhiều phương thức đăng nhập.
- Identity Google được nhận diện bằng `(issuer, subject)` (`sub`), không dùng email làm khóa identity.
- Email là thuộc tính liên hệ/đăng nhập đã chuẩn hóa, có thể thay đổi; không được dùng để tự động hợp nhất hai user.
- Tài khoản local hiện tại vẫn đăng nhập bằng email/mật khẩu. Google SSO bổ sung phương thức đăng nhập, không thay quyền, role, profile hoặc survey ownership.
- Khi tạo user mới từ Google, chỉ chấp nhận ID token đã xác minh chữ ký, issuer, audience, thời hạn, nonce/state theo OIDC; chỉ coi email phù hợp để liên hệ khi `email_verified=true`.

## 2. Tạo mới và đăng nhập lại

- Nếu identity Google đã liên kết, đăng nhập đúng user đó dù email hiện tại khác email đã lưu; yêu cầu cập nhật/đối soát email theo chính sách riêng.
- Nếu identity chưa tồn tại và email đã thuộc một user khác, không tự động liên kết chỉ vì trùng email. Trả trạng thái yêu cầu đăng nhập phương thức cũ rồi liên kết Google trong cài đặt tài khoản.
- Nếu identity và email chưa có, tạo một user cùng identity Google trong transaction; gán role mặc định như đăng ký local hiện hành và tạo profile theo luồng hiện hành.
- User bị khóa/vô hiệu hóa không được tạo phiên mới bằng Google.
- Lỗi hoặc hủy tại Google không tạo user, không thay đổi identity, không phát access/refresh token.

## 3. Email trường và Workspace

- Cho phép sinh viên dùng địa chỉ Google do trường cấp nếu Google xác thực thành công.
- Domain email đơn thuần không chứng minh người dùng là sinh viên hiện tại hoặc trường đang quản lý tài khoản. Nếu cần đánh dấu “email trường”, phải cấu hình danh sách domain đã xác minh và lưu trạng thái/nguồn xác minh rõ ràng.
- Với chính sách chỉ cho phép Google Workspace của tổ chức, backend phải kiểm tra claim `hd` đã xác minh trong ID token theo danh sách domain; không tin tham số `hd` do trình duyệt gửi.
- Không giới hạn đăng nhập Google nói chung theo domain trường trong V1; đây là lựa chọn mặc định cho ứng dụng mở cho cả creator và participant.
- Tài khoản trường hết hiệu lực có thể mất khả năng đăng nhập Google; cần phương thức khôi phục/liên kết khác nếu người dùng có dữ liệu hoặc tài sản trong hệ thống.
- Muốn xác nhận tư cách sinh viên thay vì chỉ email tổ chức, cần quy trình trường cấp assertion/IdP hoặc xác minh riêng; không suy diễn từ Gmail/Workspace.

## 4. Liên kết và gỡ liên kết

- Liên kết Google yêu cầu phiên Survey Flow đang xác thực và bước xác thực gần đây hoặc xác minh lại credential hiện có.
- Nếu Google identity đã gắn user khác, từ chối liên kết và yêu cầu quy trình recovery có kiểm soát; tuyệt đối không merge tự động.
- Không cho gỡ phương thức đăng nhập cuối cùng đang dùng; phải còn local credential hoặc identity khác đã xác minh.
- Mọi thao tác liên kết/gỡ liên kết cần audit actor, thời điểm và identity provider, không ghi token hay authorization code.

## 5. Phiên ứng dụng và an toàn

- Google chỉ xác thực danh tính; Google token không được dùng làm access token cho API Survey Flow.
- Sau callback thành công, backend phát access token và refresh token nội bộ qua cơ chế hiện tại; refresh token tiếp tục nằm trong HttpOnly cookie.
- Token Google, authorization code, client secret và refresh token không trả cho JavaScript, không lưu local/session storage, không ghi log.
- OAuth dùng Authorization Code flow với PKCE nếu client tham gia trực tiếp; state/nonce chống CSRF và replay. Ưu tiên backend làm OAuth client để tận dụng callback server-side hiện có.
- Callback URL phải là HTTPS ngoài môi trường local, khớp chính xác cấu hình Google OAuth client; CORS/cookie/SameSite và allowlist redirect phải được giới hạn.
- Frontend chỉ điều hướng về URL nội bộ allowlist sau đăng nhập; không chấp nhận URL redirect tùy ý.
