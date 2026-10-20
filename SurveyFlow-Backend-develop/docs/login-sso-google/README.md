# Google SSO — kiến trúc V1

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | V1 |
| Domain | Authentication / Identity |
| Trạng thái | Phạm vi đã chốt; tích hợp đang được triển khai |

## Mục tiêu và phạm vi

Cho phép người dùng đăng nhập Survey Flow bằng Google, trong khi tiếp tục hỗ trợ tài khoản email/mật khẩu. Sinh viên có thể dùng email trường nếu địa chỉ đó được Google xác thực; người dùng khác vẫn có thể dùng Google cá nhân.

Tài liệu mô tả luồng đăng nhập, ranh giới trách nhiệm frontend/backend, mô hình liên kết danh tính và cách phân biệt email trường với SSO do trường quản lý. Không bao gồm đăng nhập bằng Google Workspace API, truy cập Gmail/Drive, hoặc cấu hình IdP riêng cho từng trường.

V1 cho phép mọi người dùng Google Sign-In. Google account mới tự tạo user với role `USER`, theo registration policy hiện hành. Liên kết Google khả dụng cho user đã đăng nhập. Xác minh email trường và giới hạn Workspace chưa thuộc phạm vi hiện tại.

## Danh sách tài liệu

1. [Business Rules](./01-business-rules.md): danh tính, tạo tài khoản, liên kết, email trường và nguyên tắc bảo mật.
2. [State Transitions](./02-state-transitions.md): vòng đời phiên và liên kết identity.
3. [Business Flows](./03-business-flows.md): đăng nhập mới, đăng nhập lại, liên kết và lỗi.
4. [API Contract](./04-api-contract.md): endpoint và callback hiện được tích hợp.
5. [Architecture Decisions](./05-architecture-decisions.md): lựa chọn công nghệ, phương án và các câu hỏi cần chốt.

## Bối cảnh hiện tại

Backend là Spring Boot/Spring Security, tự phát hành access JWT và refresh token sau đăng nhập; frontend React Router SSR gọi API backend. Bảng `users` giữ `auth_provider` cũ cho tương thích; `user_auth_identities` lưu các phương thức đăng nhập liên kết bằng provider, issuer và subject.

## Thuật ngữ

- **Google Sign-In**: đăng nhập một lần từ tài khoản Google qua OpenID Connect.
- **Google Workspace**: tài khoản do một tổ chức quản lý; claim `hd` của ID token cho biết hosted domain.
- **SSO trường**: xác thực do trường kiểm soát, thường qua OIDC hoặc SAML. Dùng email trường với Google Sign-In không tự động đồng nghĩa trường là IdP.
- **Identity**: định danh bên ngoài gắn với user Survey Flow, khóa Google là cặp issuer và `sub`.

## Tài liệu tham khảo

- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
- [Google ID token claims](https://developers.google.com/identity/openid-connect/reference)
- [Spring Security OAuth2 Login](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html)

## Cấu hình triển khai

- Tạo Google OAuth client loại Web application.
- Đăng ký callback URI backend `/login/oauth2/code/google` ở mỗi môi trường.
- Đặt `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` và `GOOGLE_FRONTEND_CALLBACK_URL` trong môi trường chạy backend; không commit giá trị thật.
- Frontend và backend cần cấu hình CORS credentials. Cookie session phục vụ OAuth chỉ tồn tại trong redirect/callback; app API tiếp tục dùng JWT và refresh cookie.
