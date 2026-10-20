import { describe, expect, it } from 'vitest'

import { mockCreditApi } from '@/mocks/credit.mock'

describe('mockCreditApi', () => {
  it('returns a wallet with a spendable credit balance', async () => {
    const wallet = await mockCreditApi.getWallet()

    expect(wallet.spendableBalance).toBeGreaterThanOrEqual(0)
    expect(wallet.balance).toBeGreaterThanOrEqual(wallet.spendableBalance)
  })

  it('returns transactions ordered from newest to oldest', async () => {
    const transactions = await mockCreditApi.getTransactions()

    expect(new Date(transactions[0].createdAt).getTime()).toBeGreaterThan(
      new Date(transactions[1].createdAt).getTime()
    )
  })
})
