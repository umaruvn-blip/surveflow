# SurveyFlow Frontend

Frontend SurveyFlow dựa trên React Router Framework mode, TypeScript, Tailwind CSS và shadcn/ui.

## Nền tảng

- React Router 7 với SSR
- TypeScript và Tailwind CSS 4
- shadcn/ui primitives
- TanStack Query cho server state
- Zustand cho auth/app state
- React Hook Form + Zod
- Axios client với credentials và bearer token

## Chạy local

```bash
npm install
cp .env.example .env
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173`, backend mặc định tại
`http://localhost:8080/api/v1`.

## Mock mode

Để chạy frontend mà không cần backend:

```env
VITE_ENABLE_MOCK=true
```

Tài khoản mock:

| Role  | Email                    | Password    |
| ----- | ------------------------ | ----------- |
| USER  | `user@surveyflow.local`  | `User@123`  |
| ADMIN | `admin@surveyflow.local` | `Admin@123` |

Đặt `VITE_ENABLE_MOCK=false` để quay lại API thật.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Cấu trúc liên quan auth

- `app/pages/LoginPage`: giao diện và form login.
- `app/apis/auth.api.ts`: lời gọi API auth.
- `app/hooks/queries/auth`: TanStack Query hooks.
- `app/stores/auth-store.ts`: access token và user state.
- `app/routes/guest-layout.tsx`: chặn user đã đăng nhập khỏi trang login.
- `app/routes/protected-layout.tsx`: bảo vệ các route yêu cầu đăng nhập.

Xem thêm [design system](docs/design-system.md).
# SurveyFlow-Frontend
