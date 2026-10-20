# Users V1 — State Transitions

Hồ sơ và sở thích không có enum trạng thái vòng đời. Sơ đồ dưới đây mô tả trạng thái dữ liệu sau các thao tác API.

## Hồ sơ

```mermaid
stateDiagram-v2
    [*] --> ChuaCoHoSo: tài khoản chưa có dòng UserProfile
    ChuaCoHoSo --> ChuaCoHoSo: GET /profile
    ChuaCoHoSo --> DaCoHoSo: PUT /profile hợp lệ
    DaCoHoSo --> DaCoHoSo: GET /profile hoặc PUT /profile hợp lệ
    ChuaCoHoSo --> ChuaCoHoSo: PUT không hợp lệ
    DaCoHoSo --> DaCoHoSo: PUT không hợp lệ
```

| Trạng thái | Ý nghĩa |
|---|---|
| `ChuaCoHoSo` | User tồn tại; các trường hồ sơ được trả là `null`. |
| `DaCoHoSo` | Có một dòng `UserProfile`; các trường riêng lẻ vẫn có thể là `null`. |

`PUT` không xóa dòng `UserProfile`; giá trị `null` hoặc trường không gửi xóa giá trị tương ứng. Client gửi đầy đủ sáu trường có thể sửa khi lưu.

## Sở thích

```mermaid
stateDiagram-v2
    [*] --> TapHienTai
    TapHienTai --> TapMoi: PUT hợp lệ / thay thế toàn bộ tập
    TapHienTai --> TapHienTai: PUT cùng tập hoặc request không hợp lệ
    TapMoi --> TapHienTai: lần cập nhật tiếp theo
```

`TapHienTai` và `TapMoi` có thể là tập rỗng. Request không hợp lệ không được xóa một phần tập cũ. Interest bị vô hiệu hóa không tự động xóa khỏi tập đã lưu; nó chỉ không còn hợp lệ cho lần chọn tiếp theo.
