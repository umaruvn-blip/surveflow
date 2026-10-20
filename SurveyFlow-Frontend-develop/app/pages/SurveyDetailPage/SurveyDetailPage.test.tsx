import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it, vi } from 'vitest'

import { QUERY_KEYS } from '@/constants/query-keys'
import { DISCOVERY_FIXTURES } from '@/mocks/survey-discovery.mock'
import type { SurveyDetail } from '@/types/survey-management.type'
import { SurveyDetailPage } from '@/pages/SurveyDetailPage'

vi.mock('@/config/env', () => ({ env: { VITE_ENABLE_MOCK: true } }))
function renderPage(url: string, withData = false, overrides: Partial<SurveyDetail> = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } }
  })
  if (withData)
    client.setQueryData(QUERY_KEYS.surveys.detail(3), { ...DISCOVERY_FIXTURES[2], ...overrides })
  const markup = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path='/exchange/:surveyId' element={<SurveyDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  client.clear()
  return markup
}
it('shows research, sensitive data notice and keeps page/sort in back link', () => {
  const html = renderPage('/exchange/3?page=2&sort=reward', true)
  expect(html).toContain('Mục đích nghiên cứu')
  expect(html).toContain('Có câu hỏi nhạy cảm')
  expect(html).toContain('Thông báo sử dụng dữ liệu')
  expect(html).toContain('href="/exchange?page=2&amp;sort=reward"')
  expect(html).not.toContain('Xác nhận hoàn thành')
})
it('shows invalid-id and loading states', () => {
  expect(renderPage('/exchange/nope')).toContain('Mã khảo sát không hợp lệ')
  expect(renderPage('/exchange/3')).toContain('Đang tải chi tiết khảo sát')
})

it('shows the form URL with a safe new-tab link and explains verification', () => {
  const url = 'https://docs.google.com/forms/d/e/example/viewform'
  const html = renderPage('/exchange/3', true, { externalFormUrl: url })
  expect(html).toContain(`href="${url}" target="_blank" rel="noopener noreferrer"`)
  expect(html).toContain('Mở biểu mẫu')
  expect(html).toContain('Đăng ký tham gia ở phía trên để giữ chỗ')
  expect(html).toContain('Đăng ký tham gia')
})
it.each([null, 'javascript:alert(1)', 'invalid', 'https://user:password@example.com'])(
  'handles missing or unsafe form URL %s',
  (externalFormUrl) => {
    const html = renderPage('/exchange/3', true, { externalFormUrl })
    expect(html).toContain('Khảo sát chưa có link biểu mẫu hợp lệ')
    expect(html).not.toContain('Mở biểu mẫu')
  }
)
