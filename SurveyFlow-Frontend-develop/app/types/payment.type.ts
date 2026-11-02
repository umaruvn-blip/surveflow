export type DemoPaymentOutcome = 'SUCCESS' | 'FAILED' | 'CANCELLED'

export type PaymentType = 'CREDIT_TOPUP' | 'SUBSCRIPTION'
export type PaymentProvider = 'DEMO' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER' | 'STRIPE'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'

export type TopupPayment = {
  amountVnd: number
  createdAt: string
  credits: number
  id: number
  paidAt: string | null
  status: 'PENDING' | DemoPaymentOutcome
}

export type BankTransferOrderRequest = {
  type: PaymentType
  packageId?: number
  credits?: number
  planId?: number
  priceId?: number
}

export type BankTransferPayment = {
  id: number
  type: PaymentType
  status: PaymentStatus
  amount: number
  currency: string
  creditAmount: number | null
  planName: string | null
  planCode: string | null
  durationDays: number | null
  transactionCode: string
  description: string
  bankId: string
  bankName: string
  accountNo: string
  accountName: string
  qrCodeUrl: string
  createdAt: string
  paidAt: string | null
}

export type AdminPaymentItem = {
  id: number
  userId: number | null
  userEmail: string | null
  userName: string | null
  type: PaymentType
  provider: PaymentProvider
  status: PaymentStatus
  amount: number
  currency: string
  creditAmount: number | null
  planName: string | null
  planCode: string | null
  transactionCode: string
  description: string
  createdAt: string
  paidAt: string | null
  cancelledAt: string | null
}
