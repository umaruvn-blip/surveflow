import { z } from 'zod'

/* Loại trường ngoài DTO, tránh lưu mật khẩu hoặc refresh token vào store. */
export const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: z.object({
    id: z.number().int().positive(),
    email: z.string().email(),
    status: z.string(),
    roles: z.array(z.string()),
    fullName: z.string().optional()
  })
})
