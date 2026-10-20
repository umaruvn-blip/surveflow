import { useMutation, useQuery } from '@tanstack/react-query'

import { paymentApi } from '@/apis/payment.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { queryClient } from '@/libs/query-client'
import type { DemoPaymentOutcome } from '@/types/payment.type'

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
