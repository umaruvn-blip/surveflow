import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { surveyCreatorApi } from '@/apis/survey-creator.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { SurveyDetail } from '@/types/survey-management.type'

export function useCreatorSurveysQuery(page: number) {
  return useQuery({
    queryKey: QUERY_KEYS.surveys.minePage(page),
    queryFn: () => surveyCreatorApi.mine(page)
  })
}
export function useCreatorSurveyQuery(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.surveys.detail(id),
    queryFn: () => surveyCreatorApi.detail(id),
    enabled: Number.isSafeInteger(id) && id > 0
  })
}
export function useCreatorMutations() {
  const client = useQueryClient()
  async function update(survey: SurveyDetail) {
    client.setQueryData(QUERY_KEYS.surveys.detail(survey.id), survey)
    await client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.mine })
  }
  async function lifecycle(survey: SurveyDetail) {
    await update(survey)
    await Promise.all([
      client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.exchange }),
      client.invalidateQueries({ queryKey: QUERY_KEYS.credits.wallet }),
      client.invalidateQueries({ queryKey: QUERY_KEYS.credits.transactions })
    ])
  }
  const save = useMutation({ mutationFn: surveyCreatorApi.save, onSuccess: update })
  const configure = useMutation({
    mutationFn: surveyCreatorApi.configure,
    onSuccess: (config) =>
      client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.detail(config.surveyId) })
  })
  const publish = useMutation({ mutationFn: surveyCreatorApi.publish, onSuccess: lifecycle })
  const close = useMutation({ mutationFn: surveyCreatorApi.close, onSuccess: lifecycle })
  const simulate = useMutation({
    mutationFn: surveyCreatorApi.simulateConnection,
    onSuccess: update
  })
  return { save, configure, publish, close, simulate }
}
