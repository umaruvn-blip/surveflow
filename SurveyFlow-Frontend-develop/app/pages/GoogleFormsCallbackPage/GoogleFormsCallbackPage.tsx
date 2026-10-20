import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { googleFormsApi } from '@/apis/google-forms.api'
import { path } from '@/config/path'

export function GoogleFormsCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [connectedEmail, setConnectedEmail] = useState<string>('')

  useEffect(() => {
    if (error) {
      setStatus('error')
      setErrorMessage(error === 'access_denied' ? 'Bạn đã hủy cấp quyền Google Forms.' : error)
      return
    }

    if (!code) {
      setStatus('error')
      setErrorMessage('Không nhận được mã ủy quyền từ Google.')
      return
    }

    const redirectUri = window.location.origin + path.googleFormsCallback

    googleFormsApi
      .connect(code, redirectUri)
      .then((res) => {
        setStatus('success')
        setConnectedEmail(res.googleEmail || '')

        // Nếu mở bằng Popup
        if (window.opener && window.opener !== window) {
          window.opener.postMessage({ type: 'GOOGLE_FORMS_CONNECTED', email: res.googleEmail }, '*')
          setTimeout(() => window.close(), 1200)
        } else {
          setTimeout(() => navigate(path.createSurvey, { replace: true }), 1500)
        }
      })
      .catch((err) => {
        setStatus('error')
        setErrorMessage(err?.response?.data?.message || err?.message || 'Không thể liên kết tài khoản Google')
      })
  }, [code, error, navigate])

  return (
    <div className='flex min-h-screen items-center justify-center p-6 bg-background text-foreground'>
      <div className='w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl space-y-4'>
        {status === 'loading' && (
          <>
            <Loader2 className='mx-auto size-12 animate-spin text-primary' />
            <h2 className='text-lg font-bold'>Đang kết nối tài khoản Google Forms...</h2>
            <p className='text-xs text-muted-foreground'>Vui lòng đợi trong giây lát khi hệ thống xác thực mã ủy quyền.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className='mx-auto size-12 text-emerald-500 animate-in zoom-in-75' />
            <h2 className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
              Kết nối Google Forms thành công!
            </h2>
            {connectedEmail && (
              <p className='text-xs font-semibold text-muted-foreground bg-muted p-2 rounded-lg'>
                {connectedEmail}
              </p>
            )}
            <p className='text-xs text-muted-foreground'>Cửa sổ này sẽ tự động đóng lại...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className='mx-auto size-12 text-destructive animate-in zoom-in-75' />
            <h2 className='text-lg font-bold text-destructive'>Không thể kết nối</h2>
            <p className='text-xs text-muted-foreground'>{errorMessage}</p>
            <button
              type='button'
              onClick={() => {
                if (window.opener && window.opener !== window) {
                  window.close()
                } else {
                  navigate(path.createSurvey, { replace: true })
                }
              }}
              className='mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground'
            >
              Đóng và Thử lại
            </button>
          </>
        )}
      </div>
    </div>
  )
}
