import { env } from '@/config/env'
import http from '@/libs/http'
import { mockPaymentApi } from '@/mocks/payment.mock'
import type { ApiResponse } from '@/types/api-response.type'
import type { DemoPaymentOutcome, TopupPayment } from '@/types/payment.type'
import { unwrapApiResponse } from '@/utils/api-response'

export const paymentApi = {
  async createTopup(credits: number): Promise<TopupPayment> {
    if (env.VITE_ENABLE_MOCK) return mockPaymentApi.create(credits)
    const response = await http.post<ApiResponse<TopupPayment>>('/payments/topups', { credits })
    return unwrapApiResponse(response.data)
  },
  async get(id: number): Promise<TopupPayment> {
    if (env.VITE_ENABLE_MOCK) return mockPaymentApi.get(id)
    const response = await http.get<ApiResponse<TopupPayment>>(`/payments/${id}`)
    return unwrapApiResponse(response.data)
  },
  async complete(id: number, outcome: DemoPaymentOutcome): Promise<TopupPayment> {
    if (env.VITE_ENABLE_MOCK) return mockPaymentApi.complete(id, outcome)
    const response = await http.post<ApiResponse<TopupPayment>>(`/payments/${id}/demo-result`, {
      outcome
    })
    return unwrapApiResponse(response.data)
  }
}
