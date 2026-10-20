import { useQuery } from '@tanstack/react-query'

import { metadataApi } from '@/apis/metadata.api'
import { QUERY_KEYS } from '@/constants/query-keys'

export function useInterestsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.metadata.interests,
    queryFn: metadataApi.getInterests,
    staleTime: 5 * 60 * 1000
  })
}
