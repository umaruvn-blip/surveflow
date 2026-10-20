import { beforeEach, expect, it, vi } from 'vitest'
import http from '@/libs/http'
import { surveyCreatorApi } from '@/apis/survey-creator.api'
import { DEFAULT_SURVEY } from '@/schemas/survey.schema'

vi.mock('@/config/env', () => ({ env: { VITE_ENABLE_MOCK: false } }))
vi.mock('@/libs/http', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))
vi.mock('@/mocks/survey-creator.mock', () => ({ mockSurveyCreatorApi: { save: vi.fn() } }))
beforeEach(() => vi.clearAllMocks())
const response = (data: unknown) => ({
  data: { status: 200, code: 'SUCCESS', success: true, message: '', data }
})
it('sends full draft without implicit publish and uses PUT for updates', async () => {
  vi.mocked(http.post).mockResolvedValue(response({ id: 1 }))
  vi.mocked(http.put).mockResolvedValue(response({ id: 1 }))
  expect(await surveyCreatorApi.save({ payload: DEFAULT_SURVEY })).toEqual({ id: 1 })
  expect(http.post).toHaveBeenCalledExactlyOnceWith('/surveys', DEFAULT_SURVEY)
  await surveyCreatorApi.save({ id: 1, payload: DEFAULT_SURVEY })
  expect(http.put).toHaveBeenCalledExactlyOnceWith('/surveys/1', DEFAULT_SURVEY)
})
it('uses owner detail to read connection and propagates failures without mock fallback', async () => {
  vi.mocked(http.get).mockResolvedValue(
    response({ id: 1, verification: { webhookVerified: true } })
  )
  await surveyCreatorApi.detail(1)
  expect(http.get).toHaveBeenCalledExactlyOnceWith('/surveys/1')
  const error = new Error('Thiếu credit')
  vi.mocked(http.post).mockRejectedValue(error)
  await expect(surveyCreatorApi.publish(1)).rejects.toBe(error)
  expect(http.post).toHaveBeenCalledExactlyOnceWith('/surveys/1/publish', undefined)
})
