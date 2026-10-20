import { z } from 'zod'

import { emailSchema, passwordSchema } from '@/schemas/common-schema'

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const registerRequestSchema = z
  .object({
    accountType: z.enum(['STUDENT', 'WORKER']),
    fullName: z.string().trim().min(1, 'Họ tên là bắt buộc').max(100, 'Họ tên tối đa 100 ký tự'),
    university: z.string().trim().max(255, 'Trường tối đa 255 ký tự').optional(),
    major: z.string().trim().max(255, 'Chuyên ngành tối đa 255 ký tự').optional(),
    company: z.string().trim().max(255, 'Công ty tối đa 255 ký tự').optional(),
    jobTitle: z.string().trim().max(255, 'Công việc tối đa 255 ký tự').optional(),
    email: emailSchema,
    referralCode: z.string().trim().toUpperCase().max(12, 'Mã giới thiệu tối đa 12 ký tự').optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })
  .superRefine((values, context) => {
    if (values.accountType === 'STUDENT') {
      if (!values.university)
        context.addIssue({
          code: 'custom',
          path: ['university'],
          message: 'Trường đại học là bắt buộc'
        })
      if (!values.major)
        context.addIssue({ code: 'custom', path: ['major'], message: 'Chuyên ngành là bắt buộc' })
    }
    if (values.accountType === 'WORKER') {
      if (!values.company)
        context.addIssue({ code: 'custom', path: ['company'], message: 'Công ty là bắt buộc' })
      if (!values.jobTitle)
        context.addIssue({ code: 'custom', path: ['jobTitle'], message: 'Công việc là bắt buộc' })
    }
  })
