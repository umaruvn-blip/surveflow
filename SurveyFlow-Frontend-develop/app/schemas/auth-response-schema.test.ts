import { expect, it } from 'vitest'

import { authResponseSchema } from '@/schemas/auth-response-schema'

it('keeps credentials and unknown transport fields out of auth state', () => {
  const result = authResponseSchema.parse({
    accessToken: 'demo',
    refreshToken: 'discard',
    user: {
      id: 1,
      email: 'demo@example.test',
      status: 'ACTIVE',
      roles: ['USER'],
      password: 'discard'
    }
  })
  expect(result).toEqual({
    accessToken: 'demo',
    user: { id: 1, email: 'demo@example.test', status: 'ACTIVE', roles: ['USER'] }
  })
})
