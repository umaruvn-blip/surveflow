# Kiểm thử Payment Demo cho nhóm

## Chuẩn bị

Người kiểm thử dùng frontend staging đã build với mode `staging`, backend staging và một tài khoản thử nghiệm được cấp sẵn. Không cần Postman, thẻ ngân hàng hoặc chuyển tiền thật. Người phụ trách triển khai cần xác nhận `.env.staging` trỏ đúng API staging, backend bật profile `staging` và CORS cho phép origin frontend.

Ghi lại số dư ví **trước** khi thử để đối chiếu. Mỗi kết quả cần một đơn mới vì một đơn chỉ có thể kết thúc một lần.

## Kịch bản chính

| Bước | Thao tác                                                 | Kết quả mong đợi                                                                                    |
| ---- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1    | Đăng nhập, mở `/credits`, nhập `11`.                     | Form hiển thị `1.100 VNĐ` tham khảo; nút tiếp tục hoạt động.                                        |
| 2    | Bấm **Tiếp tục giả lập thanh toán**.                     | Chuyển tới `/payments/demo/{id}`; checkout hiển thị `11 Credits`, `1.100 VNĐ`, trạng thái đang chờ. |
| 3    | Bấm **Giả lập thành công** rồi về ví.                    | Đơn thành `SUCCESS`; số dư tăng đúng **11**, lịch sử có một dòng `+11`.                             |
| 4    | Tạo đơn mới với `11` Credits, chọn **Giả lập thất bại**. | Đơn thành `FAILED`; số dư không tăng và không có dòng nạp Credits mới.                              |
| 5    | Tạo thêm đơn mới, chọn **Hủy thanh toán**.               | Đơn thành `CANCELLED`; số dư không tăng và không có dòng nạp Credits mới.                           |

Mở lại URL của đơn thành công trên staging phải thấy trạng thái đã lưu và không còn nút chọn kết quả. Chạy thêm một lượt với `10` Credits để kiểm tra giá tối thiểu `1.000 VNĐ`; nhập `9` hoặc `10,5` Credits phải khiến nút tiếp tục bị khóa.

## Kiểm tra lỗi và giao diện

- Mở `/payments/demo/abc`: trang báo mã đơn không hợp lệ.
- Mở ID không tồn tại hoặc đơn của tài khoản khác: trang báo lỗi tải đơn; không hiển thị hành động thanh toán.
- Khi tạo đơn hoặc gửi kết quả đang xử lý: nút liên quan bị khóa, tránh bấm lặp.
- Kiểm tra các bước trên ở màn hình điện thoại và desktop, gồm thông báo lỗi, trạng thái chờ và liên kết quay về ví.

Nếu cần xác nhận gọi lặp cùng kết quả không cộng ví hai lần, dùng [kịch bản API backend](../../../../survey_flow-backend/docs/payment/demo/04-staging-runbook.md); giao diện ẩn nút kết quả sau khi đơn kết thúc nên không có thao tác lặp trực tiếp.

## Khi kết quả không đúng

| Hiện tượng                                           | Kiểm tra                                                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Không thấy form nạp                                  | Bản frontend đã build với `VITE_ENABLE_PAYMENT_DEMO=true` chưa; có đang mở đúng frontend dev/staging không. |
| Có form nhưng tạo hoặc tải đơn lỗi                   | `VITE_ENABLE_MOCK=false`, API URL đúng, backend bật profile `dev`/`staging`, phiên đăng nhập hợp lệ.        |
| Lỗi CORS khi chạy frontend local với backend staging | Backend staging có cho phép origin `http://localhost:5173` không.                                           |
| Đơn hoặc ví mất sau khi reload                       | Có thể frontend đang bật `VITE_ENABLE_MOCK=true`; dùng API staging để kiểm thử lưu bền.                     |
| Thành công nhưng ví chưa cập nhật                    | Mở lại `/credits` và kiểm tra request ví/lịch sử; báo ID đơn cùng số dư trước/sau cho nhóm dev.             |

Kiểm tra tự động khi thay đổi frontend: `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
