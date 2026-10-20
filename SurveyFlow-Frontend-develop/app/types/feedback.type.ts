export interface CreateFeedbackPayload {
  rating?: number
  sources?: string[]
  otherSource?: string
  content?: string
}

export interface FeedbackItem {
  id: number
  userId?: number | null
  userEmail?: string | null
  rating?: number | null
  sources?: string[]
  otherSource?: string | null
  content?: string | null
  createdAt: string
}

export interface FeedbackSummary {
  totalFeedbacks: number
  averageRating: number
  sourceCounts: Record<string, number>
  recentFeedbacks: FeedbackItem[]
}
