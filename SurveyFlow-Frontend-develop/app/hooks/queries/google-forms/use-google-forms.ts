import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { googleFormsApi } from '@/apis/google-forms.api'
import { QUERY_KEYS } from '@/constants/query-keys'

export function useGoogleFormsConnectionStatusQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.googleForms.status,
    queryFn: () => googleFormsApi.getStatus(),
    staleTime: 60_000
  })
}

export function useGoogleFormsListQuery(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.googleForms.list,
    queryFn: () => googleFormsApi.listForms(),
    enabled,
    staleTime: 30_000
  })
}

export function useConnectGoogleFormsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ code, redirectUri }: { code: string; redirectUri: string }) =>
      googleFormsApi.connect(code, redirectUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.googleForms.status })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.googleForms.list })
    }
  })
}

export function useDisconnectGoogleFormsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => googleFormsApi.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.googleForms.status })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.googleForms.list })
    }
  })
}
