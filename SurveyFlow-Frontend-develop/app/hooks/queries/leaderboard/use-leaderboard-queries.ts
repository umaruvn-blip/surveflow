import { useQuery } from '@tanstack/react-query'
import { leaderboardApi } from '@/apis/leaderboard.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { LeaderboardPeriod, LeaderboardType } from '@/types/leaderboard.type'

export function useLeaderboardQuery(
  type: LeaderboardType = 'RESPONDENT',
  period: LeaderboardPeriod = 'ALL_TIME',
  limit = 30
) {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard.list(type, period),
    queryFn: () => leaderboardApi.getLeaderboard(type, period, limit),
    staleTime: 60 * 1000 // 1 minute
  })
}

export function useMyRankQuery(
  type: LeaderboardType = 'RESPONDENT',
  period: LeaderboardPeriod = 'ALL_TIME',
  enabled = true
) {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard.myRank(type, period),
    queryFn: () => leaderboardApi.getMyRank(type, period),
    enabled,
    staleTime: 60 * 1000
  })
}
