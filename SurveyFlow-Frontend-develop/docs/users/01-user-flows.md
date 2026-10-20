# 01 — Luồng người dùng

## Mở hồ sơ

1. Người dùng đăng nhập và mở `/profile`.
2. Route guard kiểm tra phiên đăng nhập; nếu chưa đăng nhập, chuyển đến login và giữ `redirectTo`.
3. Trang tải hồ sơ hiện tại, hiển thị tên, email, avatar và hai phần chỉnh sửa độc lập.
4. Danh mục sở thích được tải riêng qua Metadata.

Việc khôi phục phiên khi reload do Auth session provider xử lý trước khi trang được hiển thị.

## Sửa thông tin cá nhân

1. Form điền dữ liệu hiện có; giá trị null hiển thị thành ô trống.
2. Người dùng sửa tên hiển thị, năm sinh, giới tính, trường học, nghề nghiệp hoặc giới thiệu.
3. **Lưu thay đổi** chỉ bật khi form có thay đổi và không đang lưu.
4. Form validate, chuẩn hóa rồi gửi đủ sáu trường bằng PUT.
5. Thành công: cập nhật cache, reset form theo response và thông báo đã lưu.
6. Thất bại: hiển thị lỗi và giữ nội dung đang nhập để sửa hoặc gửi lại.

**Hủy thay đổi** đưa form về hồ sơ hiện có trong cache và xóa lỗi mutation. Xóa nội dung một ô rồi lưu sẽ gửi null để xóa giá trị đó ở backend.

## Sửa sở thích

1. Người dùng chọn hoặc bỏ chọn nhiều chủ đề.
2. **Lưu sở thích** gửi toàn bộ danh sách ID đang chọn. Danh sách rỗng xóa tất cả sở thích.
3. Thành công: thay sở thích trong cache, reset trạng thái thay đổi và thông báo đã lưu.
4. Thất bại: giữ lựa chọn hiện tại và hiển thị lỗi.

Sở thích đã chọn nhưng không còn trong danh mục vẫn được hiển thị từ hồ sơ. Nếu đã ngừng hoạt động, người dùng cần bỏ chọn trước khi lưu; sau khi bỏ chọn không thể chọn lại.

Hai form lưu độc lập. Lưu sở thích không reset các thông tin cá nhân đang sửa. Phần sở thích hiện chưa có nút hủy riêng.

## Rời trang và đăng nhập Google

Thay đổi chưa lưu có thể mất khi rời trang hoặc reload; hiện chưa có hộp thoại xác nhận rời trang.

Tài khoản Google sử dụng cùng trang và API hồ sơ. Backend tạo hồ sơ khi tạo tài khoản Google mới, có thể lấy tên và ảnh từ Google. Các lần đăng nhập sau sử dụng hồ sơ hiện có. Liên kết Google thuộc luồng Auth và không thay thế dữ liệu hồ sơ.
