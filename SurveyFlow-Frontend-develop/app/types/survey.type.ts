export type ExchangeSurvey = {
  completed: boolean
  desiredParticipants: number
  formUrl: string
  id: number
  rewardCredit: number
  rewardXp: number
  supportServices: SurveySupportService[]
  title: string
  totalCost: number
}

export type SurveySupportService = 'aiMatching' | 'aiQualityCheck' | 'priorityBoost'

export type CreateSurveyRequest = Pick<
  ExchangeSurvey,
  'desiredParticipants' | 'formUrl' | 'supportServices' | 'title' | 'totalCost'
>

export type SurveyTrackingSummary = {
  completedCount: number
  completionRate: number
  creditsAwarded: number
  formOpenCount: number
  invalidCodeCount: number
  publishedCount: number
  xpAwarded: number
}

export type SurveyRecommendation = {
  id: number
  title: string
  description: string | null
  categoryName: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
  rewardCredit: number
  targetResponseCount: number
  currentResponseCount: number
  deadline: string | null
  targetInterests: string[]
  matchScore: number | null
}
