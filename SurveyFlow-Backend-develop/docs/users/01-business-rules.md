# Users V1 — Business Rules

## 1. Quyền sở hữu và xác thực

- Cả ba API yêu cầu access token Survey Flow hợp lệ.
- User ID được lấy từ principal của access token, không nhận user ID trong path hoặc request body.
- Chỉ chủ tài khoản được xem và cập nhật hồ sơ, sở thích của chính mình.
- Các API này không thay đổi `email`, `status`, `role`, password hoặc identity đăng nhập.

## 2. Hồ sơ

- Mỗi user có tối đa một `UserProfile`.
- Các trường có thể sửa: `displayName`, `birthYear`, `gender`, `school`, `occupation`, `bio`.
- Mọi trường hồ sơ đều tùy chọn. Nếu user chưa có dòng `UserProfile`, thao tác đọc trả các trường hồ sơ là `null`; thao tác cập nhật tạo dòng hồ sơ trong cùng transaction.
- Client gửi đầy đủ sáu trường có thể sửa khi lưu hồ sơ. Backend cập nhật toàn bộ theo request: gửi giá trị cũ để giữ nguyên, giá trị mới để thay đổi, `null` để xóa. Trường không gửi cũng được nhận là `null` và bị xóa. `gender` nhận `null` hoặc một giá trị thuộc `UserGender`.
- Các trường văn bản `displayName`, `school`, `occupation`, `bio` được bỏ khoảng trắng ở hai đầu trước khi kiểm tra và lưu. Chuỗi rỗng sau khi chuẩn hóa được hiểu là xóa giá trị.
- `avatarUrl` chỉ được trả trong response để hiển thị ảnh hiện có. `PUT /profile` không nhận trường này; cập nhật avatar sẽ là chức năng riêng sau V1.
- `birthYear` phải nằm trong khoảng từ `1900` đến năm hiện tại theo UTC. Không dùng năm sinh để suy ra hoặc lưu tuổi cố định.
- Field ngoài DTO không được cập nhật. Body `{}` được hiểu là đặt toàn bộ sáu trường có thể sửa thành `null`; client cần gửi đầy đủ dữ liệu form.

## 3. Sở thích

- `PUT /users/me/interests` thay thế toàn bộ tập sở thích của user bằng `interestIds` trong request. `[]` có nghĩa bỏ chọn tất cả.
- `interestIds` bắt buộc, không chứa `null`, ID không dương hoặc ID trùng nhau.
- Mọi ID phải tham chiếu một `Interest` đang hoạt động tại thời điểm cập nhật. Nếu bất kỳ ID nào không hợp lệ, toàn bộ request thất bại và tập sở thích cũ được giữ nguyên.
- Không tạo `Interest` mới từ API này. Danh mục sở thích do hệ thống quản lý.
- Gửi lại cùng một tập ID cho kết quả giống nhau, không tạo quan hệ trùng. Thứ tự ID trong request không mang ý nghĩa nghiệp vụ; response sắp xếp theo ID tăng dần để ổn định.
- Sở thích đã chọn nhưng về sau bị vô hiệu hóa vẫn xuất hiện khi đọc hồ sơ để user thấy lựa chọn đang lưu; request `PUT` tiếp theo chỉ được giữ lại các mục còn hoạt động.

## 4. Tính nhất quán

- Cập nhật hồ sơ và thay thế sở thích là hai thao tác độc lập; mỗi request được xử lý trong một transaction.
- Thay đổi hồ sơ hoặc sở thích có hiệu lực với các lần khám phá, kiểm tra điều kiện và gợi ý khảo sát tiếp theo. Participation đã tạo và các dữ liệu snapshot của nó không bị viết lại.
- Response chỉ chứa các trường công khai theo API contract; không trả JPA entity hoặc dữ liệu nội bộ như password hash và auth identity.
