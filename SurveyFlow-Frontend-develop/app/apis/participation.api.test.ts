import { expect, it, vi } from 'vitest'
import { participationApi } from '@/apis/participation.api'
import http from '@/libs/http'
vi.mock('@/config/env', () => ({ env: { VITE_ENABLE_MOCK: false } }))
vi.mock('@/libs/http', () => ({ default: { get: vi.fn(), post: vi.fn() } }))
it('reserves a slot and uses its public ID to request a completion code', async () => {
  const participation = { publicId: 'public-6', surveyId: 6 }
  const code = { participationPublicId: 'public-6', completionCode: 'ABCDEFG234' }
  vi.mocked(http.post)
    .mockResolvedValueOnce({ data: { success: true, data: participation } })
    .mockResolvedValueOnce({ data: { success: true, data: code } })
  expect(await participationApi.reserve(6)).toEqual(participation)
  expect(await participationApi.code('public-6')).toEqual(code)
  expect(http.post).toHaveBeenNthCalledWith(1, '/surveys/6/participations')
  expect(http.post).toHaveBeenNthCalledWith(2, '/participations/public-6/verification-code')
})
it('does not hide reservation errors', async () => {
  vi.mocked(http.post).mockRejectedValueOnce(new Error('No slots'))
  await expect(participationApi.reserve(6)).rejects.toThrow('No slots')
})
