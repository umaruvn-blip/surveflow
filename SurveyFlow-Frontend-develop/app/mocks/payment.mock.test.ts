import { describe, expect, it } from 'vitest'

import { mockCreditApi } from '@/mocks/credit.mock'
import { mockPaymentApi } from '@/mocks/payment.mock'

describe('mockPaymentApi', () => {
  it('uses the agreed rate and credits the wallet only once', async () => {
    const before = await mockCreditApi.getWallet()
    const payment = await mockPaymentApi.create(100)
    expect(payment.amountVnd).toBe(10000)

    await mockPaymentApi.complete(payment.id, 'SUCCESS')
    await mockPaymentApi.complete(payment.id, 'SUCCESS')

    const after = await mockCreditApi.getWallet()
    expect(after.balance - before.balance).toBe(100)
    expect(
      (await mockCreditApi.getTransactions()).filter(
        (item) => item.referenceId === payment.id && item.referenceType === 'PAYMENT'
      )
    ).toHaveLength(1)
  })

  it('does not credit failed payments', async () => {
    const before = await mockCreditApi.getWallet()
    const payment = await mockPaymentApi.create(20)
    await mockPaymentApi.complete(payment.id, 'FAILED')
    await expect(mockPaymentApi.complete(payment.id, 'SUCCESS')).rejects.toThrow()
    expect((await mockCreditApi.getWallet()).balance).toBe(before.balance)
  })

  it('accepts whole Credit amounts without a 10-Credit step or a 100,000-Credit cap', async () => {
    expect((await mockPaymentApi.create(11)).amountVnd).toBe(1100)
    expect((await mockPaymentApi.create(100001)).amountVnd).toBe(10000100)
    await expect(mockPaymentApi.create(9)).rejects.toThrow()
    await expect(mockPaymentApi.create(10.5)).rejects.toThrow()
  })
})
