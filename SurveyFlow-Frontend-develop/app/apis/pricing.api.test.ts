import { beforeEach, expect, it, vi } from 'vitest'

const { get, mockEnabled } = vi.hoisted(() => ({
  get: vi.fn(),
  mockEnabled: { value: false }
}))

vi.mock('@/config/env', () => ({
  env: {
    get VITE_ENABLE_MOCK() {
      return mockEnabled.value
    }
  }
}))
vi.mock('@/libs/http', () => ({ default: { get } }))

import { pricingApi } from '@/apis/pricing.api'
import {
  MOCK_CREDIT_PACKAGES,
  MOCK_REWARD_CATALOG,
  MOCK_SUBSCRIPTION_PLANS
} from '@/mocks/pricing.mock'

beforeEach(() => {
  get.mockReset()
  mockEnabled.value = false
})

it('reads and unwraps every pricing catalog endpoint in API mode', async () => {
  get.mockImplementation(async (path: string) => ({
    data: { success: true, data: [{ code: path }] }
  }))

  await expect(pricingApi.getCreditPackages()).resolves.toEqual([
    { code: '/pricing/credit-packages' }
  ])
  await expect(pricingApi.getSubscriptionPlans()).resolves.toEqual([
    { code: '/pricing/subscription-plans' }
  ])
  await expect(pricingApi.getRewards()).resolves.toEqual([{ code: '/pricing/rewards' }])
  expect(get).toHaveBeenCalledTimes(3)
})

it('uses matching catalog data in mock mode without network calls', async () => {
  mockEnabled.value = true

  await expect(pricingApi.getCreditPackages()).resolves.toEqual(MOCK_CREDIT_PACKAGES)
  await expect(pricingApi.getSubscriptionPlans()).resolves.toEqual(MOCK_SUBSCRIPTION_PLANS)
  await expect(pricingApi.getRewards()).resolves.toEqual(MOCK_REWARD_CATALOG)
  expect(get).not.toHaveBeenCalled()
})
