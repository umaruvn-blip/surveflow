import { describe, expect, it } from 'vitest'

import { MOCK_ACCOUNTS, mockAuthApi } from '@/mocks/auth.mock'

describe('mockAuthApi', () => {
  it.each(MOCK_ACCOUNTS)('returns a usable session for the $label account', async (account) => {
    const session = await mockAuthApi.login(account)

    expect(session.accessToken).toContain(account.label.toLowerCase())
    expect(session.user.email).toBe(account.email)
    expect(session.user.roles).toContain(account.label)
  })

  it('rejects invalid credentials', async () => {
    await expect(
      mockAuthApi.login({ email: 'wrong@example.com', password: 'wrong-password' })
    ).rejects.toThrow('Email hoặc mật khẩu mock chưa chính xác.')
  })
})
