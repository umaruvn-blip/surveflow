import { env } from '@/config/env'
import http from '@/libs/http'
import { mockPaymentApi } from '@/mocks/payment.mock'
import type { ApiResponse } from '@/types/api-response.type'
import type {
  AdminPaymentItem,
  BankTransferOrderRequest,
  BankTransferPayment,
  DemoPaymentOutcome,
  PaymentStatus,
  TopupPayment
} from '@/types/payment.type'
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
  },

  // Bank Transfer APIs
  async createBankTransfer(request: BankTransferOrderRequest): Promise<BankTransferPayment> {
    const response = await http.post<ApiResponse<BankTransferPayment>>(
      '/payments/bank-transfer/create',
      request
    )
    return unwrapApiResponse(response.data)
  },
  async getBankTransfer(paymentId: number): Promise<BankTransferPayment> {
    const response = await http.get<ApiResponse<BankTransferPayment>>(
      `/payments/bank-transfer/${paymentId}`
    )
    return unwrapApiResponse(response.data)
  },
  async getBankTransferHistory(): Promise<BankTransferPayment[]> {
    const response = await http.get<ApiResponse<BankTransferPayment[]>>(
      '/payments/bank-transfer/history'
    )
    return unwrapApiResponse(response.data)
  },

  // Admin Payment APIs
  async getAdminPayments(status?: PaymentStatus): Promise<AdminPaymentItem[]> {
    const response = await http.get<ApiResponse<AdminPaymentItem[]>>('/admin/payments', {
      params: status ? { status } : undefined
    })
    return unwrapApiResponse(response.data)
  },
  async approvePayment(paymentId: number): Promise<AdminPaymentItem> {
    const response = await http.post<ApiResponse<AdminPaymentItem>>(
      `/admin/payments/${paymentId}/approve`
    )
    return unwrapApiResponse(response.data)
  },
  async rejectPayment(paymentId: number, reason?: string): Promise<AdminPaymentItem> {
    const response = await http.post<ApiResponse<AdminPaymentItem>>(
      `/admin/payments/${paymentId}/reject`,
      reason ? { reason } : {}
    )
    return unwrapApiResponse(response.data)
  }
}
