import { useQuery } from '@tanstack/react-query'

import { metadataApi } from '@/apis/metadata.api'
import { QUERY_KEYS } from '@/constants/query-keys'

export function useBadgesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.metadata.badges,
    queryFn: metadataApi.getBadges,
    staleTime: 5 * 60 * 1000
  })
}
