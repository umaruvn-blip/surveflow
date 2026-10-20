import { path } from '@/config/path'

/* Chỉ cho redirect trong ứng dụng, tránh chuyển tới website bên ngoài. */
export function safeInternalPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    Array.from(value).some((character) => character === '\\' || character.charCodeAt(0) <= 32)
  ) {
    return path.exchange
  }
  return value
}
