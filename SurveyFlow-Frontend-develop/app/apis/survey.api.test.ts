import { beforeEach, expect, it, vi } from 'vitest'
import { surveyApi } from '@/apis/survey.api'
import http from '@/libs/http'

vi.mock('@/config/env', () => ({ env: { VITE_ENABLE_MOCK: false } }))
vi.mock('@/libs/http', () => ({ default: { get: vi.fn(), post: vi.fn() } }))
vi.mock('@/mocks/survey-discovery.mock', () => ({
  mockSurveyDiscoveryApi: { list: vi.fn(), detail: vi.fn() }
}))
beforeEach(() => vi.clearAllMocks())
const envelope = (data: unknown) => ({
  data: { success: true, status: 200, code: 'SUCCESS', message: '', data }
})
it('fetches one summary page with sorting without N+1 detail requests', async () => {
  const page = {
    items: [{ id: 1 }, { id: 2 }],
    page: 2,
    size: 12,
    totalElements: 14,
    totalPages: 2
  }
  vi.mocked(http.get).mockResolvedValue(envelope(page))
  expect(await surveyApi.list({ page: 2, sort: 'reward' })).toEqual(page)
  expect(http.get).toHaveBeenCalledExactlyOnceWith('/surveys', {
    params: { page: 2, size: 12, sortBy: 'rewardCredit', sortDir: 'DESC' }
  })
  expect(http.post).not.toHaveBeenCalled()
})
it('reads detail without starting a participation', async () => {
  vi.mocked(http.get).mockResolvedValue(envelope({ id: 12, title: 'Chi tiết' }))
  expect(await surveyApi.detail(12)).toEqual({ id: 12, title: 'Chi tiết' })
  expect(http.get).toHaveBeenCalledExactlyOnceWith('/surveys/12')
  expect(http.post).not.toHaveBeenCalled()
})
it('propagates real API errors', async () => {
  const error = new Error('Không có quyền xem')
  vi.mocked(http.get).mockRejectedValue(error)
  await expect(surveyApi.detail(1)).rejects.toBe(error)
})
