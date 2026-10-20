import { useQuery } from '@tanstack/react-query'

import { metadataApi } from '@/apis/metadata.api'
import { QUERY_KEYS } from '@/constants/query-keys'

export function useLevelsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.metadata.levels,
    queryFn: metadataApi.getLevels,
    staleTime: 5 * 60 * 1000
  })
}
