import type { ApiResponse } from '@/types/api-response.type'

/* Kiểm tra envelope trước khi lấy data, kể cả khi HTTP trả 200. */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response || response.success !== true || !('data' in response)) {
    throw new Error(response?.message || 'Phản hồi API không hợp lệ.')
  }
  return response.data
}
