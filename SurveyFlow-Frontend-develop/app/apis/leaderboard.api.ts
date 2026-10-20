import http from '@/libs/http'
import type { ApiResponse } from '@/types/api-response.type'
import type { LeaderboardItem, LeaderboardPeriod, LeaderboardResponse, LeaderboardType } from '@/types/leaderboard.type'
import { unwrapApiResponse } from '@/utils/api-response'

export const leaderboardApi = {
  async getLeaderboard(
    type: LeaderboardType = 'RESPONDENT',
    period: LeaderboardPeriod = 'ALL_TIME',
    limit = 30
  ): Promise<LeaderboardResponse> {
    const response = await http.get<ApiResponse<LeaderboardResponse>>('/leaderboard', {
      params: { type, period, limit }
    })
    return unwrapApiResponse(response.data)
  },

  async getMyRank(
    type: LeaderboardType = 'RESPONDENT',
    period: LeaderboardPeriod = 'ALL_TIME'
  ): Promise<LeaderboardItem> {
    const response = await http.get<ApiResponse<LeaderboardItem>>('/leaderboard/my-rank', {
      params: { type, period }
    })
    return unwrapApiResponse(response.data)
  }
}
