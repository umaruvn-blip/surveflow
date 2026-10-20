import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { feedbackApi } from '@/apis/feedback.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { CreateFeedbackPayload } from '@/types/feedback.type'

export const useCreateFeedbackMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFeedbackPayload) => feedbackApi.createFeedback(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedbacks.summary })
    }
  })
}

export const useFeedbackSummaryQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.feedbacks.summary,
    queryFn: () => feedbackApi.getFeedbackSummary()
  })
