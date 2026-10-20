import http from '@/libs/http'
import type { ApiResponse } from '@/types/api-response.type'
import type { AttributionStats, RecordAttributionPayload } from '@/types/attribution.type'
import { unwrapApiResponse } from '@/utils/api-response'

export const attributionApi = {
  async recordVisit(payload: RecordAttributionPayload): Promise<void> {
    const response = await http.post<ApiResponse<void>>('/attributions/record', payload)
    return unwrapApiResponse(response.data)
  },

  async markConversion(sessionId: string): Promise<void> {
    const response = await http.post<ApiResponse<void>>(`/attributions/convert?sessionId=${encodeURIComponent(sessionId)}`)
    return unwrapApiResponse(response.data)
  },

  async getStats(): Promise<AttributionStats> {
    const response = await http.get<ApiResponse<AttributionStats>>('/attributions/stats')
    return unwrapApiResponse(response.data)
  }
}
