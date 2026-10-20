import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'

import { surveyCreatorApi } from '@/apis/survey-creator.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useCreatorMutations } from '@/hooks/queries/survey/use-survey-creator'
import { DEFAULT_SURVEY } from '@/schemas/survey.schema'
import type { SurveyDetail } from '@/types/survey-management.type'

vi.mock('@/apis/survey-creator.api', () => ({
  surveyCreatorApi: {
    save: vi.fn(),
    publish: vi.fn(),
    close: vi.fn(),
    configure: vi.fn(),
    simulateConnection: vi.fn()
  }
}))
it('updates detail and invalidates mine, discovery and wallet after publishing', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const survey: SurveyDetail = {
    ...DEFAULT_SURVEY,
    id: 1,
    creatorId: 1,
    status: 'PUBLISHED',
    currentResponseCount: 0,
    availableSlots: 10,
    publishedAt: null,
    createdAt: '',
    updatedAt: '',
    verification: { ...DEFAULT_SURVEY.verification, version: 1, webhookVerified: true }
  }
  vi.mocked(surveyCreatorApi.publish).mockResolvedValue(survey)
  client.setQueryData(QUERY_KEYS.surveys.minePage(1), { items: [] })
  client.setQueryData(QUERY_KEYS.surveys.exchange, [])
  client.setQueryData(QUERY_KEYS.credits.wallet, { spendableBalance: 120 })
  let mutations: ReturnType<typeof useCreatorMutations> | undefined
  function Probe() {
    const actions = useCreatorMutations()
    useEffect(() => {
      mutations = actions
    }, [actions])
    return null
  }
  const host = document.createElement('div')
  const root = createRoot(host)
  try {
    await act(async () => {
      root.render(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>
      )
    })
    await act(async () => {
      await mutations!.publish.mutateAsync(1)
    })
    expect(client.getQueryData(QUERY_KEYS.surveys.detail(1))).toEqual(survey)
    for (const key of [
      QUERY_KEYS.surveys.minePage(1),
      QUERY_KEYS.surveys.exchange,
      QUERY_KEYS.credits.wallet
    ])
      expect(client.getQueryState(key)?.isInvalidated).toBe(true)
  } finally {
    await act(async () => root.unmount())
    client.clear()
  }
})
