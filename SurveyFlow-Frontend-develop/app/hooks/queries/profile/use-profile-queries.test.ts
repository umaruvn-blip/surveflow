import { QueryClient } from '@tanstack/react-query'
import { beforeEach, expect, it, vi } from 'vitest'

const { capture } = vi.hoisted(() => ({ capture: vi.fn() }))
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return { ...actual, useQueryClient: () => client, useMutation: capture }
})
vi.mock('@/stores/auth-store', () => ({ useAuthStore: () => 42 }))
vi.mock('@/apis/profile.api', () => ({
  profileApi: { updateProfile: vi.fn(), replaceInterests: vi.fn() }
}))
vi.mock('@/utils/notify', () => ({ notify: { success: vi.fn() } }))

import { QUERY_KEYS } from '@/constants/query-keys'
import {
  useReplaceInterestsMutation,
  useUpdateProfileMutation
} from '@/hooks/queries/profile/use-profile-queries'
import type { InterestsResponse, UserProfile } from '@/types/profile.type'

const client = new QueryClient()
const profile: UserProfile = {
  userId: 42,
  email: 'demo@example.test',
  referralCode: 'DEMO000016',
  avatarUrl: null,
  displayName: 'An',
  birthYear: null,
  gender: null,
  school: null,
  occupation: null,
  bio: null,
  interests: []
}

beforeEach(() => {
  client.clear()
  capture.mockClear()
  client.setQueryData(QUERY_KEYS.users.profile(42), profile)
  client.setQueryData(QUERY_KEYS.users.profile(99), { ...profile, userId: 99 })
  client.setQueryData(QUERY_KEYS.surveys.exchange, [])
})

it('updates only the current profile and invalidates survey suggestions', () => {
  useUpdateProfileMutation()
  const options = capture.mock.calls[0][0] as { onSuccess: (value: UserProfile) => void }
  options.onSuccess({ ...profile, displayName: 'Bình' })
  expect(client.getQueryData(QUERY_KEYS.users.profile(42))).toEqual({
    ...profile,
    displayName: 'Bình'
  })
  expect(client.getQueryData(QUERY_KEYS.users.profile(99))).toEqual({ ...profile, userId: 99 })
  expect(client.getQueryState(QUERY_KEYS.surveys.exchange)?.isInvalidated).toBe(true)
})

it('replaces interests while preserving profile fields', () => {
  useReplaceInterestsMutation()
  const options = capture.mock.calls[0][0] as { onSuccess: (value: InterestsResponse) => void }
  const interests = [{ id: 1, name: 'Công nghệ', slug: 'technology', active: true }]
  options.onSuccess({ interests })
  expect(client.getQueryData(QUERY_KEYS.users.profile(42))).toEqual({ ...profile, interests })
  options.onSuccess({ interests: [] })
  expect(client.getQueryData(QUERY_KEYS.users.profile(42))).toEqual(profile)
  expect(client.getQueryState(QUERY_KEYS.surveys.exchange)?.isInvalidated).toBe(true)
})
