# Google SSO — State Transitions (V1)

## Google identity

```mermaid
stateDiagram-v2
    [*] --> Unlinked
    Unlinked --> Linked: OIDC callback hợp lệ / liên kết trong phiên đã xác thực
    Linked --> Unlinked: gỡ liên kết hợp lệ và còn phương thức đăng nhập khác
    Linked --> Linked: đăng nhập lại bằng cùng issuer + sub
    Unlinked --> Unlinked: hủy, lỗi xác thực, trùng email hoặc identity conflict
```

| Trạng thái | Ý nghĩa |
|---|---|
| `Unlinked` | Chưa có identity Google gắn với user Survey Flow |
| `Linked` | Identity Google đã gắn với một user duy nhất |

## Phiên đăng nhập

```mermaid
stateDiagram-v2
    [*] --> Started: người dùng chọn Tiếp tục với Google
    Started --> CallbackPending: Google trả authorization code
    Started --> Cancelled: người dùng hủy / state hết hạn
    CallbackPending --> Authenticated: token và claims hợp lệ, user active
    CallbackPending --> Rejected: identity conflict / user bị khóa / callback lỗi
    Authenticated --> AppSession: phát token Survey Flow và cookie refresh
    Rejected --> [*]
    Cancelled --> [*]
    AppSession --> [*]: logout / refresh session hết hạn
```

`Authenticated` ở đây là kết quả xác minh provider; chỉ `AppSession` được dùng để gọi API nghiệp vụ.
