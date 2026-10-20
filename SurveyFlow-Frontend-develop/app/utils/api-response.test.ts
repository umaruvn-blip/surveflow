import { describe, expect, it } from 'vitest'

import { unwrapApiResponse } from '@/utils/api-response'

describe('API envelopes', () => {
  it('unwraps data including null logout responses', () => {
    expect(
      unwrapApiResponse({ status: 200, code: 'OK', success: true, message: 'OK', data: null })
    ).toBeNull()
  })
  it('rejects application failures even with HTTP 200', () => {
    expect(() =>
      unwrapApiResponse({
        status: 400,
        code: 'ERROR',
        success: false,
        message: 'Không hợp lệ',
        data: null
      })
    ).toThrow('Không hợp lệ')
  })
})
