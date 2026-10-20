import { mockCreditApi } from '@/mocks/credit.mock'
import type { DemoPaymentOutcome, TopupPayment } from '@/types/payment.type'

const payments = new Map<number, TopupPayment>()
let nextPaymentId = 1

export const mockPaymentApi = {
  async create(credits: number): Promise<TopupPayment> {
    if (!Number.isSafeInteger(credits) || credits < 10 || !Number.isSafeInteger(credits * 100)) {
      throw new Error('Số Credits phải là số nguyên từ 10 trở lên.')
    }
    const payment: TopupPayment = {
      id: nextPaymentId++,
      credits,
      amountVnd: credits * 100,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      paidAt: null
    }
    payments.set(payment.id, payment)
    return structuredClone(payment)
  },
  async get(id: number): Promise<TopupPayment> {
    const payment = payments.get(id)
    if (!payment) throw new Error('Không tìm thấy đơn thanh toán.')
    return structuredClone(payment)
  },
  async complete(id: number, outcome: DemoPaymentOutcome): Promise<TopupPayment> {
    const payment = payments.get(id)
    if (!payment) throw new Error('Không tìm thấy đơn thanh toán.')
    if (payment.status === outcome) return structuredClone(payment)
    if (payment.status !== 'PENDING') throw new Error('Đơn đã có kết quả khác.')
    payment.status = outcome
    if (outcome === 'SUCCESS') {
      payment.paidAt = new Date().toISOString()
      mockCreditApi.addTopupCredits(payment.id, payment.credits)
    }
    return structuredClone(payment)
  }
}
