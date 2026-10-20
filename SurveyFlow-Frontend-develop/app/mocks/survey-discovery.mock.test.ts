import { afterEach, beforeEach, expect, it } from 'vitest'
import { MOCK_ACCOUNTS } from '@/mocks/auth.mock'
import { mockSurveyCreatorApi as creator } from '@/mocks/survey-creator.mock'
import { mockSurveyDiscoveryApi as discovery } from '@/mocks/survey-discovery.mock'
import { DEFAULT_SURVEY } from '@/schemas/survey.schema'
import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => useAuthStore.getState().setUser(MOCK_ACCOUNTS[0].user))
afterEach(() => useAuthStore.getState().setUser(null))
it('paginates snapshots and sorts highest reward first', async () => {
  const first = await discovery.list({ page: 1, sort: 'reward' })
  const second = await discovery.list({ page: 2, sort: 'reward' })
  expect(first.items).toHaveLength(12)
  expect(second.items).toHaveLength(3)
  expect(first.items[0].rewardCredit).toBeGreaterThanOrEqual(first.items[1].rewardCredit)
  const detail = await discovery.detail(first.items[0].id)
  detail.title = 'Modified locally'
  expect((await discovery.detail(first.items[0].id)).title).not.toBe('Modified locally')
})
it('shares creator published surveys while protecting drafts and closed surveys', async () => {
  const draft = await creator.save({
    payload: {
      ...structuredClone(DEFAULT_SURVEY),
      title: 'Khảo sát Creator',
      externalFormUrl: 'https://docs.google.com/forms/d/e/demo/viewform',
      rewardCredit: 1,
      targetResponseCount: 2
    }
  })
  useAuthStore.getState().setUser(MOCK_ACCOUNTS[1].user)
  await expect(discovery.detail(draft.id)).rejects.toThrow('không tồn tại')
  useAuthStore.getState().setUser(MOCK_ACCOUNTS[0].user)
  await creator.verify(draft.id)
  await creator.publish(draft.id)
  expect(
    (await discovery.list({ page: 1, sort: 'newest' })).items.some((item) => item.id === draft.id)
  ).toBe(false)
  useAuthStore.getState().setUser(MOCK_ACCOUNTS[1].user)
  expect(
    (await discovery.list({ page: 1, sort: 'newest' })).items.some((item) => item.id === draft.id)
  ).toBe(true)
  expect((await discovery.detail(draft.id)).title).toBe('Khảo sát Creator')
  useAuthStore.getState().setUser(MOCK_ACCOUNTS[0].user)
  await creator.close(draft.id)
  useAuthStore.getState().setUser(MOCK_ACCOUNTS[1].user)
  await expect(discovery.detail(draft.id)).rejects.toThrow('không tồn tại')
})
it('returns top recommendations with match scores', async () => {
  const recommendations = await discovery.recommendations(3)
  expect(recommendations).toHaveLength(3)
  expect(recommendations[0].matchScore).toBeGreaterThan(0)
  expect(recommendations[0].status).toBe('PUBLISHED')
})
