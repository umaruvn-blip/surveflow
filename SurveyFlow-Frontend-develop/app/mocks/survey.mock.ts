import { mockCreditApi } from '@/mocks/credit.mock'
import type {
  CreateSurveyRequest,
  ExchangeSurvey,
  SurveyTrackingSummary
} from '@/types/survey.type'

let nextId = 4
let formOpenCount = 0
let invalidCodeCount = 0
const surveys: ExchangeSurvey[] = [
  {
    id: 1,
    title: 'Thói quen học tập của sinh viên',
    desiredParticipants: 50,
    formUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSdnk-TLGL1B7VZ3I5OPLxZJN8hvl-Sgn3YnTLc3csKwIHRWSg/viewform?usp=publish-editor',
    rewardCredit: 10,
    rewardXp: 15,
    supportServices: [],
    totalCost: 550,
    completed: false
  },
  {
    id: 2,
    title: 'Hành vi mua sắm trực tuyến',
    desiredParticipants: 50,
    formUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLScgOV3ujNOJ0ZhpFkZdcQqfrIPmX7RmkrVEOvYKCZNWO_bS_g/viewform?usp=publish-editor',
    rewardCredit: 10,
    rewardXp: 15,
    supportServices: ['aiQualityCheck'],
    totalCost: 580,
    completed: false
  }
]

export const mockSurveyApi = {
  async complete(id: number, completionCode: string): Promise<ExchangeSurvey> {
    if (!completionCode.trim()) {
      invalidCodeCount += 1
      throw new Error('Vui lòng dán mã hoàn thành.')
    }
    const survey = surveys.find((item) => item.id === id)
    if (!survey) throw new Error('Không tìm thấy khảo sát.')
    if (survey.completed) throw new Error('Khảo sát này đã nhận thưởng.')
    survey.completed = true
    await mockCreditApi.grantParticipationReward()
    return survey
  },
  async create(payload: CreateSurveyRequest): Promise<ExchangeSurvey> {
    const survey = { id: nextId++, ...payload, rewardCredit: 10, rewardXp: 15, completed: false }
    surveys.unshift(survey)
    return survey
  },
  async list(): Promise<ExchangeSurvey[]> {
    return surveys
  },
  async recordFormOpen(id: number): Promise<void> {
    if (!surveys.some((survey) => survey.id === id)) throw new Error('Không tìm thấy khảo sát.')
    formOpenCount += 1
  },
  async getTrackingSummary(_scope: 'mine' | 'global' = 'mine'): Promise<SurveyTrackingSummary> {
    const completed = surveys.filter((survey) => survey.completed)
    return {
      publishedCount: surveys.length,
      formOpenCount,
      completedCount: completed.length,
      completionRate: formOpenCount ? Math.round((completed.length / formOpenCount) * 100) : 0,
      creditsAwarded: completed.reduce((total, survey) => total + survey.rewardCredit, 0),
      xpAwarded: completed.reduce((total, survey) => total + survey.rewardXp, 0),
      invalidCodeCount
    }
  }
}
