import { env } from '@/config/env'
import http from '@/libs/http'
import { mockProfileApi } from '@/mocks/profile.mock'
import type { ApiResponse } from '@/types/api-response.type'
import type { InterestsResponse, ProfileUpdateRequest, UserProfile } from '@/types/profile.type'
import { unwrapApiResponse } from '@/utils/api-response'

const PROFILE_URL = '/users/me/profile'

export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    if (env.VITE_ENABLE_MOCK) return mockProfileApi.getProfile()
    const response = await http.get<ApiResponse<UserProfile>>(PROFILE_URL)
    return unwrapApiResponse(response.data)
  },
  async updateProfile(payload: ProfileUpdateRequest): Promise<UserProfile> {
    if (env.VITE_ENABLE_MOCK) return mockProfileApi.updateProfile(payload)
    const response = await http.put<ApiResponse<UserProfile>>(PROFILE_URL, payload)
    return unwrapApiResponse(response.data)
  },
  async replaceInterests(interestIds: number[]): Promise<InterestsResponse> {
    if (env.VITE_ENABLE_MOCK) return mockProfileApi.replaceInterests(interestIds)
    const response = await http.put<ApiResponse<InterestsResponse>>('/users/me/interests', {
      interestIds
    })
    return unwrapApiResponse(response.data)
  }
}
