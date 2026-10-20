import { describe, expect, it } from 'vitest'
import { DEFAULT_SURVEY, googleFormId, surveySchema } from '@/schemas/survey.schema'

const valid = () => ({
  ...structuredClone(DEFAULT_SURVEY),
  title: 'Khảo sát',
  externalFormUrl: 'https://docs.google.com/forms/d/e/form_123/viewform'
})
describe('survey draft validation', () => {
  it('accepts respondent URLs and rejects shortened, foreign, and editor URLs', () => {
    expect(googleFormId(valid().externalFormUrl)).toBe('form_123')
    expect(googleFormId('https://docs.google.com/forms/d/form_123/viewform')).toBe('form_123')
    for (const url of [
      'https://forms.gle/abc',
      'https://evil.test/forms/d/abc/viewform',
      'http://docs.google.com/forms/d/abc/viewform',
      'https://docs.google.com/forms/d/abc/edit'
    ])
      expect(googleFormId(url)).toBeNull()
  })
  it('validates sensitive notice, time ordering, integer counts and deadline', () => {
    expect(surveySchema.safeParse(valid()).success).toBe(true)
    expect(surveySchema.safeParse({ ...valid(), containsSensitiveQuestions: true }).success).toBe(
      false
    )
    expect(surveySchema.safeParse({ ...valid(), targetResponseCount: 1.5 }).success).toBe(false)
    expect(surveySchema.safeParse({ ...valid(), deadline: '2020-01-01T00:00:00Z' }).success).toBe(
      false
    )
    expect(
      surveySchema.safeParse({
        ...valid(),
        verification: { ...valid().verification, minCompletionSeconds: 2000 }
      }).success
    ).toBe(false)
    expect(
      surveySchema.safeParse({
        ...valid(),
        targeting: { ...DEFAULT_SURVEY.targeting, minBirthYear: 2005, maxBirthYear: 2000 }
      }).success
    ).toBe(false)
  })
})
