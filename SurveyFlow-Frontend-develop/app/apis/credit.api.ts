import { unwrapApiResponse } from '@/utils/api-response'
import { env } from '@/config/env'
import http from '@/libs/http'
import { mockCreditApi } from '@/mocks/credit.mock'
import type { ApiResponse } from '@/types'
import type {
  CreditTransaction,
  CreditWallet,
  RedeemReward,
  SurveyBudget,
  WithdrawalRequest
} from '@/types/credit.type'

const CREDIT_ENDPOINTS = {
  transactions: '/credits/transactions',
  wallet: '/credits/wallet'
} as const

export const creditApi = {
  async getTransactions(): Promise<CreditTransaction[]> {
    if (env.VITE_ENABLE_MOCK) return mockCreditApi.getTransactions()
    const response = await http.get<ApiResponse<CreditTransaction[]>>(CREDIT_ENDPOINTS.transactions)
    return unwrapApiResponse(response.data)
  },
  async getWallet(): Promise<CreditWallet> {
    if (env.VITE_ENABLE_MOCK) return mockCreditApi.getWallet()
    const response = await http.get<ApiResponse<CreditWallet>>(CREDIT_ENDPOINTS.wallet)
    return unwrapApiResponse(response.data)
  },
  async getSurveyBudget(surveyId: number): Promise<SurveyBudget> {
    const response = await http.get<ApiResponse<SurveyBudget>>(
      `/credits/surveys/${surveyId}/budget`
    )
    return unwrapApiResponse(response.data)
  },
  async grantParticipationReward(participationId: number): Promise<CreditWallet> {
    if (env.VITE_ENABLE_MOCK) return mockCreditApi.grantParticipationReward()
    const response = await http.post<ApiResponse<CreditWallet>>(
      `/credits/participations/${participationId}/grant-reward`
    )
    return unwrapApiResponse(response.data)
  },
  async releaseSurveyBudget(surveyId: number): Promise<SurveyBudget> {
    if (env.VITE_ENABLE_MOCK) return mockCreditApi.releaseSurveyBudget(surveyId)
    const response = await http.post<ApiResponse<SurveyBudget>>(
      `/credits/surveys/${surveyId}/release`
    )
    return unwrapApiResponse(response.data)
  },
  async reserveSurveyBudget(surveyId: number): Promise<SurveyBudget> {
    if (env.VITE_ENABLE_MOCK) return mockCreditApi.reserveSurveyBudget(surveyId)
    const response = await http.post<ApiResponse<SurveyBudget>>(
      `/credits/surveys/${surveyId}/reserve`
    )
    return unwrapApiResponse(response.data)
  },
  async redeemReward(reward: RedeemReward): Promise<CreditWallet> {
    if (env.VITE_ENABLE_MOCK) return mockCreditApi.redeemReward(reward)
    throw new Error(
      'Backend chưa hỗ trợ đổi thưởng Credits. Vui lòng bật mock khi phát triển local.'
    )
  },
  async requestWithdrawal(request: WithdrawalRequest): Promise<CreditWallet> {
    if (env.VITE_ENABLE_MOCK) return mockCreditApi.requestWithdrawal(request)
    throw new Error('Backend chưa hỗ trợ yêu cầu rút tiền. Vui lòng bật mock khi phát triển local.')
  }
}
