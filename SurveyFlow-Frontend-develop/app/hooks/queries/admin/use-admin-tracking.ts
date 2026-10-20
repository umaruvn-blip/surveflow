import { useQuery } from '@tanstack/react-query'

import { adminApi } from '@/apis/admin.api'
import { QUERY_KEYS } from '@/constants/query-keys'

export const useAdminTrackingSummaryQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.admin.tracking,
    queryFn: () => adminApi.getTrackingSummary(),
    staleTime: 30_000
  })
