import { z } from 'zod'

export function googleFormId(url: string | null): string | null {
  try {
    if (!url) return null
    const trimmed = url.trim()
    if (!trimmed) return null

    // Direct Form ID
    if (/^[A-Za-z0-9_-]{15,}$/.test(trimmed)) {
      return trimmed
    }

    const parsed = new URL(trimmed)
    if (parsed.hostname === 'forms.gle') {
      const match = parsed.pathname.match(/^\/([A-Za-z0-9_-]+)/)
      return match?.[1] ?? null
    }

    if (
      parsed.hostname === 'docs.google.com' ||
      parsed.hostname === 'forms.google.com' ||
      parsed.hostname.endsWith('.google.com')
    ) {
      const match = parsed.pathname.match(
        /(?:\/u\/\d+)?\/forms\/d\/(?:e\/)?([A-Za-z0-9_-]+)(?:\/(?:viewform|edit|formResponse))?/i
      )
      if (match?.[1]) {
        return match[1]
      }
    }
    return null
  } catch {
    return null
  }
}
const positive = z
  .number({ error: 'Nhập số hợp lệ' })
  .int('Nhập số nguyên')
  .positive('Nhập số lớn hơn 0')
  .max(2147483647, 'Số quá lớn')
const optionalText = z.string().trim().nullable()
export const surveySchema = z
  .object({
    categoryId: positive.nullable(),
    title: z.string().trim().min(1, 'Nhập tên khảo sát').max(255, 'Tối đa 255 ký tự'),
    description: optionalText,
    researchPurpose: optionalText,
    participantInstructions: optionalText,
    provider: z.literal('GOOGLE_FORMS'),
    externalFormUrl: z
      .string()
      .trim()
      .max(1000, 'URL tối đa 1000 ký tự')
      .refine(
        (url) => !!googleFormId(url),
        'Vui lòng nhập đường dẫn Google Form hợp lệ (docs.google.com/forms hoặc forms.gle)'
      ),
    estimatedDurationSeconds: positive.nullable(),
    questionCount: positive.nullable(),
    language: z.string().max(16, 'Tối đa 16 ký tự').nullable(),
    containsSensitiveQuestions: z.boolean(),
    dataUsageNotice: optionalText,
    rewardCredit: positive,
    targetResponseCount: positive,
    slotTtlSeconds: positive,
    deadline: z
      .string()
      .nullable()
      .refine((value) => !value || Date.parse(value) > Date.now(), 'Thời hạn phải trong tương lai'),
    verification: z.object({
      method: z.literal('EXTERNAL_CODE'),
      minCompletionSeconds: z
        .number({ error: 'Nhập số hợp lệ' })
        .int('Nhập số nguyên')
        .min(0, 'Không được nhỏ hơn 0')
        .max(2147483647, 'Số quá lớn'),
      maxCompletionSeconds: positive,
      maxAttempts: positive.max(10, 'Tối đa 10 lần')
    }),
    targeting: z
      .object({
        minBirthYear: z
          .number({ error: 'Nhập số hợp lệ' })
          .int('Nhập số nguyên')
          .min(1900, 'Năm sinh phải từ 1900')
          .nullable(),
        maxBirthYear: z
          .number({ error: 'Nhập số hợp lệ' })
          .int('Nhập số nguyên')
          .min(1900, 'Năm sinh phải từ 1900')
          .nullable(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable(),
        school: z.string().max(255, 'Tối đa 255 ký tự').nullable(),
        occupation: z.string().max(255, 'Tối đa 255 ký tự').nullable(),
        interestIds: z.array(positive)
      })
      .nullable()
  })
  .superRefine((value, ctx) => {
    if (value.verification.minCompletionSeconds > value.verification.maxCompletionSeconds)
      ctx.addIssue({
        code: 'custom',
        path: ['verification', 'maxCompletionSeconds'],
        message: 'Thời gian tối đa phải ≥ thời gian tối thiểu'
      })
    if (value.containsSensitiveQuestions && !value.dataUsageNotice?.trim())
      ctx.addIssue({
        code: 'custom',
        path: ['dataUsageNotice'],
        message: 'Cần thông báo sử dụng dữ liệu nhạy cảm'
      })
    if (!Number.isSafeInteger(value.rewardCredit * value.targetResponseCount))
      ctx.addIssue({ code: 'custom', path: ['targetResponseCount'], message: 'Ngân sách quá lớn' })
    const target = value.targeting
    if (target?.minBirthYear && target.maxBirthYear && target.minBirthYear > target.maxBirthYear)
      ctx.addIssue({
        code: 'custom',
        path: ['targeting', 'maxBirthYear'],
        message: 'Năm sinh tối đa phải ≥ tối thiểu'
      })
  })

export const DEFAULT_SURVEY: z.infer<typeof surveySchema> = {
  categoryId: null,
  title: '',
  description: null,
  researchPurpose: null,
  participantInstructions: null,
  provider: 'GOOGLE_FORMS',
  externalFormUrl: '',
  estimatedDurationSeconds: 300,
  questionCount: null,
  language: 'vi',
  containsSensitiveQuestions: false,
  dataUsageNotice: null,
  rewardCredit: 11,
  targetResponseCount: 10,
  slotTtlSeconds: 1800,
  deadline: null,
  verification: {
    method: 'EXTERNAL_CODE',
    minCompletionSeconds: 120,
    maxCompletionSeconds: 1800,
    maxAttempts: 3
  },
  targeting: {
    minBirthYear: null,
    maxBirthYear: null,
    gender: null,
    school: null,
    occupation: null,
    interestIds: []
  }
}
