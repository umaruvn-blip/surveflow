export type LeaderboardType = 'RESPONDENT' | 'CREATOR'

export type LeaderboardPeriod = 'WEEK' | 'MONTH' | 'ALL_TIME'

export interface LeaderboardItem {
  rank: number
  userId: number
  displayName: string
  avatarUrl?: string | null
  school?: string | null
  occupation?: string | null
  levelNumber: number
  levelTitle: string
  totalXp: number
  completedSurveysCount?: number | null
  totalEarnedCredits?: number | null
  createdSurveysCount?: number | null
  totalResponsesCollected?: number | null
}

export interface LeaderboardResponse {
  type: LeaderboardType
  period: LeaderboardPeriod
  items: LeaderboardItem[]
  myRank?: LeaderboardItem | null
}
