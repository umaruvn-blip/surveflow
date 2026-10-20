import { z } from 'zod'

/* Kiểm tra cấu hình ngay khi khởi động; API lỗi không tự chuyển sang mock. */
const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .url('VITE_API_BASE_URL must be a valid URL, for example: http://localhost:8080/api/'),
  VITE_ENABLE_MOCK: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  VITE_ENABLE_PAYMENT_DEMO: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true')
})

export const env = envSchema.parse(import.meta.env)
