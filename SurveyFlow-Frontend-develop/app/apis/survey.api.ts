import { env } from '@/config/env'
import http from '@/libs/http'
import { mockSurveyApi } from '@/mocks/survey.mock'
import type { SurveyRecommendation, SurveyTrackingSummary } from '@/types/survey.type'
import { mockSurveyDiscoveryApi } from '@/mocks/survey-discovery.mock'
import type { ApiResponse, PageResponse } from '@/types/api-response.type'
import type { SurveyDiscoveryOptions } from '@/types/survey-discovery.type'
import type { SurveyDetail, SurveySummary } from '@/types/survey-management.type'
import { unwrapApiResponse } from '@/utils/api-response'
import { SURVEY_SORT_PARAMS } from '@/utils/survey-discovery'

export const surveyApi = {
  async getTrackingSummary(scope: 'mine' | 'global' = 'mine'): Promise<SurveyTrackingSummary> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyApi.getTrackingSummary(scope)
    const response = await http.get<ApiResponse<SurveyTrackingSummary>>('/surveys/tracking-summary', {
      params: { scope }
    })
    return unwrapApiResponse(response.data)
  },
  async getRecommendations(limit = 6): Promise<SurveyRecommendation[]> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyDiscoveryApi.recommendations(limit)
    const response = await http.get<ApiResponse<SurveyRecommendation[]>>('/surveys/recommendations', {
      params: { limit }
    })
    return unwrapApiResponse(response.data)
  },
  async list(options: SurveyDiscoveryOptions): Promise<PageResponse<SurveySummary>> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyDiscoveryApi.list(options)
    const response = await http.get<ApiResponse<PageResponse<SurveySummary>>>('/surveys', {
      params: { page: options.page, size: 12, ...SURVEY_SORT_PARAMS[options.sort] }
    })
    return unwrapApiResponse(response.data)
  },
  async detail(id: number): Promise<SurveyDetail> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyDiscoveryApi.detail(id)
    const response = await http.get<ApiResponse<SurveyDetail>>(`/surveys/${id}`)
    return unwrapApiResponse(response.data)
  }
}
