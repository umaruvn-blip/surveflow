import { mockSurveyDiscoveryApi } from '@/mocks/survey-discovery.mock'
import { useAuthStore } from '@/stores/auth-store'
import type { Participation, CompletionCode } from '@/types/participation.type'

const records = new Map<string, Participation>()
export const mockParticipationApi = {
  async reserve(surveyId: number): Promise<Participation> {
    const survey = await mockSurveyDiscoveryApi.detail(surveyId)
    const userId = useAuthStore.getState().user?.id
    if (!userId || userId === survey.creatorId)
      throw new Error('Bạn không thể tham gia khảo sát này.')
    if (
      survey.status !== 'PUBLISHED' ||
      survey.availableSlots <= 0 ||
      (survey.deadline && Date.parse(survey.deadline) <= Date.now())
    )
      throw new Error('Khảo sát không còn nhận người tham gia.')
    if (
      [...records.values()].some(
        (p) =>
          p.userId === userId && p.surveyId === surveyId && Date.parse(p.slotExpiresAt) > Date.now()
      )
    )
      throw new Error('Bạn đã đăng ký khảo sát này.')
    const now = Date.now()
    const record: Participation = {
      publicId: crypto.randomUUID(),
      surveyId,
      userId,
      status: 'RESERVED',
      rewardCredit: survey.rewardCredit,
      externalFormUrl: survey.externalFormUrl,
      slotReservedAt: new Date(now).toISOString(),
      codeAvailableAt: new Date(
        now + survey.verification.minCompletionSeconds * 1000
      ).toISOString(),
      slotExpiresAt: new Date(now + survey.slotTtlSeconds * 1000).toISOString()
    }
    records.set(record.publicId, record)
    return record
  },
  async detail(publicId: string): Promise<Participation> {
    const record = records.get(publicId)
    if (!record || record.userId !== useAuthStore.getState().user?.id)
      throw new Error('Không tìm thấy lượt tham gia demo. Dữ liệu demo được đặt lại khi tải trang.')
    return Date.parse(record.slotExpiresAt) <= Date.now()
      ? { ...record, status: 'EXPIRED' }
      : record
  },
  async code(publicId: string): Promise<CompletionCode> {
    const record = await this.detail(publicId)
    if (record.status !== 'RESERVED' || Date.now() < Date.parse(record.codeAvailableAt))
      throw new Error('Chưa thể lấy mã hoàn thành.')
    return {
      participationPublicId: publicId,
      completionCode: 'DEMO' + crypto.randomUUID().slice(0, 6).toUpperCase(),
      issuedAt: new Date().toISOString(),
      expiresAt: record.slotExpiresAt
    }
  },
  async verify(publicId: string, completionCode?: string): Promise<Participation> {
    const record = await this.detail(publicId)
    if (record.status !== 'RESERVED')
      throw new Error('Lượt tham gia không ở trạng thái chờ xác nhận.')
    record.status = 'VERIFIED'
    return record
  }
}
