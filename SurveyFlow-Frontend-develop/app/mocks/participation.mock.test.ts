import { afterEach, expect, it, vi } from 'vitest'
import { mockParticipationApi } from '@/mocks/participation.mock'
vi.mock('@/stores/auth-store', () => ({ useAuthStore: { getState: () => ({ user: { id: 1 } }) } }))
vi.mock('@/mocks/survey-discovery.mock', () => ({
  mockSurveyDiscoveryApi: {
    detail: async () => ({
      creatorId: 2,
      status: 'PUBLISHED',
      availableSlots: 10,
      deadline: null,
      rewardCredit: 10,
      externalFormUrl: null,
      slotTtlSeconds: 1800,
      verification: { minCompletionSeconds: 120 }
    })
  }
}))
afterEach(() => vi.useRealTimers())
it('requires the waiting period and refuses codes after expiry', async () => {
  vi.useFakeTimers()
  const participation = await mockParticipationApi.reserve(900)
  await expect(mockParticipationApi.code(participation.publicId)).rejects.toThrow('Chưa thể')
  vi.advanceTimersByTime(120000)
  expect((await mockParticipationApi.code(participation.publicId)).participationPublicId).toBe(
    participation.publicId
  )
  vi.advanceTimersByTime(1800000)
  expect((await mockParticipationApi.detail(participation.publicId)).status).toBe('EXPIRED')
  await expect(mockParticipationApi.code(participation.publicId)).rejects.toThrow('Chưa thể')
})
