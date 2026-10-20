import { env } from '@/config/env'
import http from '@/libs/http'
import { mockSurveyCreatorApi } from '@/mocks/survey-creator.mock'
import type { ApiResponse, PageResponse } from '@/types/api-response.type'
import type {
  SurveySummary,
  SurveyDetail,
  SurveyDraftInput,
  SurveyWebhookConfiguration
} from '@/types/survey-management.type'
import { unwrapApiResponse } from '@/utils/api-response'

async function post<T>(path: string, payload?: unknown): Promise<T> {
  const response = await http.post<ApiResponse<T>>(path, payload)
  return unwrapApiResponse(response.data)
}
export const surveyCreatorApi = {
  async mine(page: number): Promise<PageResponse<SurveySummary>> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyCreatorApi.mine(page)
    const response = await http.get<ApiResponse<PageResponse<SurveySummary>>>('/surveys/mine', {
      params: { page, size: 12 }
    })
    return unwrapApiResponse(response.data)
  },
  async detail(id: number): Promise<SurveyDetail> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyCreatorApi.detail(id)
    const response = await http.get<ApiResponse<SurveyDetail>>(`/surveys/${id}`)
    return unwrapApiResponse(response.data)
  },
  async save({ id, payload }: { id?: number; payload: SurveyDraftInput }): Promise<SurveyDetail> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyCreatorApi.save({ id, payload })
    if (!id) return post('/surveys', payload)
    const response = await http.put<ApiResponse<SurveyDetail>>(`/surveys/${id}`, payload)
    return unwrapApiResponse(response.data)
  },
  async configure(id: number): Promise<SurveyWebhookConfiguration> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyCreatorApi.configure(id)
    return post(`/surveys/${id}/webhook-configuration`)
  },
  async publish(id: number): Promise<SurveyDetail> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyCreatorApi.publish(id)
    return post(`/surveys/${id}/publish`)
  },
  async close(id: number): Promise<SurveyDetail> {
    if (env.VITE_ENABLE_MOCK) return mockSurveyCreatorApi.close(id)
    return post(`/surveys/${id}/close`)
  },
  async simulateConnection(id: number): Promise<SurveyDetail> {
    if (!env.VITE_ENABLE_MOCK) throw new Error('Chỉ dùng trong demo.')
    return mockSurveyCreatorApi.verify(id)
  }
}
