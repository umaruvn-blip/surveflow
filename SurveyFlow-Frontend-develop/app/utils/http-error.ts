import axios, { type AxiosError } from 'axios'

import { AuthErrorCode } from '@/enums/auth-error-code'
import { HttpStatusCode } from '@/enums/http-status-code'
import type { ErrorResponse } from '@/types'

export function getAxiosStatusCode(error: unknown): number | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined
  }

  return error.response?.status
}

export function isAxiosUnauthorizedError<T>(error: AxiosError<T>): error is AxiosError<T> {
  return error.response?.status === HttpStatusCode.Unauthorized
}

export function isAxiosBadRequestError<T>(error: AxiosError<T>): error is AxiosError<T> {
  return error.response?.status === HttpStatusCode.BadRequest
}

export function isAxiosForbiddenError<T>(error: AxiosError<T>): error is AxiosError<T> {
  return error.response?.status === HttpStatusCode.Forbidden
}

export function isAxiosNotFoundError<T>(error: AxiosError<T>): error is AxiosError<T> {
  return error.response?.status === HttpStatusCode.NotFound
}

export function isAxiosConflictError<T>(error: AxiosError<T>): error is AxiosError<T> {
  return error.response?.status === HttpStatusCode.Conflict
}

export function isAxiosValidationError<T>(error: AxiosError<T>): error is AxiosError<T> {
  return (
    error.response?.status === HttpStatusCode.BadRequest ||
    error.response?.status === HttpStatusCode.UnprocessableEntity
  )
}

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response
}

export function isAxiosExpiredTokenError(error: AxiosError<ErrorResponse>): boolean {
  const code = error.response?.data?.code
  return code === AuthErrorCode.TokenExpired
}
