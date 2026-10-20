import { endOfDay, format, isPast, isToday as isTodayDate, parseISO, startOfDay } from 'date-fns'

const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy'
const DEFAULT_DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm'
const DEFAULT_TIME_FORMAT = 'HH:mm'

export type DateValue = Date | number | string

export function toDate(value: DateValue): Date {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    return parseISO(value)
  }

  return new Date(value)
}

export function formatDate(value: DateValue, pattern = DEFAULT_DATE_FORMAT): string {
  return format(toDate(value), pattern)
}

export function formatDateTime(value: DateValue, pattern = DEFAULT_DATE_TIME_FORMAT): string {
  return format(toDate(value), pattern)
}

export function formatTime(value: DateValue, pattern = DEFAULT_TIME_FORMAT): string {
  return format(toDate(value), pattern)
}

export function isPastDate(value: DateValue): boolean {
  return isPast(toDate(value))
}

export function isToday(value: DateValue): boolean {
  return isTodayDate(toDate(value))
}

export function getStartOfDay(value: DateValue): Date {
  return startOfDay(toDate(value))
}

export function getEndOfDay(value: DateValue): Date {
  return endOfDay(toDate(value))
}

export function formatTimeAgo(value: DateValue): string {
  const date = toDate(value)
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Vừa xong'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} giờ trước`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays} ngày trước`
  return formatDate(date, 'dd/MM/yyyy')
}

