export type CreditTransactionDirection = 'CREDIT' | 'DEBIT'

export type CreditTransaction = {
  amount: number
  balanceAfter: number
  balanceBefore: number
  createdAt: string
  description: string
  direction: CreditTransactionDirection
  id: number
  referenceId: number | null
  referenceType: string | null
  type: string
}

export type CreditWallet = {
  balance: number
  reservedBalance: number
  spendableBalance: number
  walletId: number
}

export type RedeemReward = {
  credits: number
  description: string
  id: string
  name: string
}

export type WithdrawalRequest = {
  accountName: string
  accountNumber: string
  credits: number
  method: 'BANK_TRANSFER' | 'MOMO'
}

export type SurveyBudget = {
  availableCredit: number
  distributedCredit: number
  releasedCredit: number
  reservedCredit: number
  status: string
  surveyId: number
  totalCredit: number
}
