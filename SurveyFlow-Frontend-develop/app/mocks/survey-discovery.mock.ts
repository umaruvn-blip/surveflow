import { mockProfileApi } from '@/mocks/profile.mock'
import { mockSurveyCreatorApi } from '@/mocks/survey-creator.mock'
import { DEFAULT_SURVEY } from '@/schemas/survey.schema'
import { useAuthStore } from '@/stores/auth-store'
import type { PageResponse } from '@/types/api-response.type'
import type { SurveyDiscoveryOptions } from '@/types/survey-discovery.type'
import type { SurveyDetail, SurveySummary } from '@/types/survey-management.type'
import type { SurveyRecommendation } from '@/types/survey.type'
import { isSurveyDiscoverable } from '@/utils/survey-discovery'

const titles = [
  'Thói quen học tập của sinh viên',
  'Hành vi mua sắm trực tuyến',
  'Trải nghiệm học trực tuyến',
  'Ứng dụng công nghệ trong học tập',
  'Thói quen đọc sách',
  'Trải nghiệm thư viện đại học',
  'Lựa chọn phương tiện đến trường',
  'Sử dụng mạng xã hội',
  'Kỹ năng làm việc nhóm',
  'Nhu cầu học ngoại ngữ',
  'Sử dụng ứng dụng di động',
  'Trải nghiệm mua hàng trực tuyến',
  'Hoạt động ngoại khóa',
  'Không gian học tập',
  'Định hướng nghề nghiệp'
]
export const DISCOVERY_FIXTURES: SurveyDetail[] = titles.map((title, index) => ({
  ...structuredClone(DEFAULT_SURVEY),
  id: index + 1,
  creatorId: 101 + index,
  title,
  categoryId: (index % 2) + 1,
  description:
    'Khảo sát tìm hiểu trải nghiệm và lựa chọn của người tham gia trong cuộc sống hằng ngày. Mỗi ý kiến sẽ góp phần hoàn thiện nghiên cứu.',
  researchPurpose:
    'Thu thập dữ liệu phục vụ nghiên cứu học thuật và đề xuất cải thiện trải nghiệm của cộng đồng.',
  participantInstructions:
    'Đọc kỹ từng câu hỏi và trả lời theo trải nghiệm thực tế. Không cung cấp thông tin cá nhân ngoài những nội dung được yêu cầu.',
  containsSensitiveQuestions: index === 2,
  dataUsageNotice:
    'Dữ liệu chỉ sử dụng cho nghiên cứu, được tổng hợp và không công bố thông tin nhận diện cá nhân.',
  externalFormUrl: 'https://docs.google.com/forms/d/e/DEMO_PREVIEW_ONLY/viewform',
  estimatedDurationSeconds: 180 + (index % 4) * 60,
  questionCount: 8 + (index % 7),
  rewardCredit: 10 + (index % 6) * 5,
  targetResponseCount: 50,
  currentResponseCount: 10 + index,
  availableSlots: 35 - index,
  status: 'PUBLISHED',
  publishedAt: new Date(Date.UTC(2026, 8, 25, 12, index)).toISOString(),
  createdAt: '2026-09-20T00:00:00Z',
  updatedAt: '2026-09-25T00:00:00Z',
  deadline: null,
  targeting:
    index === 0
      ? {
          minBirthYear: 2000,
          maxBirthYear: 2010,
          gender: null,
          school: null,
          occupation: null,
          interestIds: []
        }
      : null,
  verification: { ...DEFAULT_SURVEY.verification, version: 1, webhookVerified: true }
}))

function summary(survey: SurveyDetail): SurveySummary {
  const {
    id,
    creatorId,
    categoryId,
    title,
    provider,
    estimatedDurationSeconds,
    rewardCredit,
    targetResponseCount,
    currentResponseCount,
    availableSlots,
    status,
    deadline,
    createdAt
  } = survey
  return {
    id,
    creatorId,
    categoryId,
    title,
    provider,
    estimatedDurationSeconds,
    rewardCredit,
    targetResponseCount,
    currentResponseCount,
    availableSlots,
    status,
    deadline,
    createdAt
  }
}
export const mockSurveyDiscoveryApi = {
  async list(options: SurveyDiscoveryOptions): Promise<PageResponse<SurveySummary>> {
    const profile = await mockProfileApi.getProfile()
    const all = [...DISCOVERY_FIXTURES, ...(await mockSurveyCreatorApi.visibleSurveys())]
    const visible = all.filter((survey) => isSurveyDiscoverable(survey, profile, Date.now()))
    visible.sort((a, b) =>
      options.sort === 'reward'
        ? b.rewardCredit - a.rewardCredit || b.id - a.id
        : (Date.parse(a.publishedAt ?? a.createdAt) - Date.parse(b.publishedAt ?? b.createdAt)) *
          (options.sort === 'newest' ? -1 : 1)
    )
    return structuredClone({
      items: visible.slice((options.page - 1) * 12, options.page * 12).map(summary),
      page: options.page,
      size: 12,
      totalElements: visible.length,
      totalPages: Math.ceil(visible.length / 12)
    })
  },
  async detail(id: number): Promise<SurveyDetail> {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Vui lòng đăng nhập để xem khảo sát.')
    const all = [...DISCOVERY_FIXTURES, ...(await mockSurveyCreatorApi.visibleSurveys())]
    const survey = all.find((item) => item.id === id)
    if (!survey || (survey.status !== 'PUBLISHED' && survey.creatorId !== user.id))
      throw new Error('Khảo sát không tồn tại hoặc bạn không có quyền xem.')
    return structuredClone(survey)
  },
  async recommendations(limit = 6): Promise<SurveyRecommendation[]> {
    const all = [...DISCOVERY_FIXTURES, ...(await mockSurveyCreatorApi.visibleSurveys())]
    const published = all.filter((survey) => survey.status === 'PUBLISHED')
    const simulatedScores = [0.96, 0.92, 0.88, 0.84, 0.79, 0.75, 0.71]
    return published.slice(0, limit).map((survey, index) => ({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      categoryName: survey.categoryId === 1 ? 'Giáo dục & Học tập' : 'Thương mại & Dịch vụ',
      status: survey.status,
      rewardCredit: survey.rewardCredit,
      targetResponseCount: survey.targetResponseCount,
      currentResponseCount: survey.currentResponseCount,
      deadline: survey.deadline,
      targetInterests: ['Công nghệ', 'Học tập', 'Nghiên cứu sinh viên'],
      matchScore: simulatedScores[index % simulatedScores.length]
    }))
  }
}
