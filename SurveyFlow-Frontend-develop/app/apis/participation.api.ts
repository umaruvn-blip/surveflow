import { env } from '@/config/env'
import http from '@/libs/http'
import { mockParticipationApi } from '@/mocks/participation.mock'
import type { ApiResponse } from '@/types/api-response.type'
import type { Participation, CompletionCode } from '@/types/participation.type'
import { unwrapApiResponse } from '@/utils/api-response'

export const participationApi = {
  async reserve(surveyId: number): Promise<Participation> {
    if (env.VITE_ENABLE_MOCK) return mockParticipationApi.reserve(surveyId)
    return unwrapApiResponse(
      (await http.post<ApiResponse<Participation>>(`/surveys/${surveyId}/participations`)).data
    )
  },
  async detail(publicId: string): Promise<Participation> {
    if (env.VITE_ENABLE_MOCK) return mockParticipationApi.detail(publicId)
    return unwrapApiResponse(
      (await http.get<ApiResponse<Participation>>(`/participations/${publicId}`)).data
    )
  },
  async code(publicId: string): Promise<CompletionCode> {
    if (env.VITE_ENABLE_MOCK) return mockParticipationApi.code(publicId)
    return unwrapApiResponse(
      (
        await http.post<ApiResponse<CompletionCode>>(
          `/participations/${publicId}/verification-code`
        )
      ).data
    )
  },
  async verify(
    publicId: string,
    params?: { completionCode?: string; respondentEmail?: string }
  ): Promise<Participation> {
    if (env.VITE_ENABLE_MOCK) return mockParticipationApi.verify(publicId, params?.completionCode)
    return unwrapApiResponse(
      (
        await http.post<ApiResponse<Participation>>(`/participations/${publicId}/verify`, {
          completionCode: params?.completionCode,
          respondentEmail: params?.respondentEmail
        })
      ).data
    )
  }
}
