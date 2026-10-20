# 02 — Trạng thái giao diện

## Tải dữ liệu và thao tác

| Trạng thái                            | Hành vi                                                   |
| ------------------------------------- | --------------------------------------------------------- |
| Đang tải hồ sơ                        | Hiển thị skeleton                                         |
| Lỗi tải hồ sơ                         | Hiển thị lỗi và nút Thử lại                               |
| Hồ sơ có trường null                  | Ô tương ứng để trống; không bắt buộc bổ sung              |
| Không có avatar                       | Hiển thị ký tự đại diện                                   |
| Form chưa thay đổi                    | Nút lưu và hủy thông tin cá nhân bị disable               |
| Có thay đổi                           | Hiển thị thông báo chưa lưu, bật nút lưu                  |
| Đang lưu                              | Disable fieldset và nút tương ứng, hiển thị Đang lưu      |
| Lưu thành công                        | Toast thành công, reset trạng thái thay đổi theo response |
| Lưu thất bại                          | Lỗi trong form; dữ liệu đang nhập được giữ lại            |
| Đang tải danh mục sở thích            | Hiển thị trạng thái tải riêng                             |
| Lỗi danh mục sở thích                 | Hiển thị lỗi và nút thử lại riêng                         |
| Danh mục không có lựa chọn            | Hiển thị trạng thái rỗng                                  |
| Có sở thích ngừng hoạt động đang chọn | Hiển thị cảnh báo, disable lưu đến khi bỏ chọn            |

Lỗi sử dụng utility `getErrorMessage`; API lỗi không tự chuyển sang mock.

## Validation thông tin cá nhân

Tất cả trường đều tùy chọn. Chuỗi được trim trước khi gửi; chuỗi rỗng chuyển thành null.

| Trường       | Ràng buộc frontend                                        |
| ------------ | --------------------------------------------------------- |
| Tên hiển thị | Tối đa 100 ký tự                                          |
| Năm sinh     | Để trống hoặc 4 chữ số, từ 1900 đến năm hiện tại theo UTC |
| Giới tính    | Chưa cung cấp hoặc một giá trị enum được hỗ trợ           |
| Trường học   | Tối đa 255 ký tự                                          |
| Nghề nghiệp  | Tối đa 255 ký tự                                          |
| Giới thiệu   | Tối đa 2.000 ký tự                                        |

Lỗi validation hiển thị cạnh trường. Backend vẫn là nơi kiểm tra dữ liệu cuối cùng.

## Responsive và accessibility

- Desktop dùng AppShell với sidebar; form chia cột từ breakpoint `sm`.
- Mobile dùng điều hướng ngang và form một cột.
- Input có label; lỗi liên kết qua `aria-describedby` và `aria-invalid`.
- Các lựa chọn sở thích dùng checkbox có trạng thái chọn và focus rõ ràng.
- Loading, pending và disabled cần được kiểm tra bằng cả bàn phím và màn hình nhỏ khi chỉnh giao diện.

Giao diện hiện là demo chức năng; các thay đổi UI/UX tiếp theo cần cập nhật tài liệu khi làm thay đổi hành vi.
