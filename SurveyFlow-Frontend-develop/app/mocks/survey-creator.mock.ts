import { useAuthStore } from '@/stores/auth-store'
import { mockCreditApi } from '@/mocks/credit.mock'
import { surveySchema } from '@/schemas/survey.schema'
import type {
  SurveyDetail,
  SurveyDraftInput,
  SurveyWebhookConfiguration
} from '@/types/survey-management.type'

const surveys = new Map<number, SurveyDetail>()
const budgets = new Map<number, number>()
let nextId = 1000
function requireSurvey(id: number) {
  const survey = surveys.get(id)
  if (!survey || survey.creatorId !== (useAuthStore.getState().user?.id ?? 0))
    throw new Error('Không tìm thấy khảo sát.')
  return survey
}
function requireDraft(id: number) {
  const survey = requireSurvey(id)
  if (survey.status !== 'DRAFT') throw new Error('Chỉ được thay đổi bản nháp.')
  return survey
}
export const mockSurveyCreatorApi = {
  async visibleSurveys(): Promise<SurveyDetail[]> {
    const userId = useAuthStore.getState().user?.id ?? 0
    return structuredClone(
      [...surveys.values()].filter(
        (survey) => survey.status === 'PUBLISHED' || survey.creatorId === userId
      )
    )
  },
  async mine(page = 1) {
    const items = [...surveys.values()]
      .filter((survey) => survey.creatorId === (useAuthStore.getState().user?.id ?? 0))
      .reverse()
    return structuredClone({
      items: items.slice((page - 1) * 12, page * 12),
      page,
      size: 12,
      totalElements: items.length,
      totalPages: Math.ceil(items.length / 12)
    })
  },
  async detail(id: number) {
    return structuredClone(requireSurvey(id))
  },
  async save({ id, payload }: { id?: number; payload: SurveyDraftInput }) {
    const validated = surveySchema.parse(payload)
    const previous = id ? requireDraft(id) : null
    const now = new Date().toISOString()
    const survey: SurveyDetail = {
      ...validated,
      id: id ?? nextId++,
      creatorId: useAuthStore.getState().user?.id ?? 0,
      currentResponseCount: 0,
      status: 'DRAFT',
      availableSlots: validated.targetResponseCount,
      publishedAt: null,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
      verification: {
        ...validated.verification,
        version: 1,
        webhookVerified:
          previous?.externalFormUrl === validated.externalFormUrl &&
          !!previous.verification.webhookVerified
      }
    }
    surveys.set(survey.id, survey)
    return structuredClone(survey)
  },
  async configure(id: number): Promise<SurveyWebhookConfiguration> {
    requireDraft(id).verification.webhookVerified = false
    return {
      surveyId: id,
      webhookPath: `/api/v1/webhooks/google-forms/${id}`,
      verificationPath: `/api/v1/webhooks/google-forms/${id}/verify`,
      webhookToken: 'DEMO_ONLY_' + crypto.randomUUID()
    }
  },
  async verify(id: number) {
    requireDraft(id).verification.webhookVerified = true
    return this.detail(id)
  },
  async publish(id: number) {
    const survey = requireDraft(id)
    surveySchema.parse(survey)
    if (!survey.verification.webhookVerified) throw new Error('Chưa kiểm tra kết nối webhook.')
    const budget = survey.rewardCredit * survey.targetResponseCount
    mockCreditApi.holdCreatorBudget(id, budget)
    budgets.set(id, budget)
    survey.status = 'PUBLISHED'
    survey.publishedAt = new Date().toISOString()
    return this.detail(id)
  },
  async close(id: number) {
    const survey = requireSurvey(id)
    if (survey.status !== 'PUBLISHED') throw new Error('Chỉ đóng khảo sát đang mở.')
    mockCreditApi.refundCreatorBudget(id, budgets.get(id) ?? 0)
    budgets.delete(id)
    survey.status = 'CLOSED'
    return this.detail(id)
  }
}
