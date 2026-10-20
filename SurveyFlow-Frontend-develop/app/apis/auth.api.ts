import { unwrapApiResponse } from '@/utils/api-response'
import { REGISTER_URL, GOOGLE_LINK_URL, LOGIN_URL, LOGOUT_URL } from '@/constants/auth'
import { authResponseSchema } from '@/schemas/auth-response-schema'
import { env } from '@/config/env'
import http, { refreshSession } from '@/libs/http'
import { mockAuthApi } from '@/mocks/auth.mock'
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types'

const AUTH_ENDPOINTS = {
  login: LOGIN_URL,
  logout: LOGOUT_URL
} as const

export const authApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    if (env.VITE_ENABLE_MOCK) return mockAuthApi.register(payload)
    /* Chỉ gửi trường backend hỗ trợ; confirmPassword dùng để kiểm tra ở form. */
    const response = await http.post<ApiResponse<AuthResponse>>(REGISTER_URL, {
      displayName: payload.fullName,
      email: payload.email,
      password: payload.password,
      ...(payload.referralCode?.trim() ? { referralCode: payload.referralCode.trim() } : {})
    })
    return authResponseSchema.parse(unwrapApiResponse(response.data))
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    if (env.VITE_ENABLE_MOCK) {
      return mockAuthApi.login(payload)
    }

    const response = await http.post<ApiResponse<AuthResponse>>(AUTH_ENDPOINTS.login, payload)
    return authResponseSchema.parse(unwrapApiResponse(response.data))
  },

  async logout(): Promise<void> {
    if (env.VITE_ENABLE_MOCK) {
      return mockAuthApi.logout()
    }

    const response = await http.post<ApiResponse<null>>(AUTH_ENDPOINTS.logout, {})
    unwrapApiResponse(response.data)
  },

  async completeOAuthLogin(): Promise<AuthResponse> {
    return refreshSession()
  },

  async startGoogleLink(): Promise<string> {
    const response = await http.post<ApiResponse<{ authorizationPath: string }>>(
      GOOGLE_LINK_URL,
      {}
    )
    return unwrapApiResponse(response.data).authorizationPath
  }
}
