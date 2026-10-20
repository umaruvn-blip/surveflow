import { useQuery } from '@tanstack/react-query'

import { metadataApi } from '@/apis/metadata.api'
import { QUERY_KEYS } from '@/constants/query-keys'

export function useCategoriesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.metadata.categories,
    queryFn: metadataApi.getCategories,
    staleTime: 5 * 60 * 1000
  })
}
