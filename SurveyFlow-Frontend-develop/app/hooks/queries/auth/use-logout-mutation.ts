import { useMutation } from '@tanstack/react-query'

import { authApi } from '@/apis/auth.api'
import { queryClient } from '@/libs/query-client'
import { useAuthStore } from '@/stores/auth-store'

export function useLogoutMutation() {
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    /* Xóa phiên và cache ngay, không phụ thuộc kết quả gọi logout backend. */
    onMutate: () => {
      logout()
      queryClient.clear()
    },
    mutationFn: authApi.logout
  })
}
