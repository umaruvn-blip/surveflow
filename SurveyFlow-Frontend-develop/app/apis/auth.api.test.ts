import { beforeEach, expect, it, vi } from 'vitest'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@/config/env', () => ({ env: { VITE_ENABLE_MOCK: false } }))
vi.mock('@/libs/http', () => ({ default: { post }, refreshSession: vi.fn() }))

import { authApi } from '@/apis/auth.api'

beforeEach(() => {
  post.mockReset()
})

it('projects registration form into backend DTO without persisting password', async () => {
  post.mockResolvedValue({
    data: {
      success: true,
      data: {
        accessToken: 'demo-token',
        user: { id: 1, email: 'demo@example.test', status: 'ACTIVE', roles: ['USER'] }
      }
    }
  })
  const result = await authApi.register({
    accountType: 'STUDENT',
    email: 'demo@example.test',
    fullName: 'Demo',
    password: 'Example123',
    confirmPassword: 'Example123',
    university: 'Demo University'
  })
  expect(post).toHaveBeenCalledWith('/auth/register', {
    email: 'demo@example.test',
    password: 'Example123',
    displayName: 'Demo'
  })
  expect(result.user).not.toHaveProperty('password')
})

it('starts Google linking on the correct endpoint', async () => {
  post.mockResolvedValue({
    data: {
      success: true,
      data: { authorizationPath: '/api/v1/auth/oauth2/google/link?ticket=demo' }
    }
  })
  await expect(authApi.startGoogleLink()).resolves.toContain('/api/v1/auth/oauth2/google/link')
  expect(post).toHaveBeenCalledWith('/auth/oauth2/google/link', {})
})
