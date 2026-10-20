import { StrictMode, act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it, vi } from 'vitest'

import { authApi } from '@/apis/auth.api'
import { queryClient } from '@/libs/query-client'
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage'
import { useAuthStore } from '@/stores/auth-store'

vi.mock('@/apis/auth.api', () => ({
  authApi: { completeOAuthLogin: vi.fn() }
}))

it('leaves the Google callback page after refresh succeeds', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  queryClient.clear()
  useAuthStore.getState().logout()
  vi.mocked(authApi.completeOAuthLogin).mockResolvedValue({
    accessToken: 'test-access-token',
    user: { id: 24, email: 'student@example.com', status: 'ACTIVE', roles: ['USER'] }
  })

  const host = document.createElement('div')
  const root = createRoot(host)
  try {
    await act(async () => {
      root.render(
        <StrictMode>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/auth/callback?oauth=login&redirectTo=%2Fdashboard']}>
              <Routes>
                <Route path='/auth/callback' element={<OAuthCallbackPage />} />
                <Route path='/dashboard' element={<p>Dashboard</p>} />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>
        </StrictMode>
      )
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(authApi.completeOAuthLogin).toHaveBeenCalledOnce()
    expect(host.textContent).toContain('Dashboard')
  } finally {
    await act(async () => root.unmount())
    queryClient.clear()
    useAuthStore.getState().logout()
  }
})
