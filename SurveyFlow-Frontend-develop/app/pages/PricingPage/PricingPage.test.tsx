import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'

import { QUERY_KEYS } from '@/constants/query-keys'
import { MOCK_CREDIT_PACKAGES, MOCK_SUBSCRIPTION_PLANS } from '@/mocks/pricing.mock'
import { PricingPage } from '@/pages/PricingPage'

vi.mock('@/config/env', () => ({ env: { VITE_ENABLE_MOCK: true } }))

function renderPage(
  plans?: typeof MOCK_SUBSCRIPTION_PLANS,
  packages?: typeof MOCK_CREDIT_PACKAGES
) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } }
  })
  if (plans) client.setQueryData(QUERY_KEYS.pricing.subscriptionPlans, plans)
  if (packages) client.setQueryData(QUERY_KEYS.pricing.creditPackages, packages)

  const markup = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
  client.clear()
  return markup
}

it('shows catalog values from the pricing queries without enabling checkout', () => {
  const html = renderPage(MOCK_SUBSCRIPTION_PLANS, MOCK_CREDIT_PACKAGES)

  expect(html).toContain('SurveyFlow Plus')
  expect(html).toContain('39.000')
  expect(html).toContain('500 Credits mỗi tháng')
  expect(html).toContain('2 lượt ưu tiên khảo sát mỗi tháng')
  expect(html).toContain('1.300 Credits')
  expect(html).toContain('99.000')
  expect(html).toContain('Thanh toán sắp mở')
  expect(html).toMatch(/<button[^>]*disabled/)
})

it('shows loading and empty catalog states', () => {
  expect(renderPage()).toContain('Đang tải gói SurveyFlow Plus')
  expect(renderPage([], [])).toContain('Hiện chưa có gói đăng ký đang mở bán.')
  expect(renderPage([], [])).toContain('Hiện chưa có gói Credits đang mở bán.')
})
