import { z } from 'zod'

import type { ProfileUpdateRequest, UserProfile } from '@/types/profile.type'

export const profileFormSchema = z.object({
  displayName: z.string().trim().max(100, 'Tên hiển thị tối đa 100 ký tự.'),
  birthYear: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        (/^\d{4}$/.test(value) &&
          Number(value) >= 1900 &&
          Number(value) <= new Date().getUTCFullYear()),
      'Nhập năm sinh từ 1900 đến năm hiện tại.'
    ),
  gender: z.enum(['', 'MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  school: z.string().trim().max(255, 'Tên trường tối đa 255 ký tự.'),
  occupation: z.string().trim().max(255, 'Nghề nghiệp tối đa 255 ký tự.'),
  bio: z.string().trim().max(2000, 'Giới thiệu tối đa 2.000 ký tự.')
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export function profileFormValues(profile: UserProfile): ProfileFormValues {
  return {
    displayName: profile.displayName ?? '',
    birthYear: profile.birthYear?.toString() ?? '',
    gender: profile.gender ?? '',
    school: profile.school ?? '',
    occupation: profile.occupation ?? '',
    bio: profile.bio ?? ''
  }
}

export function profileUpdatePayload(values: ProfileFormValues): ProfileUpdateRequest {
  const normalized = profileFormSchema.parse(values)
  return {
    displayName: normalized.displayName || null,
    birthYear: normalized.birthYear ? Number(normalized.birthYear) : null,
    gender: normalized.gender || null,
    school: normalized.school || null,
    occupation: normalized.occupation || null,
    bio: normalized.bio || null
  }
}
