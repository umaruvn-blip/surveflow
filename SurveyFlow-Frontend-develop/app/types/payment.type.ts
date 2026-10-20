export type DemoPaymentOutcome = 'SUCCESS' | 'FAILED' | 'CANCELLED'

export type TopupPayment = {
  amountVnd: number
  createdAt: string
  credits: number
  id: number
  paidAt: string | null
  status: 'PENDING' | DemoPaymentOutcome
}
