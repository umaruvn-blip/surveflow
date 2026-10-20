/* Dữ liệu danh sách, chi tiết và cấu hình khảo sát dùng trong Frontend. */
export type SurveySummary = {
  id: number
  creatorId: number
  categoryId: number | null
  provider: 'GOOGLE_FORMS' | 'INTERNAL' | 'OTHER'
  estimatedDurationSeconds: number | null
  availableSlots: number
  deadline: string | null
  createdAt: string
  title: string
  rewardCredit: number
  targetResponseCount: number
  currentResponseCount: number
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
}

export type SurveyDraftInput = {
  categoryId: number | null
  title: string
  description: string | null
  researchPurpose: string | null
  participantInstructions: string | null
  provider: 'GOOGLE_FORMS'
  externalFormUrl: string
  estimatedDurationSeconds: number | null
  questionCount: number | null
  language: string | null
  containsSensitiveQuestions: boolean
  dataUsageNotice: string | null
  rewardCredit: number
  targetResponseCount: number
  slotTtlSeconds: number
  deadline: string | null
  verification: {
    method: 'EXTERNAL_CODE'
    minCompletionSeconds: number
    maxCompletionSeconds: number
    maxAttempts: number
  }
  targeting: {
    minBirthYear: number | null
    maxBirthYear: number | null
    gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null
    school: string | null
    occupation: string | null
    interestIds: number[]
  } | null
}

export type SurveyDetail = SurveySummary &
  Omit<SurveyDraftInput, 'provider' | 'verification' | 'externalFormUrl'> & {
    externalFormUrl: string | null
    provider: 'GOOGLE_FORMS' | 'INTERNAL' | 'OTHER'
    verification: Omit<SurveyDraftInput['verification'], 'method'> & {
      method: 'EXTERNAL_CODE' | 'INTERNAL_SUBMISSION' | 'MANUAL_REVIEW'
      version: number
      webhookVerified: boolean
    }
    availableSlots: number
    publishedAt: string | null
    createdAt: string
    updatedAt: string
  }

export type SurveyWebhookConfiguration = {
  surveyId: number
  webhookPath: string
  verificationPath: string
  webhookToken: string
}
