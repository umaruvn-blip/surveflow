import { useQuery } from '@tanstack/react-query'

import { pricingApi } from '@/apis/pricing.api'
import { QUERY_KEYS } from '@/constants/query-keys'

const PRICING_STALE_TIME = 5 * 60 * 1000

export function useCreditPackagesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.pricing.creditPackages,
    queryFn: pricingApi.getCreditPackages,
    staleTime: PRICING_STALE_TIME
  })
}

export function useSubscriptionPlansQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.pricing.subscriptionPlans,
    queryFn: pricingApi.getSubscriptionPlans,
    staleTime: PRICING_STALE_TIME
  })
}

export function useRewardCatalogQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.pricing.rewards,
    queryFn: pricingApi.getRewards,
    staleTime: PRICING_STALE_TIME
  })
}
