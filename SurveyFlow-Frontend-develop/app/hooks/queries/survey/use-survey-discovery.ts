import { useQuery } from '@tanstack/react-query'
import { surveyApi } from '@/apis/survey.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { SurveyDiscoveryOptions } from '@/types/survey-discovery.type'

export function useSurveyDiscoveryQuery(options: SurveyDiscoveryOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.surveys.discovery(options.page, options.sort),
    queryFn: () => surveyApi.list(options)
  })
}

export function useSurveyRecommendationsQuery(limit = 6) {
  return useQuery({
    queryKey: QUERY_KEYS.surveys.recommendations(limit),
    queryFn: () => surveyApi.getRecommendations(limit)
  })
}

export function useSurveyDetailQuery(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.surveys.detail(id),
    queryFn: () => surveyApi.detail(id),
    enabled: Number.isSafeInteger(id) && id > 0,
    retry: false
  })
}
