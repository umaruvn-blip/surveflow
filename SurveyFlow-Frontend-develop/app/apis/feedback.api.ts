import { env } from '@/config/env'
import http from '@/libs/http'
import { mockFeedbackApi } from '@/mocks/feedback.mock'
import type { ApiResponse } from '@/types/api-response.type'
import type { CreateFeedbackPayload, FeedbackSummary } from '@/types/feedback.type'
import { unwrapApiResponse } from '@/utils/api-response'

export const feedbackApi = {
  async createFeedback(payload: CreateFeedbackPayload): Promise<void> {
    if (env.VITE_ENABLE_MOCK) return mockFeedbackApi.createFeedback(payload)
    const response = await http.post<ApiResponse<void>>('/feedbacks', payload)
    return unwrapApiResponse(response.data)
  },

  async getFeedbackSummary(): Promise<FeedbackSummary> {
    if (env.VITE_ENABLE_MOCK) return mockFeedbackApi.getFeedbackSummary()
    const response = await http.get<ApiResponse<FeedbackSummary>>('/feedbacks/summary')
    return unwrapApiResponse(response.data)
  }
}
