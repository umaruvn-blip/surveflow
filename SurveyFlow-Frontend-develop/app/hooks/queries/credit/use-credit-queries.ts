import { useMutation, useQuery } from '@tanstack/react-query'

import { creditApi } from '@/apis/credit.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { queryClient } from '@/libs/query-client'
import type { RedeemReward, WithdrawalRequest } from '@/types/credit.type'

function invalidateCreditQueries() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits.wallet }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits.transactions })
  ])
}

export function useCreditTransactionsQuery() {
  return useQuery({ queryKey: QUERY_KEYS.credits.transactions, queryFn: creditApi.getTransactions })
}

export function useCreditWalletQuery() {
  return useQuery({ queryKey: QUERY_KEYS.credits.wallet, queryFn: creditApi.getWallet })
}

export function useReserveSurveyBudgetMutation() {
  return useMutation({
    mutationFn: creditApi.reserveSurveyBudget,
    onSuccess: invalidateCreditQueries
  })
}

export function useReleaseSurveyBudgetMutation() {
  return useMutation({
    mutationFn: creditApi.releaseSurveyBudget,
    onSuccess: invalidateCreditQueries
  })
}

export function useGrantParticipationRewardMutation() {
  return useMutation({
    mutationFn: creditApi.grantParticipationReward,
    onSuccess: invalidateCreditQueries
  })
}

export function useRedeemRewardMutation() {
  return useMutation({
    mutationFn: (reward: RedeemReward) => creditApi.redeemReward(reward),
    onSuccess: invalidateCreditQueries
  })
}

export function useRequestWithdrawalMutation() {
  return useMutation({
    mutationFn: (request: WithdrawalRequest) => creditApi.requestWithdrawal(request),
    onSuccess: invalidateCreditQueries
  })
}
