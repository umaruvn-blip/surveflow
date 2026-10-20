import { useMutation } from '@tanstack/react-query'

import { authApi } from '@/apis/auth.api'

export function useStartGoogleLinkMutation() {
  return useMutation({
    mutationFn: () => authApi.startGoogleLink()
  })
}
