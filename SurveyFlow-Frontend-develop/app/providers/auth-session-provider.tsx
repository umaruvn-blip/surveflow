import { useEffect, useState } from 'react'

import { env } from '@/config/env'
import { refreshSession } from '@/libs/http'
import { useAuthStore } from '@/stores/auth-store'

type AuthSessionProviderProps = { children: React.ReactNode }

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let active = true
    const initialize = async () => {
      /* Hydrate đọc AT và user đã lưu, chưa xác nhận token còn hiệu lực. */
      await useAuthStore.persist.rehydrate()
      /* Callback OAuth tự refresh; các trang khác khôi phục phiên tại đây. */
      if (!env.VITE_ENABLE_MOCK && window.location.pathname !== '/auth/callback') {
        try {
          await refreshSession()
        } catch {
          /* Lỗi mạng giữ phiên; lỗi 401/403 được xử lý trong refreshSession. */
        }
      }
      /* Chỉ mở giao diện khi khôi phục phiên xong và provider còn mounted. */
      if (active) setReady(true)
    }
    void initialize()
    return () => {
      active = false
    }
  }, [])
  return ready ? children : <div role='status'>Đang khôi phục phiên đăng nhập…</div>
}
