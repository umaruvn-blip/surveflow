import { safeInternalPath } from '@/utils/redirect'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { path } from '@/config/path'
import { QUERY_KEYS } from '@/constants/query-keys'
import { queryClient } from '@/libs/query-client'
import { useAuthStore } from '@/stores/auth-store'
import { useCompleteOAuthLoginMutation } from '@/hooks/queries/auth/use-complete-oauth-login-mutation'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const completeLogin = useCompleteOAuthLoginMutation()
  const { mutateAsync } = completeLogin
  const loginPromise = useRef<Promise<unknown> | null>(null)
  const [loginFailed, setLoginFailed] = useState(false)
  const status = searchParams.get('oauth')
  const redirectTo = safeInternalPath(searchParams.get('redirectTo'))
  const accessToken = searchParams.get('accessToken')
  const userId = searchParams.get('userId')
  const email = searchParams.get('email')
  const userStatus = searchParams.get('status')
  const rolesParam = searchParams.get('roles')

  useEffect(() => {
    let active = true
    if (status === 'login') {
      if (accessToken && userId && email) {
        const roles = rolesParam ? rolesParam.split(',') : ['PARTICIPANT']
        const session = {
          accessToken,
          user: {
            id: Number(userId),
            email,
            status: userStatus ?? 'ACTIVE',
            roles
          }
        }
        queryClient.clear()
        useAuthStore.getState().establishSession(session)
        queryClient.setQueryData(QUERY_KEYS.auth.me, session.user)
        if (active) navigate(redirectTo, { replace: true })
        return
      }

      /* Fallback cho trường hợp lấy qua refresh cookie */
      loginPromise.current ??= mutateAsync(undefined)
      void loginPromise.current.then(
        () => {
          if (active) navigate(redirectTo, { replace: true })
        },
        () => {
          if (active) setLoginFailed(true)
        }
      )
    } else if (status === 'linked') {
      navigate(path.dashboard, { replace: true, state: { googleLinked: true } })
    }
    return () => {
      active = false
    }
  }, [accessToken, email, mutateAsync, navigate, redirectTo, rolesParam, status, userId, userStatus])

  if (status === 'link-required') {
    return (
      <CallbackMessage message='Email này đã có tài khoản. Hãy đăng nhập bằng tài khoản hiện tại rồi liên kết Google trong trang chính.' />
    )
  }
  if (status === 'link-conflict') {
    return (
      <CallbackMessage message='Tài khoản Google này đã được liên kết với một tài khoản Survey Flow khác.' />
    )
  }
  if (status === 'failed' || loginFailed || completeLogin.isError) {
    return <CallbackMessage message='Không thể đăng nhập bằng Google. Vui lòng thử lại.' />
  }

  return (
    <main className='grid min-h-screen place-items-center px-5'>
      <p className='text-muted-foreground text-sm' role='status'>
        {status === 'linked' ? 'Đã liên kết Google...' : 'Đang hoàn tất đăng nhập...'}
      </p>
    </main>
  )
}

function CallbackMessage({ message }: { message: string }) {
  const navigate = useNavigate()
  return (
    <main className='grid min-h-screen place-items-center px-5'>
      <section className='w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm'>
        <p className='text-foreground text-sm leading-6' role='alert'>
          {message}
        </p>
        <Button className='mt-5' onClick={() => navigate(path.login, { replace: true })}>
          Về trang đăng nhập
        </Button>
      </section>
    </main>
  )
}
