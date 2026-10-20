# Payment Demo — Cấu hình staging và kiểm thử

## Thử nhanh ở dev

Backend chạy với profile `dev` mặc định đã đăng ký API demo. Dùng database dev riêng, đăng nhập bằng tài khoản dev. Frontend `npm run dev` tự nạp `.env.development` để bật giao diện demo; trong `.env`, đặt `VITE_ENABLE_MOCK=false` và `VITE_API_BASE_URL=http://localhost:8080/api/v1`. Mở `/credits` để chạy cùng kịch bản bên dưới. Nếu chỉ bật frontend mock local, giao dịch được giữ trong bộ nhớ trình duyệt và không đi qua backend dev.

## Chuẩn bị môi trường

1. Dùng PostgreSQL **riêng cho staging**. Flyway tự chạy các migration hiện có; V8 thêm liên kết payment–ledger và ví rỗng cho user cũ, V9 mở rộng độ chính xác của `payments.amount`.
2. Chạy backend với `SPRING_PROFILES_ACTIVE=staging`. Cấp ít nhất `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` qua biến môi trường của nền tảng deploy. Cấp `FRONTEND_BASE_URL` trỏ tới frontend staging để CORS hoạt động, cùng JWT secrets riêng của staging.
3. `application-staging.yml` là cấu hình profile trong Git. Cấp biến môi trường staging bằng runner/Compose/CI hoặc file `.env.staging` riêng không commit. Spring Boot không tự nạp `.env.staging`; công cụ chạy phải nạp nó trước khi khởi động. `.env.example` chung hiện chứa ví dụ dev.
4. Build frontend với `.env.staging` của frontend và `npm run build -- --mode staging`; `VITE_ENABLE_MOCK=false`, `VITE_ENABLE_PAYMENT_DEMO=true`, API URL trỏ đến backend staging.

`application.yml` hiện import tùy chọn `.dev.env` từ thư mục chạy cho mọi profile. Khi chạy staging trong một checkout dùng cho dev, bảo đảm **không có `.dev.env` ở thư mục chạy** hoặc cấp đầy đủ biến staging ở mức môi trường để không lấy nhầm giá trị dev. Ưu tiên một thư mục triển khai staging sạch, tách khỏi checkout dev.

## Kịch bản cho thành viên nhóm

Không cần Postman hay thẻ ngân hàng:

1. Đăng nhập vào frontend staging và mở `/credits`.
2. Nhập `11` Credits. Trang phải ước tính `1.100 VNĐ`; nút tạo đơn hoạt động. Nhập dưới `10` hoặc số không nguyên thì không thể tiếp tục.
3. Tạo đơn, kiểm tra trang `/payments/demo/{paymentId}` hiển thị `11 Credits`, `1.100 VNĐ` và `PENDING`.
4. Chọn **Giả lập thành công**. Trạng thái thành `SUCCESS`; về ví, số dư tăng 11 và lịch sử có một dòng `+11` loại nạp Credits.
5. Tạo đơn mới, thử **Giả lập thất bại**; tạo thêm đơn mới, thử **Hủy thanh toán**. Hai đơn này không làm tăng ví và không sinh ledger entry.

Backend staging lưu đơn và ví trong PostgreSQL, nên có thể mở lại trang checkout để xem kết quả. Frontend mock local (`VITE_ENABLE_MOCK=true`) chỉ giữ đơn trong bộ nhớ của module; reload trang có thể mất đơn mock. Dùng backend staging để nhóm kiểm thử kết quả có lưu trữ.

## Kiểm tra API và tính lặp

Với access token của tài khoản staging, có thể gọi lại `POST /api/v1/payments/{id}/demo-result` cùng `outcome` để xác nhận số dư không tăng thêm. Gọi kết quả khác sau khi đơn kết thúc phải trả `409`. Dùng tài khoản khác truy cập ID đó phải trả `404`.

Test tự động liên quan: `./mvnw -Dtest=DemoCreditTopupServiceIntegrationTest test`. Test bật `staging,test` để có service demo nhưng dùng H2; đó không phải môi trường staging triển khai cho người dùng.
