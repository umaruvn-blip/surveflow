export type AuthResponse = {
  accessToken: string
  user: AuthUser
}

export type AuthUser = {
  accountType?: 'STUDENT' | 'WORKER'
  company?: string
  id: number
  email: string
  fullName?: string
  jobTitle?: string
  major?: string
  status: string
  roles: string[]
  university?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  accountType: 'STUDENT' | 'WORKER'
  company?: string
  jobTitle?: string
  fullName: string
  university?: string
  major?: string
  email: string
  password: string
  confirmPassword: string
  referralCode?: string
}

export type RefreshTokenResponse = {
  accessToken: string
}
