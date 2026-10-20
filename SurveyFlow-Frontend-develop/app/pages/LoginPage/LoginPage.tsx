import { safeInternalPath } from '@/utils/redirect'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { env } from '@/config/env'
import { useLoginMutation } from '@/hooks/queries/auth/use-login-mutation'
import { MOCK_ACCOUNTS } from '@/mocks/auth.mock'
import { loginRequestSchema } from '@/schemas/auth-schema'
import { getErrorMessage } from '@/utils/error'

type LoginFormValues = z.infer<typeof loginRequestSchema>

const features = [
  'Tạo khảo sát nhanh với bộ câu hỏi linh hoạt',
  'Trao đổi phản hồi cùng cộng đồng sinh viên',
  'Theo dõi credits và chất lượng dữ liệu'
]

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: env.VITE_ENABLE_MOCK ? MOCK_ACCOUNTS[0].email : '',
      password: env.VITE_ENABLE_MOCK ? MOCK_ACCOUNTS[0].password : ''
    }
  })

  const redirectTo = safeInternalPath(searchParams.get('redirectTo'))
  const apiOrigin = env.VITE_API_BASE_URL.replace(/\/api(?:\/v1)?\/?$/, '')
  const googleLoginUrl = `${apiOrigin}/api/v1/auth/oauth2/google?redirectTo=${encodeURIComponent(redirectTo)}`

  const handleLogin = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values)
      navigate(redirectTo, { replace: true })
    } catch {
      /* Form hiển thị lỗi từ mutation. */
    }
  }

  return (
    <main className='auth-shell'>
      <div className='auth-orb auth-orb-blue' />
      <div className='auth-orb auth-orb-green' />

      <section className='relative z-10 mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[1.08fr_0.92fr]'>
        <div className='hidden flex-col justify-between px-12 py-10 lg:flex xl:px-20 xl:py-14'>
          <Brand />

          <div className='max-w-xl pb-8'>
            <span className='eyebrow'>
              <Sparkles className='size-3.5' /> Nền tảng khảo sát cộng đồng
            </span>
            <h1 className='text-foreground mt-5 text-5xl leading-[1.08] font-black tracking-[-0.045em] xl:text-6xl'>
              Biến mọi phản hồi thành <span className='brand-text'>insight có giá trị.</span>
            </h1>
            <p className='text-muted-foreground mt-6 max-w-lg text-lg leading-8'>
              Một không gian thân thiện để tạo khảo sát, tiếp cận đúng người và thu thập dữ liệu
              chất lượng nhanh hơn.
            </p>

            <div className='mt-9 grid gap-4'>
              {features.map((feature) => (
                <div
                  className='text-foreground/80 flex items-center gap-3 text-sm font-semibold'
                  key={feature}
                >
                  <span className='bg-secondary/12 text-secondary grid size-7 place-items-center rounded-full'>
                    <Check className='size-4' strokeWidth={3} />
                  </span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className='text-muted-foreground flex items-center gap-2 text-xs font-semibold'>
            <ShieldCheck className='text-secondary size-4' /> Dữ liệu của bạn được bảo vệ an toàn
          </div>
        </div>

        <div className='flex min-h-screen items-center justify-center px-5 py-8 sm:px-10 lg:px-12'>
          <div className='w-full max-w-[480px]'>
            <Brand className='mb-8 lg:hidden' />

            <div className='border-primary/10 text-card-foreground overflow-hidden rounded-3xl border bg-white/90 shadow-[0_20px_60px_rgba(8,91,174,0.14)] backdrop-blur-xl'>
              <div className='brand-gradient h-1.5' />
              <div className='px-6 pt-8 pb-5 sm:px-9 sm:pt-9'>
                <div className='bg-primary/8 text-primary mb-3 grid size-12 place-items-center rounded-2xl'>
                  <LockKeyhole className='size-5' />
                </div>
                <h2 className='text-foreground text-3xl font-black tracking-[-0.035em]'>
                  Chào mừng trở lại
                </h2>
                <p className='text-muted-foreground mt-2 text-sm leading-6'>
                  Đăng nhập để tiếp tục quản lý khảo sát và phản hồi của bạn.
                </p>
              </div>

              <div className='px-6 pb-8 sm:px-9 sm:pb-9'>
                {!env.VITE_ENABLE_MOCK && (
                  <>
                    <Button
                      className='h-12 w-full rounded-xl bg-white font-bold text-slate-800 shadow-sm hover:bg-slate-50'
                      onClick={() => window.location.assign(googleLoginUrl)}
                      type='button'
                      variant='outline'
                    >
                      <span aria-hidden='true' className='text-base font-black text-blue-600'>
                        G
                      </span>
                      Tiếp tục với Google
                    </Button>
                    <div className='text-muted-foreground my-5 flex items-center gap-3 text-xs'>
                      <span className='bg-border h-px flex-1' />
                      hoặc đăng nhập bằng email
                      <span className='bg-border h-px flex-1' />
                    </div>
                  </>
                )}
                <form className='space-y-5' onSubmit={handleSubmit(handleLogin)} noValidate>
                  {env.VITE_ENABLE_MOCK && (
                    <div className='border-primary/15 bg-primary/5 text-primary rounded-xl border p-3 text-sm'>
                      <strong className='block font-black'>Mock mode đang bật</strong>
                      <p className='mt-1 text-xs opacity-80'>Chọn nhanh tài khoản demo:</p>
                      <div className='mt-3 grid grid-cols-2 gap-2'>
                        {MOCK_ACCOUNTS.map((account) => (
                          <button
                            className='border-primary/15 hover:border-primary/35 rounded-lg border bg-white/75 px-3 py-2 text-left transition hover:bg-white'
                            key={account.label}
                            onClick={() => {
                              setValue('email', account.email, { shouldValidate: true })
                              setValue('password', account.password, { shouldValidate: true })
                            }}
                            type='button'
                          >
                            <strong className='block text-xs font-black'>{account.label}</strong>
                            <span className='mt-0.5 block truncate text-[10px] opacity-75'>
                              {account.email}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {loginMutation.isError && (
                    <div
                      className='border-destructive/20 bg-destructive/5 text-destructive rounded-xl border p-3 text-sm'
                      role='alert'
                    >
                      {getErrorMessage(
                        loginMutation.error,
                        'Đăng nhập thất bại. Vui lòng thử lại.'
                      )}
                    </div>
                  )}

                  <div className='space-y-2'>
                    <label className='text-foreground block text-sm font-bold' htmlFor='email'>
                      Email
                    </label>
                    <Input
                      {...register('email')}
                      aria-invalid={Boolean(errors.email)}
                      autoComplete='email'
                      className='h-12 rounded-xl bg-white/80 px-4 shadow-sm'
                      id='email'
                      placeholder='ban@example.com'
                      type='email'
                    />
                    {errors.email?.message && (
                      <p className='text-destructive text-xs font-medium'>{errors.email.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between gap-4'>
                      <label className='text-foreground block text-sm font-bold' htmlFor='password'>
                        Mật khẩu
                      </label>
                      <button
                        className='text-muted-foreground text-xs font-bold disabled:opacity-60'
                        disabled
                        title='Khôi phục mật khẩu chưa được hỗ trợ'
                        type='button'
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className='relative'>
                      <Input
                        {...register('password')}
                        aria-invalid={Boolean(errors.password)}
                        autoComplete='current-password'
                        className='h-12 rounded-xl bg-white/80 px-4 pr-12 shadow-sm'
                        id='password'
                        placeholder='Nhập mật khẩu'
                        type={showPassword ? 'text' : 'password'}
                      />
                      <button
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className='text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1 right-1 grid size-10 place-items-center rounded-lg transition'
                        onClick={() => setShowPassword((value) => !value)}
                        type='button'
                      >
                        {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                      </button>
                    </div>
                    {errors.password?.message && (
                      <p className='text-destructive text-xs font-medium'>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className='text-muted-foreground flex items-center gap-2.5 text-sm font-medium'>
                    <ShieldCheck className='text-secondary size-4' />
                    Phiên đăng nhập được giữ đến khi đóng trình duyệt
                  </div>

                  <Button
                    className='brand-gradient h-12 w-full rounded-xl text-base font-bold text-white shadow-[0_12px_26px_rgba(8,91,174,0.20)] hover:-translate-y-0.5 hover:brightness-95'
                    disabled={isSubmitting || loginMutation.isPending}
                    type='submit'
                  >
                    {isSubmitting || loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    {!isSubmitting && !loginMutation.isPending && <ArrowRight />}
                  </Button>
                </form>

                <p className='text-muted-foreground mt-7 text-center text-sm'>
                  Chưa có tài khoản?{' '}
                  <Link className='text-primary font-bold hover:underline' to='/register'>
                    Tạo tài khoản miễn phí
                  </Link>
                </p>
              </div>
            </div>

            <p className='text-muted-foreground mt-6 text-center text-xs leading-5'>
              Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
