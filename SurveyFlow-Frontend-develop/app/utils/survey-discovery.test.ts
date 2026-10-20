import { describe, expect, it } from 'vitest'
import { DISCOVERY_FIXTURES } from '@/mocks/survey-discovery.mock'
import type { UserProfile } from '@/types/profile.type'
import {
  discoveryOptions,
  discoverySearch,
  formatSurveyDuration,
  isSurveyDiscoverable,
  surveyProgress
} from '@/utils/survey-discovery'

const profile: UserProfile = {
  userId: 1,
  email: 'demo@surveyflow.local',
  referralCode: 'DEMO000001',
  displayName: null,
  avatarUrl: null,
  birthYear: 2002,
  gender: 'FEMALE',
  school: 'Đại học',
  occupation: 'Sinh viên',
  bio: null,
  interests: [{ id: 1, name: 'Học tập', slug: 'study', active: true }]
}
describe('discovery options and formatting', () => {
  it('normalizes invalid URL params and preserves valid pagination/sort', () => {
    expect(discoveryOptions(new URLSearchParams('page=-1&sort=invalid'))).toEqual({
      page: 1,
      sort: 'newest'
    })
    expect(discoveryOptions(new URLSearchParams('page=1.5'))).toEqual({ page: 1, sort: 'newest' })
    expect(discoveryOptions(new URLSearchParams('page=Infinity'))).toEqual({
      page: 1,
      sort: 'newest'
    })
    expect(discoverySearch(discoveryOptions(new URLSearchParams('page=2&sort=reward')))).toBe(
      'page=2&sort=reward'
    )
  })
  it('handles duration zero, missing duration and bounded progress', () => {
    expect(formatSurveyDuration(0)).toBe('0 giây')
    expect(formatSurveyDuration(null)).toBe('Chưa cung cấp')
    expect(formatSurveyDuration(121)).toBe('3 phút')
    expect(surveyProgress({ currentResponseCount: 60, targetResponseCount: 50 })).toBe(100)
    expect(surveyProgress({ currentResponseCount: 0, targetResponseCount: 0 })).toBe(0)
  })
})
describe('mock discoverability matches backend business rules', () => {
  const now = Date.parse('2026-09-27T00:00:00Z')
  const survey = structuredClone(DISCOVERY_FIXTURES[0])
  it('excludes owner, non-published, expired and fully reserved surveys', () => {
    expect(isSurveyDiscoverable(survey, profile, now)).toBe(true)
    expect(isSurveyDiscoverable({ ...survey, creatorId: 1 }, profile, now)).toBe(false)
    expect(isSurveyDiscoverable({ ...survey, status: 'DRAFT' }, profile, now)).toBe(false)
    expect(
      isSurveyDiscoverable({ ...survey, deadline: '2026-09-26T00:00:00Z' }, profile, now)
    ).toBe(false)
    expect(
      isSurveyDiscoverable({ ...survey, availableSlots: 0, currentResponseCount: 10 }, profile, now)
    ).toBe(false)
  })
  it('requires missing targeting attributes and matches at least one interest', () => {
    const targeted = {
      ...survey,
      targeting: {
        minBirthYear: 2000,
        maxBirthYear: 2005,
        gender: 'FEMALE' as const,
        school: ' ĐẠI HỌC ',
        occupation: 'Sinh viên',
        interestIds: [1, 2]
      }
    }
    expect(isSurveyDiscoverable(targeted, profile, now)).toBe(true)
    expect(isSurveyDiscoverable(targeted, { ...profile, birthYear: null }, now)).toBe(false)
    expect(isSurveyDiscoverable(targeted, { ...profile, gender: null }, now)).toBe(false)
    expect(isSurveyDiscoverable(targeted, { ...profile, interests: [] }, now)).toBe(false)
  })
})
