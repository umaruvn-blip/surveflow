import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { path } from '@/config/path'
import { useAuthStore } from '@/stores/auth-store'

type AdminGuardProps = {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const isAdmin = user?.roles?.some((role) => role === 'ADMIN' || role === 'ROLE_ADMIN')

  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/forbidden', { replace: true })
    }
  }, [user, isAdmin, navigate])

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
