export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const
  },
  users: {
    profile: (userId: number | undefined) => ['users', userId, 'profile'] as const
  },
  surveys: {
    recommendations: (limit?: number) => ['surveys', 'recommendations', limit] as const,
    participation: (id: number, userId: number | undefined) =>
      ['surveys', 'participation', userId, id] as const,
    mine: ['surveys', 'mine'] as const,
    minePage: (page: number) => ['surveys', 'mine', page] as const,
    detail: (id: number) => ['surveys', 'detail', id] as const,
    exchange: ['surveys', 'exchange'] as const,
    discovery: (page: number, sort: string) => ['surveys', 'exchange', { page, sort }] as const,
    tracking: (scope: 'mine' | 'global' = 'mine') => ['surveys', 'tracking', scope] as const
  },
  credits: {
    transactions: ['credits', 'transactions'] as const,
    wallet: ['credits', 'wallet'] as const
  },
  payments: {
    detail: (id: number) => ['payments', id] as const,
    bankTransfer: (id: number) => ['payments', 'bank-transfer', id] as const,
    bankTransferHistory: ['payments', 'bank-transfer', 'history'] as const,
    adminList: (status?: string) => ['admin', 'payments', status] as const
  },
  pricing: {
    creditPackages: ['pricing', 'credit-packages'] as const,
    subscriptionPlans: ['pricing', 'subscription-plans'] as const,
    rewards: ['pricing', 'rewards'] as const
  },
  metadata: {
    categories: ['metadata', 'categories'] as const,
    interests: ['metadata', 'interests'] as const,
    tags: ['metadata', 'tags'] as const,
    badges: ['metadata', 'badges'] as const,
    levels: ['metadata', 'levels'] as const
  },
  feedbacks: {
    summary: ['feedbacks', 'summary'] as const
  },
  admin: {
    tracking: ['admin', 'tracking', 'summary'] as const
  },
  googleForms: {
    status: ['google-forms', 'status'] as const,
    list: ['google-forms', 'list'] as const,
    detail: (formId: string) => ['google-forms', 'detail', formId] as const
  },
  leaderboard: {
    list: (type: string, period: string) => ['leaderboard', type, period] as const,
    myRank: (type: string, period: string) => ['leaderboard', 'my-rank', type, period] as const
  }
} as const
