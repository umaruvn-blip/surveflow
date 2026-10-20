export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
} as const

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export type SortDirection = 'asc' | 'desc'

export type SortOrder = {
  sortBy?: string
  sortDirection?: SortDirection
}

export type PageParams = {
  page?: number
  size?: number
}

export type PaginationParams = {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: SortDirection
}
