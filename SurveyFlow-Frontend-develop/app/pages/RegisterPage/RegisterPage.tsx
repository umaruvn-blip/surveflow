import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  BriefcaseBusiness,
  Coins,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { path } from '@/config/path'
import { useRegisterMutation } from '@/hooks/queries/auth/use-register-mutation'
import { registerRequestSchema } from '@/schemas/auth-schema'
import { getErrorMessage } from '@/utils/error'
import { safeInternalPath } from '@/utils/redirect'

type RegisterFormValues = z.infer<typeof registerRequestSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const registerMutation = useRegisterMutation()
  const redirectTo = safeInternalPath(searchParams.get('redirectTo'))
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {
      accountType: 'STUDENT',
      fullName: '',
      university: '',
      major: '',
      company: '',
      jobTitle: '',
      email: '',
      referralCode: searchParams.get('ref')?.trim().toUpperCase() ?? '',
      password: '',
      confirmPassword: ''
    }
  })
  const accountType = useWatch({ control, name: 'accountType' })

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(values)
      navigate(redirectTo, { replace: true })
    } catch {
      /* Form hiển thị lỗi từ mutation. */
    }
  }

  return (
    <main className='auth-shell'>
      <Link className='unisurvey-back-link' to={path.home}>
        <ArrowLeft className='size-4' /> Về trang chủ
      </Link>
      <section className='flex min-h-screen items-center justify-center p-5'>
        <div className='unisurvey-register-card grid w-full max-w-4xl overflow-hidden md:grid-cols-[.9fr_1.1fr]'>
          <aside className='unisurvey-register-visual p-8 text-white'>
            <Coins className='size-10' />
            <h1 className='mt-7 text-3xl font-black'>Bắt đầu với Credits miễn phí</h1>
            <p className='mt-4 text-white/75'>
              Tạo tài khoản để đăng khảo sát, hoàn thành khảo sát, lên cấp và đổi phần thưởng.
            </p>
            <div className='mt-6 rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-xs'>
              <div className='flex items-center gap-2 text-amber-300'>
                <Sparkles className='size-4 fill-amber-300' />
                <span className='text-xs font-black uppercase tracking-wider'>Ưu đãi Early Bird</span>
              </div>
              <p className='mt-1 text-sm font-bold text-white'>
                Tặng ngay <strong className='text-amber-300 underline underline-offset-2'>300 Credits</strong> (+100 Credits) cho thành viên mới!
              </p>
            </div>
            <ul className='mt-6 grid gap-4 text-sm font-bold'>
              <li>
                <Coins className='mr-2 inline size-4' />
                Nhận Credits khi hoàn thành khảo sát
              </li>
              <li>
                <GraduationCap className='mr-2 inline size-4' />
                Theo dõi XP và cấp độ
              </li>
              <li>
                <ShieldCheck className='mr-2 inline size-4' />
                AI Quality Check
              </li>
            </ul>
          </aside>
          <section className='p-8'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='eyebrow'>Tạo tài khoản</span>
              <span className='inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-black text-amber-700 dark:text-amber-300'>
                <Zap className='size-3 fill-amber-500 text-amber-500' /> +100 Credits Early Bird
              </span>
            </div>
            <h2 className='mt-2 text-3xl font-black'>Tham gia SurveyFlow</h2>
            <p className='text-muted-foreground mt-2'>
              Bắt đầu hành trình nghiên cứu của bạn hôm nay và nhận ngay 300 Credits.
            </p>
            <form className='mt-6 grid gap-4' onSubmit={handleSubmit(handleRegister)} noValidate>
              {registerMutation.isError && (
                <div
                  className='border-destructive/20 bg-destructive/5 text-destructive rounded-xl border p-3 text-sm'
                  role='alert'
                >
                  {getErrorMessage(registerMutation.error, 'Đăng ký thất bại. Vui lòng thử lại.')}
                </div>
              )}
              <div>
                <p className='text-sm font-bold'>Bạn đang:</p>
                <div className='mt-2 grid grid-cols-2 gap-2'>
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${accountType === 'STUDENT' ? 'border-primary bg-primary/8 text-primary' : 'hover:bg-muted'}`}
                  >
                    <input
                      className='sr-only'
                      type='radio'
                      value='STUDENT'
                      {...register('accountType')}
                    />
                    <GraduationCap className='size-4' />
                    Đi học
                  </label>
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${accountType === 'WORKER' ? 'border-primary bg-primary/8 text-primary' : 'hover:bg-muted'}`}
                  >
                    <input
                      className='sr-only'
                      type='radio'
                      value='WORKER'
                      {...register('accountType')}
                    />
                    <BriefcaseBusiness className='size-4' />
                    Đi làm
                  </label>
                </div>
              </div>
              <div>
                <label className='text-sm font-bold' htmlFor='full-name'>
                  {accountType === 'STUDENT' ? 'Họ và tên' : 'Tên đầy đủ'}
                </label>
                <Input
                  className='mt-2'
                  {...register('fullName')}
                  aria-invalid={Boolean(errors.fullName)}
                  autoComplete='name'
                  id='full-name'
                  placeholder='Nguyễn Văn A'
                />
                {errors.fullName?.message && (
                  <p className='text-destructive mt-1 text-xs'>{errors.fullName.message}</p>
                )}
              </div>
              {accountType === 'STUDENT' ? (
                <>
                  <div>
                    <label className='text-sm font-bold' htmlFor='university'>
                      Trường đại học
                    </label>
                    <Input
                      className='mt-2'
                      {...register('university')}
                      aria-invalid={Boolean(errors.university)}
                      autoComplete='organization'
                      id='university'
                      placeholder='Trường Đại học FPT'
                    />
                    {errors.university?.message && (
                      <p className='text-destructive mt-1 text-xs'>{errors.university.message}</p>
                    )}
                  </div>
                  <div>
                    <label className='text-sm font-bold' htmlFor='major'>
                      Chuyên ngành
                    </label>
                    <Input
                      className='mt-2'
                      {...register('major')}
                      aria-invalid={Boolean(errors.major)}
                      id='major'
                      placeholder='Kỹ thuật phần mềm'
                    />
                    {errors.major?.message && (
                      <p className='text-destructive mt-1 text-xs'>{errors.major.message}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className='text-sm font-bold' htmlFor='company'>
                      Công ty
                    </label>
                    <Input
                      className='mt-2'
                      {...register('company')}
                      aria-invalid={Boolean(errors.company)}
                      autoComplete='organization'
                      id='company'
                      placeholder='Tên công ty'
                    />
                    {errors.company?.message && (
                      <p className='text-destructive mt-1 text-xs'>{errors.company.message}</p>
                    )}
                  </div>
                  <div>
                    <label className='text-sm font-bold' htmlFor='job-title'>
                      Công việc
                    </label>
                    <Input
                      className='mt-2'
                      {...register('jobTitle')}
                      aria-invalid={Boolean(errors.jobTitle)}
                      id='job-title'
                      placeholder='Ví dụ: Kỹ sư phần mềm'
                    />
                    {errors.jobTitle?.message && (
                      <p className='text-destructive mt-1 text-xs'>{errors.jobTitle.message}</p>
                    )}
                  </div>
                </>
              )}
              <div>
                <label className='text-sm font-bold' htmlFor='email'>
                  Email
                </label>
                <Input
                  className='mt-2'
                  {...register('email')}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete='email'
                  id='email'
                  placeholder='ban@example.com'
                  type='email'
                />
                {errors.email?.message && (
                  <p className='text-destructive mt-1 text-xs'>{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className='text-sm font-bold' htmlFor='referral-code'>
                  Mã giới thiệu <span className='text-muted-foreground font-normal'>(không bắt buộc)</span>
                </label>
                <Input
                  className='mt-2'
                  {...register('referralCode')}
                  aria-invalid={Boolean(errors.referralCode)}
                  autoCapitalize='characters'
                  id='referral-code'
                  placeholder='Nhập mã bạn bè chia sẻ'
                />
                {errors.referralCode?.message && (
                  <p className='text-destructive mt-1 text-xs'>{errors.referralCode.message}</p>
                )}
              </div>
              <div className='relative'>
                <label className='text-sm font-bold' htmlFor='password'>
                  Mật khẩu
                </label>
                <Input
                  className='mt-2'
                  {...register('password')}
                  aria-invalid={Boolean(errors.password)}
                  autoComplete='new-password'
                  id='password'
                  placeholder='Nhập mật khẩu'
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className='text-muted-foreground absolute right-1 bottom-1 grid size-8 place-items-center rounded-md'
                  onClick={() => setShowPassword((value) => !value)}
                  type='button'
                >
                  {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                </button>
                {errors.password?.message && (
                  <p className='text-destructive mt-1 text-xs'>{errors.password.message}</p>
                )}
              </div>
              <div className='relative'>
                <label className='text-sm font-bold' htmlFor='confirm-password'>
                  Xác nhận mật khẩu
                </label>
                <Input
                  className='mt-2'
                  {...register('confirmPassword')}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  autoComplete='new-password'
                  id='confirm-password'
                  placeholder='Nhập lại mật khẩu'
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <button
                  aria-label={
                    showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'
                  }
                  className='text-muted-foreground absolute right-1 bottom-1 grid size-8 place-items-center rounded-md'
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  type='button'
                >
                  {showConfirmPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                </button>
                {errors.confirmPassword?.message && (
                  <p className='text-destructive mt-1 text-xs'>{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button
                className='brand-gradient mt-2 h-11 text-white'
                disabled={isSubmitting || registerMutation.isPending}
                type='submit'
              >
                {isSubmitting || registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </Button>
            </form>
            <p className='text-muted-foreground mt-4 text-xs text-center leading-relaxed'>
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Link className='text-primary hover:underline font-semibold' to={path.termsOfService}>
                Điều khoản dịch vụ
              </Link>{' '}
              và{' '}
              <Link className='text-primary hover:underline font-semibold' to={path.privacyPolicy}>
                Chính sách quyền riêng tư
              </Link>
              .
            </p>
            <p className='text-muted-foreground mt-4 text-sm'>
              Đã có tài khoản?{' '}
              <Link className='text-primary font-bold hover:underline' to={path.login}>
                Đăng nhập
              </Link>
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
