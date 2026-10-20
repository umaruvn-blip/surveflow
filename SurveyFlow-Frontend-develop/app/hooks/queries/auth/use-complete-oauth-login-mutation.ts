import { useMutation } from '@tanstack/react-query'

import { authApi } from '@/apis/auth.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { queryClient } from '@/libs/query-client'
import { useAuthStore } from '@/stores/auth-store'
import { triggerConversion } from '@/utils/utm'

export function useCompleteOAuthLoginMutation() {
  const setSession = useAuthStore((state) => state.establishSession)

  return useMutation({
    /* Backend đã đặt cookie sau OAuth; refresh lấy AT và user cho frontend. */
    mutationFn: () => authApi.completeOAuthLogin(),
    onSuccess: (data) => {
      queryClient.clear()
      setSession(data)
      queryClient.setQueryData(QUERY_KEYS.auth.me, data.user)
      triggerConversion()
    }
  })
}
