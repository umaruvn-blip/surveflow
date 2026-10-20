export type CreditPackage = {
  id: number
  code: string
  name: string
  creditAmount: number
  price: number
  currency: string
}

export type SubscriptionBillingPeriod = 'MONTH' | 'YEAR'

export type SubscriptionPrice = {
  id: number
  billingPeriod: SubscriptionBillingPeriod
  price: number
  currency: string
  validFrom: string
  validUntil: string | null
}

export type EntitlementValueType = 'ENABLED' | 'UNLIMITED' | 'QUOTA' | 'PERCENT'
export type EntitlementResetPeriod = 'NONE' | 'MONTH'

export type PlanEntitlement = {
  code: string
  valueType: EntitlementValueType
  valueAmount: number | null
  resetPeriod: EntitlementResetPeriod
}

export type SubscriptionPlan = {
  id: number
  code: string
  name: string
  description: string | null
  prices: SubscriptionPrice[]
  entitlements: PlanEntitlement[]
}

export type RewardType = 'PLUS_ACCESS' | 'EXTRA_CREDITS' | 'VOUCHER' | 'GIFT'
export type RewardUnit = 'DAY' | 'CREDIT' | 'VND'

export type RewardCatalogItem = {
  id: number
  code: string
  name: string
  rewardType: RewardType
  creditCost: number
  rewardAmount: number | null
  rewardUnit: RewardUnit | null
}
