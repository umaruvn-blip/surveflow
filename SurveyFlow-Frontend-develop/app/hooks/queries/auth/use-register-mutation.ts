import { useMutation } from '@tanstack/react-query'

import { authApi } from '@/apis/auth.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { queryClient } from '@/libs/query-client'
import { useAuthStore } from '@/stores/auth-store'
import { triggerConversion } from '@/utils/utm'
import type { RegisterRequest } from '@/types'

export function useRegisterMutation() {
  const setSession = useAuthStore((state) => state.establishSession)

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: (data) => {
      queryClient.clear()
      setSession(data)
      queryClient.setQueryData(QUERY_KEYS.auth.me, data.user)
      triggerConversion()
    }
  })
}
