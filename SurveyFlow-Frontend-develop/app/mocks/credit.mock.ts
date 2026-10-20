import type {
  CreditTransaction,
  CreditWallet,
  RedeemReward,
  SurveyBudget,
  WithdrawalRequest
} from '@/types/credit.type'

const wallet: CreditWallet = {
  walletId: 1,
  balance: 120,
  reservedBalance: 30,
  spendableBalance: 120
}

const transactions: CreditTransaction[] = [
  {
    id: 3,
    type: 'SURVEY_COMPLETION',
    direction: 'CREDIT',
    amount: 10,
    balanceBefore: 110,
    balanceAfter: 120,
    referenceType: 'SURVEY_PARTICIPATION',
    referenceId: 12,
    description: 'Thưởng hoàn thành khảo sát',
    createdAt: '2026-09-20T10:30:00Z'
  },
  {
    id: 2,
    type: 'SURVEY_BUDGET_RESERVATION',
    direction: 'DEBIT',
    amount: 30,
    balanceBefore: 140,
    balanceAfter: 110,
    referenceType: 'SURVEY',
    referenceId: 4,
    description: 'Đã giữ Credits cho ngân sách khảo sát',
    createdAt: '2026-09-19T09:00:00Z'
  }
]

export const mockCreditApi = {
  addTopupCredits(paymentId: number, credits: number) {
    const balanceBefore = wallet.balance
    wallet.balance += credits
    wallet.spendableBalance += credits
    transactions.unshift({
      id: Math.max(0, ...transactions.map((item) => item.id)) + 1,
      type: 'CREDIT_TOPUP',
      direction: 'CREDIT',
      amount: credits,
      balanceBefore,
      balanceAfter: wallet.balance,
      referenceType: 'PAYMENT',
      referenceId: paymentId,
      description: 'Nạp Credits qua thanh toán giả lập',
      createdAt: new Date().toISOString()
    })
  },
  holdCreatorBudget(surveyId: number, amount: number) {
    if (wallet.spendableBalance < amount) throw new Error('Credits khả dụng không đủ để publish.')
    const balanceBefore = wallet.balance
    wallet.balance -= amount
    wallet.spendableBalance -= amount
    wallet.reservedBalance += amount
    transactions.unshift({
      id: Math.max(...transactions.map((item) => item.id)) + 1,
      type: 'SURVEY_BUDGET_RESERVATION',
      direction: 'DEBIT',
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      referenceType: 'SURVEY',
      referenceId: surveyId,
      description: 'Giữ ngân sách khảo sát',
      createdAt: new Date().toISOString()
    })
  },
  refundCreatorBudget(surveyId: number, amount: number) {
    const balanceBefore = wallet.balance
    wallet.balance += amount
    wallet.spendableBalance += amount
    wallet.reservedBalance -= amount
    transactions.unshift({
      id: Math.max(...transactions.map((item) => item.id)) + 1,
      type: 'SURVEY_BUDGET_RELEASE',
      direction: 'CREDIT',
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      referenceType: 'SURVEY',
      referenceId: surveyId,
      description: 'Hoàn ngân sách khảo sát',
      createdAt: new Date().toISOString()
    })
  },
  async grantParticipationReward(): Promise<CreditWallet> {
    wallet.balance += 10
    wallet.spendableBalance += 10
    return structuredClone(wallet)
  },
  async getTransactions(): Promise<CreditTransaction[]> {
    return structuredClone(transactions)
  },
  async getWallet(): Promise<CreditWallet> {
    return structuredClone(wallet)
  },
  async releaseSurveyBudget(surveyId: number): Promise<SurveyBudget> {
    return {
      surveyId,
      totalCredit: 30,
      reservedCredit: 30,
      distributedCredit: 0,
      releasedCredit: 30,
      availableCredit: 0,
      status: 'RELEASED'
    }
  },
  async reserveSurveyBudget(surveyId: number): Promise<SurveyBudget> {
    return {
      surveyId,
      totalCredit: 30,
      reservedCredit: 30,
      distributedCredit: 0,
      releasedCredit: 0,
      availableCredit: 30,
      status: 'ACTIVE'
    }
  },
  async redeemReward(reward: RedeemReward): Promise<CreditWallet> {
    if (wallet.spendableBalance < reward.credits) {
      throw new Error('Credits khả dụng không đủ để đổi phần thưởng này.')
    }
    const balanceBefore = wallet.balance
    wallet.balance -= reward.credits
    wallet.spendableBalance -= reward.credits
    transactions.unshift({
      id: Math.max(0, ...transactions.map((transaction) => transaction.id)) + 1,
      type: 'REWARD_REDEMPTION',
      direction: 'DEBIT',
      amount: reward.credits,
      balanceBefore,
      balanceAfter: wallet.balance,
      referenceType: 'REWARD',
      referenceId: null,
      description: `Đổi thưởng: ${reward.name}`,
      createdAt: new Date().toISOString()
    })
    return structuredClone(wallet)
  },
  async requestWithdrawal(request: WithdrawalRequest): Promise<CreditWallet> {
    if (request.credits < 5000) throw new Error('Số Credits rút tối thiểu là 5.000.')
    if (wallet.spendableBalance < request.credits) {
      throw new Error('Credits khả dụng không đủ để tạo yêu cầu rút tiền.')
    }
    const balanceBefore = wallet.balance
    wallet.balance -= request.credits
    wallet.spendableBalance -= request.credits
    transactions.unshift({
      id: Math.max(0, ...transactions.map((transaction) => transaction.id)) + 1,
      type: 'WITHDRAWAL_REQUEST',
      direction: 'DEBIT',
      amount: request.credits,
      balanceBefore,
      balanceAfter: wallet.balance,
      referenceType: 'WITHDRAWAL',
      referenceId: null,
      description: `Yêu cầu rút tiền qua ${request.method === 'MOMO' ? 'MoMo' : 'ngân hàng'} đang chờ xử lý`,
      createdAt: new Date().toISOString()
    })
    return structuredClone(wallet)
  }
}
