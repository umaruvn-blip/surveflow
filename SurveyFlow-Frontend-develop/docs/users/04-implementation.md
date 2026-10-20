# 04 — Cấu trúc triển khai và kiểm thử

## Phân chia trách nhiệm

```text
Route → Page/Form → Query hooks → API → Backend hoặc Mock
             ↓
        Schema / Types
```

| File                                               | Trách nhiệm                                    |
| -------------------------------------------------- | ---------------------------------------------- |
| `app/routes/profile.tsx`                           | Route mỏng và metadata trang                   |
| `app/pages/ProfilePage/ProfilePage.tsx`            | Giao diện, form thông tin và form sở thích     |
| `app/hooks/queries/profile/use-profile-queries.ts` | Query, mutation, cache và thông báo thành công |
| `app/apis/profile.api.ts`                          | Transport, lựa chọn mock và unwrap response    |
| `app/schemas/profile-schema.ts`                    | Validation và ánh xạ form/payload              |
| `app/types/profile.type.ts`                        | Domain và API types                            |
| `app/mocks/profile.mock.ts`                        | Dữ liệu demo và persistence theo tài khoản     |
| `app/constants/query-keys.ts`                      | Query keys tập trung                           |

Tái sử dụng AppShell, Metadata queries, HTTP client, Auth store, UI primitives và utility lỗi của dự án. Pages không gọi Axios trực tiếp; query hooks sở hữu cập nhật cache. Docs tổ chức theo feature, code giữ cấu trúc theo layer hiện có.

## Chạy demo

1. Đặt `VITE_ENABLE_MOCK=true` trong cấu hình local.
2. Chạy `npm run dev` và chọn tài khoản USER demo trên trang login.
3. Mở `/profile`, sửa thông tin và lưu.
4. Chọn sở thích và lưu riêng; reload để kiểm tra persistence.
5. Đổi tài khoản ADMIN để kiểm tra dữ liệu độc lập.

Để kiểm tra backend thật, đặt `VITE_ENABLE_MOCK=false`, cấu hình `VITE_API_BASE_URL` và khởi động lại frontend. Backend cần cho phép origin frontend qua CORS. Không dùng dữ liệu hoặc credential thật trong test tự động.

## Kiểm thử tự động

| Test                                                    | Phạm vi                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `app/schemas/profile-schema.test.ts`                    | Validation, null, đầy đủ sáu trường, loại email/avatar khỏi payload            |
| `app/apis/profile.api.test.ts`                          | GET/PUT đúng đường dẫn, unwrap và xóa toàn bộ sở thích                         |
| `app/hooks/queries/profile/use-profile-queries.test.ts` | Cập nhật cache đúng user, giữ trường khác khi sửa sở thích, invalidate surveys |
| `app/mocks/profile.mock.test.ts`                        | Tách USER/ADMIN, giữ dữ liệu giữa thao tác, ID không hợp lệ và reload          |

Quality gates theo AGENTS.md: `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.

## Checklist kiểm tra thủ công

- Desktop và mobile: không tràn ngang, mọi trường và nút lưu truy cập được.
- Sửa rồi hủy; xóa trường rồi lưu; nhập năm không hợp lệ.
- Lưu thành công, lỗi mạng, thử lại và giữ dữ liệu đang nhập.
- Lưu sở thích khi thông tin cá nhân đang có bản nháp.
- Bỏ toàn bộ sở thích; xử lý sở thích ngừng hoạt động.
- Reload và chuyển tài khoản; kiểm tra dữ liệu không lẫn nhau.
- Điều hướng bằng bàn phím, label, focus và thông báo lỗi.
- Kiểm tra cả mock và API thật khi thay đổi tích hợp.

Checklist là hướng dẫn kiểm thử, không phải tuyên bố mọi trường hợp đã được chạy trong mỗi lần cập nhật docs.
