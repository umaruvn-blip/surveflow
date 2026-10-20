import { useQuery } from '@tanstack/react-query'

import { surveyApi } from '@/apis/survey.api'
import { QUERY_KEYS } from '@/constants/query-keys'

export const useSurveyTrackingSummaryQuery = (scope: 'mine' | 'global' = 'mine') =>
  useQuery({
    queryKey: QUERY_KEYS.surveys.tracking(scope),
    queryFn: () => surveyApi.getTrackingSummary(scope)
  })
