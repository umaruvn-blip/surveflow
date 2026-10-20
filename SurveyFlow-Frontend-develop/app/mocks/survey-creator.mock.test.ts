import { describe, expect, it } from 'vitest'
import { mockSurveyCreatorApi as api } from '@/mocks/survey-creator.mock'
import { mockCreditApi } from '@/mocks/credit.mock'
import { useAuthStore } from '@/stores/auth-store'
import { MOCK_ACCOUNTS } from '@/mocks/auth.mock'
import { DEFAULT_SURVEY } from '@/schemas/survey.schema'

const payload = () => ({
  ...structuredClone(DEFAULT_SURVEY),
  title: 'Khảo sát thật',
  rewardCredit: 1,
  targetResponseCount: 2,
  externalFormUrl: 'https://docs.google.com/forms/d/e/test-form/viewform'
})
describe('creator mock lifecycle', () => {
  it('creates draft, requires verified webhook, reserves once, forbids editing published, closes and refunds once', async () => {
    const snapshot = await mockCreditApi.getWallet()
    const balance = snapshot.spendableBalance
    const survey = await api.save({ payload: payload() })
    expect(survey.status).toBe('DRAFT')
    await expect(api.publish(survey.id)).rejects.toThrow('kết nối')
    await api.configure(survey.id)
    await api.verify(survey.id)
    expect((await api.publish(survey.id)).status).toBe('PUBLISHED')
    expect((await mockCreditApi.getWallet()).spendableBalance).toBe(balance - 2)
    expect(snapshot.spendableBalance).toBe(balance)
    await expect(api.publish(survey.id)).rejects.toThrow('bản nháp')
    await expect(api.save({ id: survey.id, payload: payload() })).rejects.toThrow('bản nháp')
    expect((await api.close(survey.id)).status).toBe('CLOSED')
    expect((await mockCreditApi.getWallet()).spendableBalance).toBe(balance)
    await expect(api.close(survey.id)).rejects.toThrow('đang mở')
  })
  it('rotating token and changing form clears verified state, insufficient credit preserves draft', async () => {
    const survey = await api.save({ payload: payload() })
    await api.verify(survey.id)
    await api.configure(survey.id)
    expect((await api.detail(survey.id)).verification.webhookVerified).toBe(false)
    await api.verify(survey.id)
    const modified = await api.save({
      id: survey.id,
      payload: {
        ...payload(),
        externalFormUrl: 'https://docs.google.com/forms/d/e/new-form/viewform',
        rewardCredit: 10000
      }
    })
    expect(modified.verification.webhookVerified).toBe(false)
    await api.verify(survey.id)
    await expect(api.publish(survey.id)).rejects.toThrow('không đủ')
    expect((await api.detail(survey.id)).status).toBe('DRAFT')
  })
  it('returns snapshots so local changes cannot modify saved state', async () => {
    const survey = await api.save({ payload: payload() })
    survey.title = 'Changed locally'
    expect((await api.detail(survey.id)).title).toBe('Khảo sát thật')
  })
})

it('isolates owner drafts between USER and ADMIN accounts', async () => {
  try {
    useAuthStore.getState().setUser(MOCK_ACCOUNTS[0].user)
    const draft = await api.save({ payload: payload() })
    useAuthStore.getState().setUser(MOCK_ACCOUNTS[1].user)
    await expect(api.detail(draft.id)).rejects.toThrow('Không tìm thấy')
    await expect(api.save({ id: draft.id, payload: payload() })).rejects.toThrow('Không tìm thấy')
    expect((await api.mine()).items.some((item) => item.id === draft.id)).toBe(false)
  } finally {
    useAuthStore.getState().setUser(null)
  }
})
it('concurrent publish calls hold budget exactly once', async () => {
  const balance = (await mockCreditApi.getWallet()).spendableBalance
  const draft = await api.save({ payload: payload() })
  await api.verify(draft.id)
  const results = await Promise.allSettled([api.publish(draft.id), api.publish(draft.id)])
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
  expect((await mockCreditApi.getWallet()).spendableBalance).toBe(balance - 2)
  await api.close(draft.id)
  expect((await mockCreditApi.getWallet()).spendableBalance).toBe(balance)
})
