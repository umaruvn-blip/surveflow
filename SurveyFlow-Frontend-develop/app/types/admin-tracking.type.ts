import type { FeedbackSummary } from '@/types/feedback.type'

export interface UserStats {
  totalUsers: number
  studentCount: number
  workerCount: number
  newUsersLast7Days: number
}

export interface SurveyStats {
  totalSurveys: number
  activeSurveys: number
  draftSurveys: number
  closedSurveys: number
  totalFormOpens: number
  validCompletions: number
  invalidCodes: number
  completionRate: number
}

export interface CreditStats {
  totalCreditsInWallets: number
  heldCredits: number
  creditsAwarded: number
  earlyBirdSlotsUsed: number
  earlyBirdSlotsTotal: number
}

export interface NamedCount {
  name: string
  count: number
}

export interface PlanSubscriberCount {
  planCode: string
  planName: string
  totalCount: number
  activeCount: number
}

export interface SubscriptionStats {
  totalSubscribers: number
  activeSubscribers: number
  expiredSubscribers: number
  cancelledSubscribers: number
  planBreakdown: PlanSubscriberCount[]
}

import type { AttributionStats } from '@/types/attribution.type'

export interface AdminTrackingStats {
  userStats: UserStats
  surveyStats: SurveyStats
  creditStats: CreditStats
  feedbackStats: FeedbackSummary
  subscriptionStats?: SubscriptionStats
  utmAttributionStats?: AttributionStats
  topCategories: NamedCount[]
  topUniversities: NamedCount[]
  topOccupations?: NamedCount[]
}
