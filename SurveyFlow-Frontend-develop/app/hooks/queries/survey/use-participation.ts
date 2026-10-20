import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { participationApi } from '@/apis/participation.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'

export function useParticipation(surveyId: number) {
  const userId = useAuthStore((state) => state.user?.id)
  const client = useQueryClient()
  const key = QUERY_KEYS.surveys.participation(surveyId, userId)
  const storageKey = `survey-participation:${userId}:${surveyId}`
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const publicId = sessionStorage.getItem(storageKey)
      return publicId ? participationApi.detail(publicId) : null
    },
    enabled: !!userId,
    retry: false,
    refetchInterval: (q) =>
      q.state.data && ['RESERVED', 'SUBMITTED'].includes(q.state.data.status) ? 5000 : false
  })
  const reserve = useMutation({
    mutationFn: () => participationApi.reserve(surveyId),
    onSuccess: (data) => {
      sessionStorage.setItem(storageKey, data.publicId)
      client.setQueryData(key, data)
      void client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.detail(surveyId) })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.exchange })
    }
  })
  const code = useMutation({
    mutationFn: () => {
      if (!query.data) throw new Error('Hãy đăng ký tham gia trước.')
      return participationApi.code(query.data.publicId)
    }
  })
  const verify = useMutation({
    mutationFn: (params?: { completionCode?: string; respondentEmail?: string }) => {
      if (!query.data) throw new Error('Không tìm thấy thông tin lượt tham gia.')
      return participationApi.verify(query.data.publicId, params)
    },
    onSuccess: (data) => {
      client.setQueryData(key, data)
      void client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.detail(surveyId) })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.exchange })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.credits.wallet })
    }
  })
  return { query, reserve, code, verify }
}
