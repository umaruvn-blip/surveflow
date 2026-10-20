import { env } from '@/config/env'
import { PRICING_ENDPOINTS } from '@/constants/pricing'
import http from '@/libs/http'
import { mockPricingApi } from '@/mocks/pricing.mock'
import type { ApiResponse } from '@/types/api-response.type'
import type { CreditPackage, RewardCatalogItem, SubscriptionPlan } from '@/types/pricing.type'
import { unwrapApiResponse } from '@/utils/api-response'

export const pricingApi = {
  async getCreditPackages(): Promise<CreditPackage[]> {
    if (env.VITE_ENABLE_MOCK) return mockPricingApi.getCreditPackages()
    const response = await http.get<ApiResponse<CreditPackage[]>>(PRICING_ENDPOINTS.creditPackages)
    return unwrapApiResponse(response.data)
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (env.VITE_ENABLE_MOCK) return mockPricingApi.getSubscriptionPlans()
    const response = await http.get<ApiResponse<SubscriptionPlan[]>>(
      PRICING_ENDPOINTS.subscriptionPlans
    )
    return unwrapApiResponse(response.data)
  },

  async getRewards(): Promise<RewardCatalogItem[]> {
    if (env.VITE_ENABLE_MOCK) return mockPricingApi.getRewards()
    const response = await http.get<ApiResponse<RewardCatalogItem[]>>(PRICING_ENDPOINTS.rewards)
    return unwrapApiResponse(response.data)
  }
}
