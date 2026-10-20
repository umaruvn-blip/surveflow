# 03 — Tích hợp API và cache

## API sử dụng

Base URL lấy từ `VITE_API_BASE_URL`, ví dụ `http://localhost:8080/api/v1`. Bảng dưới ghi đường dẫn tương đối với base URL.

| API                       | Mục đích                                  |
| ------------------------- | ----------------------------------------- |
| GET `/users/me/profile`   | Tải hồ sơ và sở thích hiện tại            |
| PUT `/users/me/profile`   | Thay thế sáu trường thông tin cá nhân     |
| PUT `/users/me/interests` | Thay thế toàn bộ sở thích                 |
| GET `/interests`          | Tải danh mục sở thích qua module Metadata |

Transport dùng Axios client chung để xử lý access token, refresh và lỗi xác thực. `profileApi` unwrap envelope `ApiResponse<T>`. Xem [contract backend](../../../survey_flow-backend/docs/users/04-api-contract.md) cho cấu trúc response và lỗi đầy đủ.

## Ánh xạ form sang payload

Form dùng string để biểu diễn ô trống và năm sinh đang nhập. `profileFormValues` ánh xạ dữ liệu API sang form; `profileUpdatePayload` validate và tạo request đầy đủ:

```json
{
  "displayName": "An",
  "birthYear": 2002,
  "gender": "MALE",
  "school": null,
  "occupation": "Sinh viên",
  "bio": null
}
```

Luôn gửi đủ sáu trường. Không gửi `email`, `avatarUrl`, `userId` hay `interests` trong request này. Giá trị giới tính là `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY` hoặc null; backend nhận enum trực tiếp.

Payload sở thích là `{ "interestIds": [1, 2] }`, hoặc `{ "interestIds": [] }` để xóa tất cả.

## Query và mutation

| Thành phần                    | Cache/hành vi                                                  |
| ----------------------------- | -------------------------------------------------------------- |
| `useProfileQuery`             | Key `['users', userId, 'profile']`; chỉ bật khi có user ID     |
| `useInterestsQuery`           | Key `['metadata', 'interests']`; danh mục dùng chung           |
| `useUpdateProfileMutation`    | Ghi response hồ sơ vào cache của user hiện tại                 |
| `useReplaceInterestsMutation` | Thay riêng interests, giữ các trường hồ sơ còn lại trong cache |
| Cả hai mutation thành công    | Invalidate `['surveys', 'exchange']` và toast thành công       |

Hồ sơ server được quản lý bởi TanStack Query, không sao chép vào Zustand. Auth store cung cấp danh tính đăng nhập. Form giữ bản nháp riêng bằng React Hook Form. Hiện không dùng optimistic update; cache chỉ đổi khi API thành công.

## Mock mode

- `VITE_ENABLE_MOCK=true`: API boundary chuyển sang `mockProfileApi`.
- `VITE_ENABLE_MOCK=false`: gọi backend thật; không fallback khi backend lỗi.
- Mock lưu hồ sơ riêng theo user ID trong bộ nhớ và sessionStorage, key `surveyflow-demo-profile-${id}`.
- Reload cùng phiên vẫn giữ dữ liệu demo; USER và ADMIN có dữ liệu riêng.
- Mock cập nhật hồ sơ giữ avatar và sở thích; cập nhật sở thích giữ thông tin cá nhân.
- Liên kết Google chỉ hiển thị trong chế độ API thật.
