import type { CreditPackage, RewardCatalogItem, SubscriptionPlan } from '@/types/pricing.type'

export const MOCK_CREDIT_PACKAGES: CreditPackage[] = [
  { id: 1, code: 'STARTER', name: 'Starter', creditAmount: 200, price: 19000, currency: 'VND' },
  { id: 2, code: 'STANDARD', name: 'Standard', creditAmount: 600, price: 49000, currency: 'VND' },
  { id: 3, code: 'PRO', name: 'Pro', creditAmount: 1300, price: 99000, currency: 'VND' }
]

export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 4,
    code: 'PLUS',
    name: 'SurveyFlow Plus',
    description: 'Gói SurveyFlow Plus hằng tháng.',
    prices: [
      {
        id: 1,
        billingPeriod: 'MONTH',
        price: 39000,
        currency: 'VND',
        validFrom: '2026-10-03T00:00:00Z',
        validUntil: null
      }
    ],
    entitlements: [
      { code: 'MONTHLY_CREDITS', valueType: 'QUOTA', valueAmount: 500, resetPeriod: 'MONTH' },
      {
        code: 'AI_AUDIENCE_MATCHING',
        valueType: 'UNLIMITED',
        valueAmount: null,
        resetPeriod: 'NONE'
      },
      { code: 'AI_QUALITY_CHECK', valueType: 'UNLIMITED', valueAmount: null, resetPeriod: 'NONE' },
      { code: 'PRIORITY_BOOST', valueType: 'QUOTA', valueAmount: 2, resetPeriod: 'MONTH' },
      { code: 'ADVANCED_DASHBOARD', valueType: 'ENABLED', valueAmount: null, resetPeriod: 'NONE' },
      { code: 'AI_INSIGHT_EXPORT', valueType: 'ENABLED', valueAmount: null, resetPeriod: 'NONE' },
      { code: 'EXTRA_CREDIT_DISCOUNT', valueType: 'PERCENT', valueAmount: 20, resetPeriod: 'NONE' }
    ]
  }
]

export const MOCK_REWARD_CATALOG: RewardCatalogItem[] = [
  {
    id: 1,
    code: 'PLUS_7_DAYS',
    name: '1 tuần SurveyFlow Plus',
    rewardType: 'PLUS_ACCESS',
    creditCost: 300,
    rewardAmount: 7,
    rewardUnit: 'DAY'
  },
  {
    id: 2,
    code: 'EXTRA_CREDITS_100',
    name: '100 Extra Credits',
    rewardType: 'EXTRA_CREDITS',
    creditCost: 500,
    rewardAmount: 100,
    rewardUnit: 'CREDIT'
  },
  {
    id: 3,
    code: 'VOUCHER_10000',
    name: 'Voucher 10.000 VNĐ',
    rewardType: 'VOUCHER',
    creditCost: 1000,
    rewardAmount: 10000,
    rewardUnit: 'VND'
  },
  {
    id: 4,
    code: 'VOUCHER_50000',
    name: 'Voucher 50.000 VNĐ',
    rewardType: 'VOUCHER',
    creditCost: 5000,
    rewardAmount: 50000,
    rewardUnit: 'VND'
  },
  {
    id: 5,
    code: 'VOUCHER_100000',
    name: 'Voucher 100.000 VNĐ',
    rewardType: 'VOUCHER',
    creditCost: 10000,
    rewardAmount: 100000,
    rewardUnit: 'VND'
  }
]

export const mockPricingApi = {
  async getCreditPackages(): Promise<CreditPackage[]> {
    return MOCK_CREDIT_PACKAGES
  },
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return MOCK_SUBSCRIPTION_PLANS
  },
  async getRewards(): Promise<RewardCatalogItem[]> {
    return MOCK_REWARD_CATALOG
  }
}
