import { useQuery } from '@tanstack/react-query'

import { metadataApi } from '@/apis/metadata.api'
import { QUERY_KEYS } from '@/constants/query-keys'

export function useTagsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.metadata.tags,
    queryFn: metadataApi.getTags,
    staleTime: 5 * 60 * 1000
  })
}
