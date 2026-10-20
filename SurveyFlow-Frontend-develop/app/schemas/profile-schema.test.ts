import { describe, expect, it } from 'vitest'

import {
  profileFormSchema,
  profileFormValues,
  profileUpdatePayload
} from '@/schemas/profile-schema'
import type { UserProfile } from '@/types/profile.type'

const profile: UserProfile = {
  userId: 1,
  email: 'demo@example.test',
  referralCode: 'DEMO000001',
  avatarUrl: null,
  interests: [],
  displayName: 'An',
  birthYear: 2002,
  gender: 'OTHER',
  school: null,
  occupation: 'Student',
  bio: null
}

describe('profile form', () => {
  it('sends all six editable fields, converts empty values to null and excludes avatar/email', () => {
    const values = profileFormValues(profile)
    const payload = profileUpdatePayload({
      ...values,
      displayName: '  An mới  ',
      birthYear: '',
      occupation: '   '
    })
    expect(payload).toEqual({
      displayName: 'An mới',
      birthYear: null,
      gender: 'OTHER',
      school: null,
      occupation: null,
      bio: null
    })
    expect(payload).not.toHaveProperty('avatarUrl')
    expect(payload).not.toHaveProperty('email')
  })
  it.each(['1899', '3000', 'abc', '2002.5'])('rejects invalid birth year %s', (birthYear) => {
    expect(profileFormSchema.safeParse({ ...profileFormValues(profile), birthYear }).success).toBe(
      false
    )
  })
  it('rejects text beyond backend limits and unsupported gender', () => {
    expect(
      profileFormSchema.safeParse({ ...profileFormValues(profile), displayName: 'a'.repeat(101) })
        .success
    ).toBe(false)
    expect(
      profileFormSchema.safeParse({ ...profileFormValues(profile), gender: 'UNKNOWN' }).success
    ).toBe(false)
  })
})
