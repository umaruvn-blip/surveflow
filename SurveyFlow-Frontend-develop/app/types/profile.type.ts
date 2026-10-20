export type UserGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'

export type ProfileInterest = {
  id: number
  name: string
  slug: string
  active: boolean
}

export type ProfileUpdateRequest = {
  displayName: string | null
  birthYear: number | null
  gender: UserGender | null
  school: string | null
  occupation: string | null
  bio: string | null
}

export type UserProfile = ProfileUpdateRequest & {
  userId: number
  email: string
  referralCode: string
  avatarUrl: string | null
  interests: ProfileInterest[]
}

export type InterestsResponse = { interests: ProfileInterest[] }
