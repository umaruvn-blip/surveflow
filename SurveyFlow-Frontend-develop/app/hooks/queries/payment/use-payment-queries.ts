import { useMutation, useQuery } from '@tanstack/react-query'

import { paymentApi } from '@/apis/payment.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { queryClient } from '@/libs/query-client'
import type { BankTransferOrderRequest, DemoPaymentOutcome, PaymentStatus } from '@/types/payment.type'

export function usePaymentQuery(id: number, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.detail(id),
    queryFn: () => paymentApi.get(id),
    enabled: enabled && Number.isInteger(id) && id > 0
  })
}

export function useCreateTopupMutation() {
  return useMutation({ mutationFn: paymentApi.createTopup })
}

export function useCompleteDemoPaymentMutation(id: number) {
  return useMutation({
    mutationFn: (outcome: DemoPaymentOutcome) => paymentApi.complete(id, outcome),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.detail(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits.wallet }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits.transactions })
      ])
    }
  })
}

// Bank Transfer hooks
export function useBankTransferQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.bankTransfer(id),
    queryFn: () => paymentApi.getBankTransfer(id),
    enabled: enabled && Number.isInteger(id) && id > 0
  })
}

export function useCreateBankTransferMutation() {
  return useMutation({
    mutationFn: (request: BankTransferOrderRequest) => paymentApi.createBankTransfer(request)
  })
}

// Admin Payment hooks
export function useAdminPaymentsQuery(status?: PaymentStatus) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.adminList(status),
    queryFn: () => paymentApi.getAdminPayments(status)
  })
}

export function useApprovePaymentMutation() {
  return useMutation({
    mutationFn: (paymentId: number) => paymentApi.approvePayment(paymentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.tracking })
      ])
    }
  })
}

export function useRejectPaymentMutation() {
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: number; reason?: string }) =>
      paymentApi.rejectPayment(paymentId, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.tracking })
      ])
    }
  })
}
