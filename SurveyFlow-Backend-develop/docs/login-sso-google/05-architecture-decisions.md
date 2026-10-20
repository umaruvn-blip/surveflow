# Google SSO — Architecture Decisions (V1)

## Đề xuất V1

| Quyết định | Đề xuất | Lý do |
|---|---|---|
| Protocol | OpenID Connect 1.0 trên OAuth 2.0 Authorization Code | Google cung cấp OIDC ID token cho đăng nhập; phân biệt authentication với quyền truy cập API Google |
| OAuth client | Backend Spring Security OAuth2 Login | Callback server-side khớp với backend hiện có đang phát app JWT và refresh cookie |
| Ứng dụng token | Tiếp tục access JWT + refresh HttpOnly cookie của Survey Flow | Giữ nguyên hợp đồng frontend hiện tại; không dùng Google token làm token nội bộ |
| Định danh | Bảng identity riêng, khóa unique `(issuer, subject)` | Cho phép một user có local credential và Google cùng lúc; tránh email làm khóa provider |
| Domain trường | Google login mở; domain trường chỉ là thuộc tính xác minh/eligibility nếu có nhu cầu | Không loại người dùng ngoài trường và không nhầm email suffix với SSO trường |
| Liên kết account | User đăng nhập trước bằng credential hiện có rồi link Google | Ngăn account takeover do email trùng và tránh merge tự động |
| Google scopes | `openid email profile` tối thiểu | Chỉ lấy định danh và thông tin hiển thị; không xin quyền Gmail/Drive |

## Mô hình dữ liệu gợi ý

Thay vì mở rộng `users.auth_provider` làm nguồn sự thật duy nhất, thêm `user_auth_identities`:

```text
user_auth_identities
- id
- user_id             FK users.id
- provider            GOOGLE (sau này có thể thêm provider khác)
- issuer              validated OIDC issuer
- subject             Google sub
- email_at_link       snapshot, không dùng làm khóa
- email_verified      boolean claim from Google at the time of login/link
- created_at
- updated_at

UNIQUE (provider, issuer, subject)
INDEX  (user_id, provider)
```

Giữ `users.email` là email liên hệ/đăng nhập canonical với unique constraint hiện tại. `auth_provider` và `provider_user_id` hiện hữu nên được deprecate hoặc migration sang identity table có kế hoạch; không để hai nguồn sự thật bất nhất. Tài khoản LOCAL tiếp tục dùng `password_hash`; việc thêm Google không nên khiến password hash rỗng có thể đi vào luồng password login.

Nếu sản phẩm thật sự cần xác minh domain trường, lưu riêng `institution_domain`, `verified_at`, `verification_method` (ví dụ `GOOGLE_HOSTED_DOMAIN`, `EMAIL_CHALLENGE`, `INSTITUTION_IDP`) thay vì gán `school` từ tên/email. Tránh coi dữ liệu domain là bằng chứng enrollment.

## Luồng kỹ thuật dự kiến

1. Thêm `spring-boot-starter-oauth2-client`, cấu hình Google client ID/secret qua biến môi trường và đăng ký callback URI theo môi trường.
2. Dùng Spring Security OAuth2 Login để quản lý redirect, callback, state và trao đổi code; custom success/failure handler gọi service nghiệp vụ.
3. Xác minh ID token theo thư viện OIDC/Spring, kiểm tra issuer/audience/expiry/nonce; khóa identity bằng issuer + `sub`.
4. Tạo user hoặc xử lý account-link-required trong transaction; cấp role/profile mặc định theo registration service đang dùng.
5. Gọi cùng service cấp token/refresh cookie như login local để tránh hai chính sách phiên.
6. Frontend thêm nút Google và xử lý callback redirect/status; không thêm Google SDK nếu backend callback được chọn.

## Lựa chọn chưa phù hợp làm mặc định

- **Frontend GIS ID token gửi backend**: có thể làm được nhưng làm frontend tham gia nhiều hơn vào bảo mật nonce/CSRF và luồng hiện có đã cần backend để phát refresh cookie. Chỉ cân nhắc nếu deployment buộc phải dùng popup/client-side.
- **Chỉ thêm `GOOGLE` vào `users.auth_provider`**: ít thay đổi schema nhưng ngăn user có nhiều phương thức đăng nhập và làm account linking khó an toàn.
- **Cho phép Workspace `hd` domain trường mới đăng nhập**: không phù hợp nếu nền tảng cần mở cho creator/participant bên ngoài. Có thể bổ sung chính sách theo tenant khi sản phẩm xác định rõ.
- **OIDC/SAML riêng cho từng trường**: đây mới là SSO do trường kiểm soát; chi phí onboarding, metadata, kiểm tra domain/tenant và vận hành cao hơn, nên là giai đoạn riêng.

## Quyết định sản phẩm đã chốt

1. Mọi người đều có thể đăng nhập bằng Google; email trường có thể được xác minh riêng trong giai đoạn sau.
2. Google login mới tự tạo account với role mặc định theo registration policy hiện tại.
3. V1 chưa lưu hay dùng trạng thái “email trường đã xác minh”.
4. V1 hỗ trợ liên kết Google từ account đã đăng nhập; không merge chỉ dựa trên email trùng.
5. Chưa yêu cầu Google Workspace domain hay cơ chế xác minh sinh viên.

## Tham chiếu

- Google khuyến nghị dùng `sub` làm khóa người dùng ổn định; email có thể thay đổi/không duy nhất. Claim `hd` mới là dấu hiệu hosted domain và phải kiểm tra từ token đã xác minh: [Google ID token claims](https://developers.google.com/identity/openid-connect/reference).
- OIDC Login của Spring Security hỗ trợ cấu hình ứng dụng làm OAuth2 client; ID token OIDC cung cấp xác minh identity: [Spring Security OAuth2 Login](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html).
