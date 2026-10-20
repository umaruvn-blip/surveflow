import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { refreshPost } = vi.hoisted(() => ({ refreshPost: vi.fn() }))
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  const originalCreate = actual.default.create.bind(actual.default)
  let count = 0
  return {
    ...actual,
    default: {
      ...actual.default,
      create: (...args: Parameters<typeof originalCreate>) => {
        const instance = originalCreate(...args)
        if (count++ === 0) instance.post = refreshPost
        return instance
      }
    }
  }
})

import http, { refreshSession } from '@/libs/http'
import { useAuthStore } from '@/stores/auth-store'

const session = {
  accessToken: 'new-token',
  user: { id: 1, email: 'demo@example.test', status: 'ACTIVE', roles: ['USER'] }
}
const ok = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({
  config,
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders()
})
const unauthorized = (config: InternalAxiosRequestConfig) =>
  Promise.reject(
    new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
      ...ok(config, {}),
      status: 401
    })
  )

beforeEach(() => {
  useAuthStore.getState().logout()
  useAuthStore.getState().setSession({ ...session, accessToken: 'old-token' })
  refreshPost.mockReset()
})

describe('session transport', () => {
  it('deduplicates refresh and retries concurrent 401s with the new token', async () => {
    const refresh = refreshPost.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return { data: { success: true, data: session } }
    })
    http.defaults.adapter = async (config) =>
      config.headers.get('Authorization') === 'Bearer old-token'
        ? unauthorized(config)
        : ok(config, config.headers.get('Authorization'))
    const results = await Promise.all([http.get('/one'), http.get('/two')])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(results.map((result) => result.data)).toEqual(['Bearer new-token', 'Bearer new-token'])
    expect(useAuthStore.getState().user).toEqual(session.user)
  })

  it('does not refresh login failures', async () => {
    const refresh = refreshPost
    http.defaults.adapter = unauthorized
    await expect(http.request({ method: 'post', url: '/auth/login' })).rejects.toThrow()
    expect(refresh).not.toHaveBeenCalled()
    expect(useAuthStore.getState().accessToken).toBe('old-token')
  })

  it('stops after a single retry and clears the session', async () => {
    const refresh = refreshPost.mockResolvedValue({ data: { success: true, data: session } })
    http.defaults.adapter = unauthorized
    await expect(http.get('/private')).rejects.toThrow()
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('does not restore a session after logout during refresh', async () => {
    let resolve: (value: unknown) => void = () => {}
    refreshPost.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done
        })
    )
    const request = refreshSession()
    useAuthStore.getState().logout()
    resolve({ data: { success: true, data: session } })
    await expect(request).rejects.toThrow('Phiên đăng nhập đã thay đổi.')
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('retains the session on temporary network failures and allows a later refresh', async () => {
    const refresh = refreshPost
      .mockRejectedValueOnce(new AxiosError('Network Error'))
      .mockResolvedValueOnce({ data: { success: true, data: session } })
    await expect(refreshSession()).rejects.toThrow()
    expect(useAuthStore.getState().accessToken).toBe('old-token')
    await expect(refreshSession()).resolves.toEqual(session)
    expect(refresh).toHaveBeenCalledTimes(2)
  })
})
