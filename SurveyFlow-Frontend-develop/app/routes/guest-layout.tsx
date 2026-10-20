import { safeInternalPath } from '@/utils/redirect'
import { Navigate, Outlet, useSearchParams } from 'react-router'

import { useAuthStore } from '@/stores/auth-store'

export default function GuestLayout() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const [searchParams] = useSearchParams()

  /* Chờ đọc storage trước khi quyết định cho xem trang login. */
  if (!isHydrated) {
    return null
  }

  if (accessToken) {
    const redirectTo = safeInternalPath(searchParams.get('redirectTo'))
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
