import { expect, it } from 'vitest'

import { safeInternalPath } from '@/utils/redirect'

it('preserves internal redirects and rejects external URLs', () => {
  expect(safeInternalPath('/my-surveys?page=2')).toBe('/my-surveys?page=2')
  for (const value of [
    null,
    'https://example.test',
    '//example.test',
    '/\\example.test',
    '/\n/example.test'
  ]) {
    expect(safeInternalPath(value)).toBe('/dashboard')
  }
})
