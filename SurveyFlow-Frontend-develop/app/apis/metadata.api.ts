import { unwrapApiResponse } from '@/utils/api-response'
import { env } from '@/config/env'
import { METADATA_ENDPOINTS } from '@/constants/metadata'
import http from '@/libs/http'
import { mockMetadataApi } from '@/mocks/metadata.mock'
import type { ApiResponse, Badge, Category, Interest, Level, Tag } from '@/types'

export const metadataApi = {
  async getCategories(): Promise<Category[]> {
    if (env.VITE_ENABLE_MOCK) {
      return mockMetadataApi.getCategories()
    }

    const response = await http.get<ApiResponse<Category[]>>(METADATA_ENDPOINTS.categories)
    return unwrapApiResponse(response.data)
  },

  async getInterests(): Promise<Interest[]> {
    if (env.VITE_ENABLE_MOCK) {
      return mockMetadataApi.getInterests()
    }

    const response = await http.get<ApiResponse<Interest[]>>(METADATA_ENDPOINTS.interests)
    return unwrapApiResponse(response.data)
  },

  async getTags(): Promise<Tag[]> {
    if (env.VITE_ENABLE_MOCK) {
      return mockMetadataApi.getTags()
    }

    const response = await http.get<ApiResponse<Tag[]>>(METADATA_ENDPOINTS.tags)
    return unwrapApiResponse(response.data)
  },

  async getBadges(): Promise<Badge[]> {
    if (env.VITE_ENABLE_MOCK) {
      return mockMetadataApi.getBadges()
    }

    const response = await http.get<ApiResponse<Badge[]>>(METADATA_ENDPOINTS.badges)
    return unwrapApiResponse(response.data)
  },

  async getLevels(): Promise<Level[]> {
    if (env.VITE_ENABLE_MOCK) {
      return mockMetadataApi.getLevels()
    }

    const response = await http.get<ApiResponse<Level[]>>(METADATA_ENDPOINTS.levels)
    return unwrapApiResponse(response.data)
  }
}
