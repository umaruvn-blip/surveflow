import { MOCK_INTERESTS } from '@/mocks/metadata.mock'
import { useAuthStore } from '@/stores/auth-store'
import type { InterestsResponse, ProfileUpdateRequest, UserProfile } from '@/types/profile.type'

const profiles = new Map<number, UserProfile>()
const storageKey = (id: number) => `surveyflow-demo-profile-${id}`

function currentProfile(): UserProfile {
  const user = useAuthStore.getState().user
  if (!user) throw new Error('Vui lòng đăng nhập để xem hồ sơ.')
  if (!profiles.has(user.id)) {
    const stored =
      typeof window !== 'undefined' ? sessionStorage.getItem(storageKey(user.id)) : null
    let saved: UserProfile | undefined
    if (stored) {
      try {
        saved = JSON.parse(stored) as UserProfile
      } catch {
        /* Khôi phục demo khi storage không hợp lệ. */
      }
    }
    const defaultProfile: UserProfile = {
      userId: user.id,
      email: user.email,
      referralCode: `DEMO${user.id.toString(36).toUpperCase().padStart(6, '0')}`,
      displayName: user.fullName ?? (user.id === 1 ? 'Thành viên demo' : 'Quản trị viên demo'),
      avatarUrl: null,
      birthYear: user.id === 1 ? 2002 : null,
      gender: null,
      school: user.university ?? null,
      occupation: user.accountType === 'WORKER' ? (user.jobTitle ?? null) : 'Sinh viên',
      bio: null,
      interests: []
    }
    profiles.set(user.id, {
      ...defaultProfile,
      ...saved,
      referralCode: saved?.referralCode ?? defaultProfile.referralCode
    })
  }
  return structuredClone(profiles.get(user.id)!)
}

function save(profile: UserProfile): UserProfile {
  profiles.set(profile.userId, structuredClone(profile))
  if (typeof window !== 'undefined')
    sessionStorage.setItem(storageKey(profile.userId), JSON.stringify(profile))
  return structuredClone(profile)
}

export const mockProfileApi = {
  async getProfile(): Promise<UserProfile> {
    return currentProfile()
  },
  async updateProfile(payload: ProfileUpdateRequest): Promise<UserProfile> {
    return save({ ...currentProfile(), ...payload })
  },
  async replaceInterests(interestIds: number[]): Promise<InterestsResponse> {
    const profile = currentProfile()
    const interests = interestIds
      .map((id) => {
        const interest = MOCK_INTERESTS.find((item) => item.id === id)
        if (!interest) throw new Error('Sở thích không hợp lệ. Vui lòng tải lại danh sách.')
        return { id: interest.id, name: interest.name, slug: interest.slug, active: true }
      })
      .sort((a, b) => a.id - b.id)
    if (new Set(interestIds).size !== interestIds.length)
      throw new Error('Danh sách sở thích bị trùng.')
    save({ ...profile, interests })
    return { interests }
  }
}
