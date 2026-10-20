import { useMutation } from '@tanstack/react-query'

import { authApi } from '@/apis/auth.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { queryClient } from '@/libs/query-client'
import { useAuthStore } from '@/stores/auth-store'
import type { LoginRequest } from '@/types'

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.establishSession)

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      /* Xóa dữ liệu phiên trước để không lẫn thông tin giữa các tài khoản. */
      queryClient.clear()
      setSession(data)
      queryClient.setQueryData(QUERY_KEYS.auth.me, data.user)
    }
  })
}
