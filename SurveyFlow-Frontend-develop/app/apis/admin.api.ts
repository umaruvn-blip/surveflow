import http from '@/libs/http'
import type { ApiResponse } from '@/types/api-response.type'
import type { AdminTrackingStats } from '@/types/admin-tracking.type'
import { unwrapApiResponse } from '@/utils/api-response'

export const adminApi = {
  async getTrackingSummary(): Promise<AdminTrackingStats> {
    const response = await http.get<ApiResponse<AdminTrackingStats>>('/admin/tracking/summary')
    return unwrapApiResponse(response.data)
  }
}
