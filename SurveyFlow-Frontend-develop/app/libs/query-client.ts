import { getAxiosStatusCode } from '@/utils/http-error'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      /* Auth đã xử lý 401; lỗi quyền 403 không cần thử lại. */
      retry: (failureCount, error) =>
        failureCount < 1 && ![401, 403].includes(getAxiosStatusCode(error) ?? 0),
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 0
    }
  }
})
