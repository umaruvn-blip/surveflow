import { describe, expect, it, vi } from 'vitest'

import { MOCK_ACCOUNTS } from '@/mocks/auth.mock'
import { mockProfileApi } from '@/mocks/profile.mock'
import { useAuthStore } from '@/stores/auth-store'

const payload = {
  displayName: 'Hồ sơ demo đã sửa',
  birthYear: null,
  gender: null,
  school: 'Trường demo',
  occupation: null,
  bio: null
}

describe('mock profile', () => {
  it('keeps USER and ADMIN profiles independent and preserves interests when saving details', async () => {
    useAuthStore.getState().setUser(MOCK_ACCOUNTS[0].user)
    await mockProfileApi.replaceInterests([2, 1])
    const saved = await mockProfileApi.updateProfile(payload)
    expect(saved.interests.map((item) => item.id)).toEqual([1, 2])
    expect(sessionStorage.getItem('surveyflow-demo-profile-1')).toContain('Trường demo')
    useAuthStore.getState().setUser(MOCK_ACCOUNTS[1].user)
    const admin = await mockProfileApi.getProfile()
    expect(admin.userId).toBe(2)
    expect(admin.displayName).not.toBe(payload.displayName)
    useAuthStore.getState().setUser(MOCK_ACCOUNTS[0].user)
    expect((await mockProfileApi.getProfile()).displayName).toBe(payload.displayName)
    await mockProfileApi.replaceInterests([])
    expect((await mockProfileApi.getProfile()).interests).toEqual([])
  })
  it('rejects invalid interests without losing the existing selection', async () => {
    useAuthStore.getState().setUser(MOCK_ACCOUNTS[0].user)
    await mockProfileApi.replaceInterests([1])
    await expect(mockProfileApi.replaceInterests([999])).rejects.toThrow()
    expect((await mockProfileApi.getProfile()).interests.map((item) => item.id)).toEqual([1])
  })
  it('retains demo updates after the adapter is reloaded', async () => {
    useAuthStore.getState().setUser(MOCK_ACCOUNTS[0].user)
    await mockProfileApi.updateProfile(payload)
    vi.resetModules()
    const { useAuthStore: freshStore } = await import('@/stores/auth-store')
    freshStore.getState().setUser(MOCK_ACCOUNTS[0].user)
    const { mockProfileApi: freshApi } = await import('@/mocks/profile.mock')
    expect((await freshApi.getProfile()).school).toBe(payload.school)
  })
})
