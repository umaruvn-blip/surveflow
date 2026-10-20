# Cấu hình dev, staging và mock

Ba biến frontend được kiểm tra trong `app/config/env.ts` và có trong `.env.example`:

| Biến                       | Ý nghĩa                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | Base URL của backend, gồm `/api/v1`.                                                    |
| `VITE_ENABLE_MOCK`         | `true` dùng mock trong bộ nhớ frontend; `false` gọi backend.                            |
| `VITE_ENABLE_PAYMENT_DEMO` | `true` bật giao diện demo; mock cũng bật giao diện này để có thể thử không cần backend. |

## Chạy với backend dev

`.env.development` đã có đủ ba biến: API local `http://localhost:8080/api/v1`, mock `false`, demo `true`. Chạy backend với profile `dev` và database dev, sau đó ở frontend:

```bash
npm install
npm run dev
```

`npm run dev` dùng Vite mode `development`, nên tự đọc `.env.development`. Không cần sao chép `.env.example` để chạy luồng này. Mở `http://localhost:5173`, đăng nhập tài khoản dev rồi vào `/credits`.

## Chạy với backend staging

`.env.staging` có `VITE_ENABLE_MOCK=false` và `VITE_ENABLE_PAYMENT_DEMO=true`. Thay `VITE_API_BASE_URL` mẫu bằng URL backend staging của nhóm trước khi chạy. Backend cần profile `staging`, database staging và tài khoản thử nghiệm tương ứng.

```bash
npm run dev -- --mode staging
```

Lệnh trên chạy frontend local nhưng dùng cấu hình staging. Backend staging phải cho phép origin local qua CORS. Để tạo bản frontend triển khai cho nhóm:

```bash
npm run build -- --mode staging
```

File `.env.staging` được chia sẻ trong Git, nên chỉ đặt cấu hình frontend công khai ở đây; không đưa secret vào biến `VITE_*`.

## Mock local và production

Đổi `VITE_ENABLE_MOCK=true` trong `.env.development` rồi chạy lại dev server để thử frontend khi chưa có backend. API payment và ví cùng dùng mock, nhưng dữ liệu chỉ tồn tại trong bộ nhớ module: tải lại trang có thể mất đơn và reset ví. Mock phù hợp để xem UI, không dùng để xác nhận dữ liệu lưu bền hoặc tính lặp của backend.

Ở production, đặt `VITE_ENABLE_MOCK=false`, `VITE_ENABLE_PAYMENT_DEMO=false` khi build. Backend profile `prod` không có endpoint `demo-result`. `.env.example` là file tham khảo, không tự được Vite chọn làm mode. Các biến `VITE_*` được gắn vào bản frontend lúc build; thay biến trên server sau khi build không thay đổi giao diện đã phát hành.
