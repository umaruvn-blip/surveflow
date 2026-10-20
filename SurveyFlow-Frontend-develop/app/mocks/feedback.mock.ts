import type { CreateFeedbackPayload, FeedbackItem, FeedbackSummary } from '@/types/feedback.type'

let mockFeedbacks: FeedbackItem[] = [
  {
    id: 1,
    userId: 1,
    userEmail: 'sinhvien.k19@ctu.edu.vn',
    rating: 5,
    sources: ['facebook', 'friends'],
    otherSource: null,
    content: 'Nền tảng rất hữu ích cho sinh viên làm đề tài nghiên cứu khoa học và khóa luận tốt nghiệp!',
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
  },
  {
    id: 2,
    userId: null,
    userEmail: null,
    rating: 5,
    sources: ['university'],
    otherSource: null,
    content: 'CLB Sinh viên NCKH giới thiệu, dùng đổi chéo khảo sát rất nhanh và tiện lợi.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  },
  {
    id: 3,
    userId: 2,
    userEmail: 'nguyen.research@gmail.com',
    rating: 4,
    sources: ['google', 'tiktok'],
    otherSource: null,
    content: 'Giao diện mượt mà, mong có thêm nhiều thống kê theo nhóm ngành hơn nữa.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString()
  }
]

export const mockFeedbackApi = {
  async createFeedback(payload: CreateFeedbackPayload): Promise<void> {
    const newFeedback: FeedbackItem = {
      id: Date.now(),
      userId: 1,
      userEmail: 'current.user@surveyflow.vn',
      rating: payload.rating ?? 5,
      sources: payload.sources ?? [],
      otherSource: payload.otherSource ?? null,
      content: payload.content ?? null,
      createdAt: new Date().toISOString()
    }
    mockFeedbacks = [newFeedback, ...mockFeedbacks]
  },

  async getFeedbackSummary(): Promise<FeedbackSummary> {
    const totalFeedbacks = mockFeedbacks.length
    const avgRating =
      mockFeedbacks.reduce((sum, item) => sum + (item.rating ?? 5), 0) / (totalFeedbacks || 1)

    const sourceCounts: Record<string, number> = {
      facebook: 0,
      friends: 0,
      university: 0,
      tiktok: 0,
      google: 0,
      other: 0
    }

    mockFeedbacks.forEach((fb) => {
      fb.sources?.forEach((src) => {
        sourceCounts[src] = (sourceCounts[src] ?? 0) + 1
      })
    })

    return {
      totalFeedbacks,
      averageRating: Math.round(avgRating * 10) / 10,
      sourceCounts,
      recentFeedbacks: mockFeedbacks.slice(0, 20)
    }
  }
}
