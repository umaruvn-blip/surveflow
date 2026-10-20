# Users Documentation

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | V1 |
| Domain | Users / Profile & Interests |
| Trạng thái | Đã triển khai |

## Mục tiêu và phạm vi

Bộ tài liệu này định nghĩa ba API cho người dùng đã đăng nhập: xem hồ sơ, lưu toàn bộ thông tin hồ sơ có thể sửa và thay thế danh sách sở thích. Dữ liệu hồ sơ được dùng khi khám phá, tham gia và gợi ý khảo sát.

Ngoài phạm vi V1: đổi email, mật khẩu, trạng thái tài khoản, role, liên kết phương thức đăng nhập, cập nhật ảnh đại diện và quản trị danh mục sở thích. `avatarUrl` hiện chỉ được đọc để hiển thị ảnh đã có; chức năng cập nhật avatar sẽ có luồng riêng ở phiên bản sau.

## Actor

- **User**: chủ tài khoản đang đăng nhập, tự xem và chỉnh sửa dữ liệu của mình.
- **System**: xác thực access token, kiểm tra dữ liệu, lưu thay đổi và dùng hồ sơ cho các nghiệp vụ khảo sát.

## Danh sách tài liệu

1. [Business Rules](./01-business-rules.md): quyền sở hữu, quy tắc hồ sơ và sở thích.
2. [State Transitions](./02-state-transitions.md): các trạng thái dữ liệu trước và sau thao tác.
3. [Business Flows](./03-business-flows.md): luồng đọc, cập nhật hồ sơ và thay thế sở thích.
4. [API Contract](./04-api-contract.md): endpoint, payload, validation, response và lỗi.

## Domain model liên quan

- `User`: định danh tài khoản, email và trạng thái.
- `UserProfile`: thông tin cá nhân tùy chọn, quan hệ một-một với `User`.
- `Interest`: danh mục sở thích; chỉ mục đang hoạt động được chọn mới.
- `UserInterest`: quan hệ giữa user và interest, khóa chính `(user_id, interest_id)`.

Các bảng trên đã có trong schema. Bộ API này không yêu cầu thay đổi schema theo đặc tả hiện tại.
