# Users V1 — Business Flows

## 1. Xem hồ sơ

1. Client gửi `GET /api/v1/users/me/profile` với access token.
2. Backend lấy user ID từ principal, đọc `User`, `UserProfile` và các `UserInterest` liên quan.
3. Backend trả thông tin tài khoản, các trường hồ sơ và danh sách sở thích theo API contract. Nếu chưa có `UserProfile`, các trường hồ sơ là `null`.

## 2. Cập nhật hồ sơ

1. Client gửi `PUT /api/v1/users/me/profile` gồm đầy đủ sáu trường hồ sơ có thể sửa.
2. Backend ánh xạ JSON vào DTO record, kiểm tra các annotation validation và chuẩn hóa chuỗi.
3. Backend nạp user và hồ sơ theo principal; tạo hồ sơ nếu chưa có.
4. Trong một transaction, backend cập nhật toàn bộ sáu trường từ DTO. Giá trị `null` hoặc trường vắng mặt xóa giá trị tương ứng.
5. Backend trả hồ sơ sau cập nhật theo cùng dạng với `GET`.

Để giữ nguyên một trường, client gửi lại giá trị hiện tại của trường đó. Không dùng payload chỉ gồm các trường thay đổi.

## 3. Thay thế sở thích

```mermaid
sequenceDiagram
    actor U as User
    participant C as Client
    participant API as Users API
    participant DB as Database

    U->>C: Chọn danh sách sở thích
    C->>API: PUT /api/v1/users/me/interests
    API->>API: Lấy user ID từ access token
    API->>DB: Kiểm tra toàn bộ interestIds tồn tại và active
    alt Danh sách hợp lệ
        API->>DB: Thay thế UserInterest trong transaction
        API-->>C: 200 + tập sở thích mới
    else Có ID không hợp lệ
        API-->>C: 400; giữ nguyên tập cũ
    end
```

Client gửi danh sách đầy đủ sau mỗi lần chỉnh sửa, không chỉ các ID mới thêm. Gửi `[]` để bỏ chọn toàn bộ. Gửi lại cùng danh sách không tạo thêm quan hệ.

## 4. Sử dụng ở module Survey

Các request khám phá, kiểm tra điều kiện tham gia và gợi ý khảo sát chạy sau khi cập nhật có thể đọc hồ sơ, sở thích mới. Việc sửa hồ sơ không sửa participation đã tồn tại hoặc thay đổi dữ liệu đã chụp tại thời điểm tạo participation.
