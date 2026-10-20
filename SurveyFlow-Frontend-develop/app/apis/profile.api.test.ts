import { beforeEach, expect, it, vi } from 'vitest'

const { get, put } = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }))
vi.mock('@/config/env', () => ({ env: { VITE_ENABLE_MOCK: false } }))
vi.mock('@/libs/http', () => ({ default: { get, put } }))

import { profileApi } from '@/apis/profile.api'

beforeEach(() => {
  get.mockReset()
  put.mockReset()
})

it('reads the current profile and unwraps the API envelope', async () => {
  const profile = { userId: 42, displayName: 'An' }
  get.mockResolvedValue({ data: { success: true, data: profile } })
  await expect(profileApi.getProfile()).resolves.toEqual(profile)
  expect(get).toHaveBeenCalledWith('/users/me/profile')
})
it('uses PUT with full profile data including nulls', async () => {
  const payload = {
    displayName: 'An',
    birthYear: null,
    gender: null,
    school: null,
    occupation: 'Student',
    bio: null
  }
  put.mockResolvedValue({ data: { success: true, data: { userId: 42, ...payload } } })
  await profileApi.updateProfile(payload)
  expect(put).toHaveBeenCalledWith('/users/me/profile', payload)
})
it('allows clearing all interests with a separate PUT', async () => {
  put.mockResolvedValue({ data: { success: true, data: { interests: [] } } })
  await expect(profileApi.replaceInterests([])).resolves.toEqual({ interests: [] })
  expect(put).toHaveBeenCalledWith('/users/me/interests', { interestIds: [] })
})
