import axios from 'axios'

export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'Lỗi hệ thống, vui lòng thử lại sau'
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (typeof responseData === 'object' && responseData && 'message' in responseData) {
      const message = responseData.message

      if (typeof message === 'string' && message.trim()) {
        return message
      }
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallbackMessage
}
