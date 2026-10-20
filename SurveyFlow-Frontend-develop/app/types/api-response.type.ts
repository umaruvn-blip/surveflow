export type ApiResponse<T> = {
  status: number
  code: string
  success: boolean
  message: string
  data: T
}

export type ErrorResponse = {
  code: string
  status: number
  message: string
  path: string
  timestamp: string
}

export type PageResponse<T> = {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
