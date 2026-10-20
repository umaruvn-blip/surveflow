# SurveyFlow UI foundation

## Tinh thần chủ đạo

- Sáng, thân thiện, phù hợp sản phẩm giáo dục và nghiên cứu.
- Blue thể hiện công nghệ và độ tin cậy; green thể hiện cộng đồng, tiến trình và phần thưởng.
- Nền trắng dùng radial gradient nhẹ để tạo chiều sâu.
- Card bo tròn 20–28px, border mint nhạt và shadow xanh mềm.
- Heading đậm, tracking âm nhẹ; body dùng xanh xám thay vì đen thuần.

## Design tokens

| Vai trò     | Giá trị   | Gợi ý sử dụng                   |
| ----------- | --------- | ------------------------------- |
| Primary     | `#075FE8` | CTA, link, trạng thái focus     |
| Secondary   | `#17A83A` | Success, community, progress    |
| Cyan bridge | `#008DD8` | Điểm giữa gradient thương hiệu  |
| Foreground  | `#071D2F` | Heading và nội dung quan trọng  |
| Muted text  | `#587080` | Mô tả, metadata                 |
| Soft border | `#CDEEE2` | Border card/input               |
| Background  | `#F8FCFF` | Nền ứng dụng                    |
| Destructive | `#D92D45` | Lỗi form và hành động nguy hiểm |

Gradient chính: `linear-gradient(135deg, #0B59D6 0%, #008DD8 46%, #20C756 100%)`.

## Component rules

- Ưu tiên primitive trong `app/components/ui` và component dùng chung theo folder/barrel pattern.
- CTA chính dùng gradient; mỗi khu vực chỉ nên có một CTA gradient nổi bật.
- Focus ring dùng primary với opacity thấp và luôn hỗ trợ bàn phím.
- Icon dùng Lucide để giữ stroke đồng nhất.
- Auth desktop là split layout; mobile chỉ giữ brand và form card tối đa `480px`.

## Auth flow

- `auth.api.ts`: chỉ gọi HTTP và unwrap backend envelope.
- `use-login-mutation.ts`: quản lý mutation, cập nhật Zustand và React Query cache.
- `auth-store.ts`: nguồn dữ liệu phiên đăng nhập phía client.
- Refresh token do Spring Boot quản lý bằng HttpOnly cookie.
