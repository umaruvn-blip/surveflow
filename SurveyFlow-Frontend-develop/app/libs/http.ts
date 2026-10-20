import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { LOGIN_URL, LOGOUT_URL, REGISTER_URL, REFRESH_TOKEN_URL } from '@/constants/auth'
import { queryClient } from '@/libs/query-client'
import { authResponseSchema } from '@/schemas/auth-response-schema'
import { useAuthStore } from '@/stores/auth-store'
import type { ApiResponse, AuthResponse, ErrorResponse } from '@/types'
import { unwrapApiResponse } from '@/utils/api-response'
import { getCurrentLocale } from '@/utils/locale'

const options = { baseURL: env.VITE_API_BASE_URL, timeout: 30000, withCredentials: true }
/* Dùng client riêng để lỗi refresh không tạo vòng lặp refresh. */
const refreshTransport = axios.create({ ...options, timeout: 8000 })
const http = axios.create(options)
/* Các request đồng thời dùng chung một lần refresh. */
let refreshRequest: Promise<AuthResponse> | null = null

export function refreshSession(): Promise<AuthResponse> {
  if (refreshRequest) return refreshRequest
  const revision = useAuthStore.getState().sessionRevision
  refreshRequest = refreshTransport
    .post<ApiResponse<AuthResponse>>(
      REFRESH_TOKEN_URL,
      {},
      {
        headers: { 'Accept-Language': getCurrentLocale() }
      }
    )
    .then(({ data }) => {
      const session = authResponseSchema.parse(unwrapApiResponse(data))
      if (!session.accessToken || !session.user) throw new Error('Phiên đăng nhập không hợp lệ.')
      /* Bỏ kết quả refresh nếu đã logout hoặc đổi tài khoản. */
      if (useAuthStore.getState().sessionRevision !== revision) {
        throw new Error('Phiên đăng nhập đã thay đổi.')
      }
      useAuthStore.getState().setSession(session)
      return session
    })
    .catch((error: unknown) => {
      /* Chỉ xóa phiên bị từ chối; lỗi mạng tạm thời vẫn giữ phiên. */
      if (
        axios.isAxiosError(error) &&
        [401, 403].includes(error.response?.status ?? 0) &&
        useAuthStore.getState().sessionRevision === revision
      ) {
        useAuthStore.getState().logout()
        queryClient.clear()
      }
      throw error
    })
    .finally(() => {
      refreshRequest = null
    })
  return refreshRequest
}

type SessionRequest = InternalAxiosRequestConfig & {
  sessionRetried?: boolean
  sessionRevision?: number
}
const authEndpoints = new Set([LOGIN_URL, REGISTER_URL, LOGOUT_URL, REFRESH_TOKEN_URL])
http.interceptors.request.use((config: SessionRequest) => {
  const state = useAuthStore.getState()
  config.sessionRevision ??= state.sessionRevision
  config.headers.set('Accept-Language', getCurrentLocale())
  if (!authEndpoints.has(config.url ?? '') && state.accessToken) {
    config.headers.set('Authorization', `Bearer ${state.accessToken.replace(/^Bearer /, '')}`)
  } else {
    config.headers.delete('Authorization')
  }
  return config
})
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const config = error.config as SessionRequest | undefined
    if (error.response?.status !== 401 || !config || authEndpoints.has(config.url ?? '')) {
      throw error
    }
    const state = useAuthStore.getState()
    if (config.sessionRevision !== state.sessionRevision || !state.accessToken) throw error
    /* Chỉ retry một lần để tránh lặp khi token mới vẫn bị từ chối. */
    if (config.sessionRetried) {
      state.logout()
      queryClient.clear()
      throw error
    }
    config.sessionRetried = true
    /* Nếu 401 đến muộn với token cũ, dùng token mới thay vì refresh tiếp. */
    const currentHeader = `Bearer ${state.accessToken.replace(/^Bearer /, '')}`
    if (config.headers.get('Authorization') === currentHeader) await refreshSession()
    if (config.sessionRevision !== useAuthStore.getState().sessionRevision) throw error
    return http(config)
  }
)

export default http
