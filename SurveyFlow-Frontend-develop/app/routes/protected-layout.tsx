import { Navigate, useLocation } from 'react-router'

import { AppShell } from '@/components/AppShell'
import { path } from '@/config/path'
import { useAuthStore } from '@/stores/auth-store'

export default function ProtectedLayout() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const location = useLocation()

  /* Chờ đọc storage để không đẩy nhầm người đang đăng nhập về login. */
  if (!isHydrated) {
    return null
  }

  if (!accessToken) {
    /* Giữ trang đang xem để quay lại sau khi đăng nhập. */
    const redirectTo = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`${path.login}?redirectTo=${redirectTo}`} replace />
  }

  return <AppShell />
}
