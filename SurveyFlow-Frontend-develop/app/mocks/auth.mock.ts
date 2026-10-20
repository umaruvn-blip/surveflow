import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@/types'

type MockAccount = LoginRequest & {
  label: string
  user: AuthUser
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    label: 'USER',
    email: 'user@surveyflow.local',
    password: 'User@123',
    user: {
      id: 1,
      email: 'user@surveyflow.local',
      status: 'ACTIVE',
      roles: ['USER']
    }
  },
  {
    label: 'ADMIN',
    email: 'admin@surveyflow.local',
    password: 'Admin@123',
    user: {
      id: 2,
      email: 'admin@surveyflow.local',
      status: 'ACTIVE',
      roles: ['ADMIN']
    }
  }
]

const MOCK_DELAY_MS = 350

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
}

export const mockAuthApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    await delay()
    const email = payload.email.trim().toLowerCase()
    if (MOCK_ACCOUNTS.some((account) => account.email === email)) {
      throw new Error('Email này đã được đăng ký.')
    }
    const account: MockAccount = {
      label: payload.fullName,
      email,
      password: payload.password,
      user: {
        id: MOCK_ACCOUNTS.length + 1,
        accountType: payload.accountType,
        company: payload.company,
        email,
        fullName: payload.fullName,
        jobTitle: payload.jobTitle,
        major: payload.major,
        university: payload.university,
        status: 'ACTIVE',
        roles: ['USER']
      }
    }
    MOCK_ACCOUNTS.push(account)
    return { accessToken: `mock-access-token-${account.user.id}`, user: account.user }
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    await delay()

    const account = MOCK_ACCOUNTS.find(
      (candidate) =>
        candidate.email === payload.email.trim().toLowerCase() &&
        candidate.password === payload.password
    )

    if (!account) {
      throw new Error('Email hoặc mật khẩu mock chưa chính xác.')
    }

    return {
      accessToken: `mock-access-token-${account.label.toLowerCase()}`,
      user: account.user
    }
  },

  async logout(): Promise<void> {
    await delay()
  }
}
