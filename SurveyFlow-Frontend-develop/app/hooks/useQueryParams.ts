import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

export function useQueryParams(): Record<string, string> {
  const [searchParams] = useSearchParams()

  return useMemo(() => Object.fromEntries([...searchParams]), [searchParams])
}
