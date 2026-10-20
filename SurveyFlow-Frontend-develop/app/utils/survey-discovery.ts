import type { SurveyDiscoveryOptions, SurveySort } from '@/types/survey-discovery.type'
import type { SurveyDetail, SurveySummary } from '@/types/survey-management.type'
import type { UserProfile } from '@/types/profile.type'

export const SURVEY_SORT_OPTIONS: Array<{ value: SurveySort; label: string }> = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'reward', label: 'Thưởng cao nhất' }
]
export const SURVEY_SORT_PARAMS = {
  newest: { sortBy: 'publishedAt', sortDir: 'DESC' },
  oldest: { sortBy: 'publishedAt', sortDir: 'ASC' },
  reward: { sortBy: 'rewardCredit', sortDir: 'DESC' }
} as const

export function discoveryOptions(params: URLSearchParams): SurveyDiscoveryOptions {
  const page = Number(params.get('page') ?? 1)
  const sort = params.get('sort')
  return {
    page: Number.isSafeInteger(page) && page > 0 && page <= 2147483647 ? page : 1,
    sort: sort === 'oldest' || sort === 'reward' ? sort : 'newest'
  }
}
export function discoverySearch(options: SurveyDiscoveryOptions) {
  return new URLSearchParams({ page: String(options.page), sort: options.sort }).toString()
}
export function formatSurveyDuration(seconds: number | null) {
  if (seconds === null) return 'Chưa cung cấp'
  return seconds < 60 ? `${seconds} giây` : `${Math.ceil(seconds / 60)} phút`
}
export function formatSurveyDate(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Không đặt thời hạn'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(value))
}
export function surveyProgress(
  survey: Pick<SurveySummary, 'currentResponseCount' | 'targetResponseCount'>
) {
  return survey.targetResponseCount > 0
    ? Math.min(
        100,
        Math.max(0, Math.round((survey.currentResponseCount / survey.targetResponseCount) * 100))
      )
    : 0
}

export function isSurveyDiscoverable(survey: SurveyDetail, profile: UserProfile, now: number) {
  if (
    survey.status !== 'PUBLISHED' ||
    survey.creatorId === profile.userId ||
    survey.availableSlots <= 0 ||
    (survey.deadline && Date.parse(survey.deadline) <= now)
  )
    return false
  const target = survey.targeting
  if (!target) return true
  if (
    target.minBirthYear !== null &&
    (profile.birthYear === null || profile.birthYear < target.minBirthYear)
  )
    return false
  if (
    target.maxBirthYear !== null &&
    (profile.birthYear === null || profile.birthYear > target.maxBirthYear)
  )
    return false
  if (target.gender && target.gender !== profile.gender) return false
  const matchesText = (required: string | null, actual: string | null) =>
    !required || required.trim().toLowerCase() === actual?.trim().toLowerCase()
  if (
    !matchesText(target.school, profile.school) ||
    !matchesText(target.occupation, profile.occupation)
  )
    return false
  return (
    !target.interestIds.length ||
    target.interestIds.some((id) => profile.interests.some((interest) => interest.id === id))
  )
}
