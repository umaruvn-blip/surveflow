import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  CircleAlert,
  Copy,
  Heart,
  LoaderCircle,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { env } from '@/config/env'
import { useStartGoogleLinkMutation } from '@/hooks/queries/auth/use-start-google-link-mutation'
import { useInterestsQuery } from '@/hooks/queries/metadata/use-interests-query'
import {
  useProfileQuery,
  useReplaceInterestsMutation,
  useUpdateProfileMutation
} from '@/hooks/queries/profile/use-profile-queries'
import {
  profileFormSchema,
  profileFormValues,
  profileUpdatePayload,
  type ProfileFormValues
} from '@/schemas/profile-schema'
import type { UserProfile } from '@/types/profile.type'
import { getErrorMessage } from '@/utils/error'
import { notify } from '@/utils/notify'
import { cn } from '@/utils/utils'

function FormError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className='text-destructive mt-1.5 text-xs' id={id} role='alert'>
      {message}
    </p>
  ) : null
}

function ProfileDetailsForm({ profile }: { profile: UserProfile }) {
  const updateProfile = useUpdateProfileMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileFormValues(profile)
  })

  const submit = async (values: ProfileFormValues) => {
    try {
      const saved = await updateProfile.mutateAsync(profileUpdatePayload(values))
      reset(profileFormValues(saved))
    } catch {
      /* Giữ dữ liệu đang nhập và hiển thị lỗi dưới form. */
    }
  }

  return (
    <section className='unisurvey-card p-5 sm:p-7' aria-labelledby='profile-details-title'>
      <div className='flex items-start gap-3'>
        <span className='bg-primary/8 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl'>
          <UserRound className='size-5' />
        </span>
        <div>
          <h2 id='profile-details-title' className='text-xl font-black'>
            Thông tin cá nhân
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            Giúp SurveyFlow tìm khảo sát phù hợp với bạn. Các trường đều tùy chọn.
          </p>
        </div>
      </div>
      <form className='mt-6' onSubmit={handleSubmit(submit)} noValidate>
        <fieldset disabled={updateProfile.isPending} className='grid min-w-0 gap-5 sm:grid-cols-2'>
          <div className='sm:col-span-2'>
            <label className='text-sm font-bold' htmlFor='profile-name'>
              Tên hiển thị
            </label>
            <Input
              className='mt-2'
              id='profile-name'
              autoComplete='name'
              placeholder='Bạn muốn được gọi là gì?'
              {...register('displayName')}
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby='profile-name-error'
            />
            <FormError id='profile-name-error' message={errors.displayName?.message} />
          </div>
          <div>
            <label className='text-sm font-bold' htmlFor='profile-year'>
              Năm sinh
            </label>
            <Input
              className='mt-2'
              id='profile-year'
              inputMode='numeric'
              placeholder='Ví dụ: 2002'
              {...register('birthYear')}
              aria-invalid={Boolean(errors.birthYear)}
              aria-describedby='profile-year-error'
            />
            <FormError id='profile-year-error' message={errors.birthYear?.message} />
          </div>
          <div>
            <label className='text-sm font-bold' htmlFor='profile-gender'>
              Giới tính
            </label>
            <select
              className='border-input bg-background focus-visible:ring-ring/50 mt-2 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3 disabled:opacity-50'
              id='profile-gender'
              {...register('gender')}
              aria-invalid={Boolean(errors.gender)}
              aria-describedby='profile-gender-error'
            >
              <option value=''>Chưa cung cấp</option>
              <option value='MALE'>Nam</option>
              <option value='FEMALE'>Nữ</option>
              <option value='OTHER'>Khác</option>
              <option value='PREFER_NOT_TO_SAY'>Không muốn chia sẻ</option>
            </select>
            <FormError id='profile-gender-error' message={errors.gender?.message} />
          </div>
          <div>
            <label className='text-sm font-bold' htmlFor='profile-school'>
              Trường học
            </label>
            <Input
              className='mt-2'
              id='profile-school'
              placeholder='Tên trường của bạn'
              {...register('school')}
              aria-invalid={Boolean(errors.school)}
              aria-describedby='profile-school-error'
            />
            <FormError id='profile-school-error' message={errors.school?.message} />
          </div>
          <div>
            <label className='text-sm font-bold' htmlFor='profile-occupation'>
              Nghề nghiệp
            </label>
            <Input
              className='mt-2'
              id='profile-occupation'
              placeholder='Ví dụ: Sinh viên, Kỹ sư'
              {...register('occupation')}
              aria-invalid={Boolean(errors.occupation)}
              aria-describedby='profile-occupation-error'
            />
            <FormError id='profile-occupation-error' message={errors.occupation?.message} />
          </div>
          <div className='sm:col-span-2'>
            <label className='text-sm font-bold' htmlFor='profile-bio'>
              Giới thiệu ngắn
            </label>
            <Textarea
              className='mt-2 min-h-28 resize-y'
              id='profile-bio'
              placeholder='Một vài điều về bạn và chủ đề bạn quan tâm...'
              {...register('bio')}
              aria-invalid={Boolean(errors.bio)}
              aria-describedby='profile-bio-hint profile-bio-error'
            />
            <p className='text-muted-foreground mt-1.5 text-xs' id='profile-bio-hint'>
              Tối đa 2.000 ký tự.
            </p>
            <FormError id='profile-bio-error' message={errors.bio?.message} />
          </div>
        </fieldset>
        {updateProfile.isError && (
          <p className='bg-destructive/5 text-destructive mt-5 rounded-xl p-3 text-sm' role='alert'>
            {getErrorMessage(updateProfile.error, 'Chưa lưu được hồ sơ. Vui lòng thử lại.')}
          </p>
        )}
        <div className='border-border mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5'>
          <p className='text-muted-foreground text-xs' role='status'>
            {isDirty ? 'Bạn có thay đổi chưa lưu.' : 'Thông tin đã được lưu.'}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              type='button'
              disabled={!isDirty || updateProfile.isPending}
              onClick={() => {
                reset(profileFormValues(profile))
                updateProfile.reset()
              }}
            >
              <RotateCcw /> Hủy thay đổi
            </Button>
            <Button type='submit' disabled={!isDirty || updateProfile.isPending}>
              {updateProfile.isPending ? <LoaderCircle className='animate-spin' /> : <Save />}
              {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}

function ProfileInterestsForm({ profile }: { profile: UserProfile }) {
  const catalog = useInterestsQuery()
  const updateInterests = useReplaceInterestsMutation()
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm<{ interestIds: number[] }>({
    defaultValues: { interestIds: profile.interests.map((item) => item.id) }
  })
  const selected = useWatch({ control, name: 'interestIds' })
  const options = [
    ...(catalog.data ?? []).map((item) => ({ ...item, active: true })),
    ...profile.interests.filter((item) => !catalog.data?.some((entry) => entry.id === item.id))
  ]
  const hasInactive = options.some((item) => !item.active && selected.includes(item.id))

  const submit = async ({ interestIds }: { interestIds: number[] }) => {
    try {
      const saved = await updateInterests.mutateAsync(interestIds)
      reset({ interestIds: saved.interests.map((item) => item.id) })
    } catch {
      /* Giữ lựa chọn hiện tại khi request thất bại. */
    }
  }

  return (
    <section className='unisurvey-card p-5 sm:p-7' aria-labelledby='profile-interests-title'>
      <div className='flex items-start gap-3'>
        <span className='bg-secondary/10 text-secondary flex size-10 shrink-0 items-center justify-center rounded-xl'>
          <Heart className='size-5' />
        </span>
        <div>
          <h2 className='text-xl font-black' id='profile-interests-title'>
            Sở thích của bạn
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            Chọn những chủ đề bạn quan tâm để nhận gợi ý khảo sát phù hợp.
          </p>
        </div>
      </div>
      {catalog.isPending ? (
        <div className='mt-6 flex gap-2'>
          <Skeleton className='h-10 w-28 rounded-full' />
          <Skeleton className='h-10 w-28 rounded-full' />
        </div>
      ) : catalog.isError ? (
        <div className='mt-5' role='alert'>
          <p className='text-destructive text-sm'>
            {getErrorMessage(catalog.error, 'Không tải được danh mục sở thích.')}
          </p>
          <Button className='mt-3' variant='outline' onClick={() => void catalog.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        <form className='mt-6' onSubmit={handleSubmit(submit)}>
          <fieldset disabled={updateInterests.isPending}>
            <legend className='text-muted-foreground mb-3 text-xs'>
              Có thể chọn nhiều chủ đề · Đã chọn {selected.length}
            </legend>
            {options.length === 0 ? (
              <p className='text-muted-foreground text-sm'>Chưa có chủ đề để lựa chọn.</p>
            ) : (
              <div className='flex flex-wrap gap-2.5'>
                {options.map((item) => {
                  const checked = selected.includes(item.id)
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        'focus-within:ring-primary/40 relative flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition focus-within:ring-3',
                        checked
                          ? 'border-primary bg-primary/8 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted',
                        !item.active && !checked && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <input
                        className='sr-only'
                        type='checkbox'
                        checked={checked}
                        disabled={!item.active && !checked}
                        onChange={() =>
                          setValue(
                            'interestIds',
                            checked
                              ? selected.filter((id) => id !== item.id)
                              : [...selected, item.id],
                            { shouldDirty: true }
                          )
                        }
                      />
                      {checked && <Check className='size-3.5' />}
                      {item.name}
                      {!item.active && <span className='text-xs'>(ngừng hoạt động)</span>}
                    </label>
                  )
                })}
              </div>
            )}
          </fieldset>
          {hasInactive && (
            <p className='text-destructive mt-4 text-sm' role='alert'>
              Bỏ chọn chủ đề đã ngừng hoạt động trước khi lưu.
            </p>
          )}
          {updateInterests.isError && (
            <p
              className='bg-destructive/5 text-destructive mt-4 rounded-xl p-3 text-sm'
              role='alert'
            >
              {getErrorMessage(updateInterests.error, 'Chưa lưu được sở thích. Vui lòng thử lại.')}
            </p>
          )}
          <div className='border-border mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5'>
            <p className='text-muted-foreground text-xs' role='status'>
              {isDirty ? 'Lựa chọn của bạn chưa được lưu.' : 'Sở thích đã được lưu.'}
            </p>
            <Button type='submit' disabled={!isDirty || updateInterests.isPending || hasInactive}>
              {updateInterests.isPending ? <LoaderCircle className='animate-spin' /> : <Save />}
              {updateInterests.isPending ? 'Đang lưu...' : 'Lưu sở thích'}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}

function ReferralInviteCard({ referralCode }: { referralCode: string }) {
  const [origin, setOrigin] = useState('')
  const referralLink = origin
    ? `${origin}/register?ref=${encodeURIComponent(referralCode)}`
    : ''

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      notify.success('Đã sao chép link mời bạn bè.')
    } catch {
      notify.error('Không thể sao chép link. Vui lòng thử lại.')
    }
  }

  return (
    <section className='unisurvey-card p-5 sm:p-7' aria-labelledby='referral-invite-title'>
      <div>
        <h2 id='referral-invite-title' className='text-xl font-black'>
          Mời bạn bè tham gia
        </h2>
        <p className='text-muted-foreground mt-1 text-sm'>
          Chia sẻ đường dẫn này để bạn bè đăng ký với mã giới thiệu của bạn.
        </p>
      </div>
      <div className='mt-5 flex flex-col gap-3 sm:flex-row'>
        <Input
          aria-label='Link mời bạn bè'
          className='min-w-0 flex-1'
          readOnly
          value={referralLink || `Mã giới thiệu: ${referralCode}`}
        />
        <Button disabled={!referralLink} onClick={() => void copyReferralLink()}>
          <Copy /> Sao chép link
        </Button>
      </div>
    </section>
  )
}

export function ProfilePage() {
  const profileQuery = useProfileQuery()
  const googleLink = useStartGoogleLinkMutation()
  const profile = profileQuery.data

  if (profileQuery.isPending)
    return (
      <div aria-busy='true' aria-label='Đang tải hồ sơ' className='grid gap-6'>
        <Skeleton className='h-48 w-full rounded-3xl' />
        <Skeleton className='h-96 w-full rounded-3xl' />
      </div>
    )
  if (!profile)
    return (
      <section className='unisurvey-card p-8' role='alert'>
        <CircleAlert className='text-destructive mb-4 size-8' />
        <h1 className='text-xl font-black'>Chưa tải được hồ sơ</h1>
        <p className='text-muted-foreground mt-2'>
          {getErrorMessage(profileQuery.error, 'Vui lòng thử lại sau.')}
        </p>
        <Button
          className='mt-5'
          onClick={() => void profileQuery.refetch()}
          disabled={profileQuery.isFetching}
        >
          Thử lại
        </Button>
      </section>
    )

  const name = profile.displayName || 'Thành viên SurveyFlow'
  const initials = (profile.displayName || profile.email)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      <section className='unisurvey-window overflow-hidden p-0'>
        <div className='brand-gradient h-20 sm:h-24' />
        <div className='px-5 pb-6 sm:px-7'>
          <div className='bg-background text-primary -mt-10 flex size-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white text-xl font-black shadow-sm'>
            {profile.avatarUrl ? (
              <img
                className='size-full object-cover'
                src={profile.avatarUrl}
                alt='Ảnh đại diện'
                referrerPolicy='no-referrer'
              />
            ) : (
              initials
            )}
          </div>
          <p className='eyebrow mt-5'>Tài khoản của bạn</p>
          <h1 className='mt-1 text-2xl font-black tracking-tight sm:text-3xl'>Hồ sơ cá nhân</h1>
          <p className='mt-2 font-semibold'>{name}</p>
          <p className='text-muted-foreground mt-1 flex items-center gap-2 text-sm break-all'>
            <Mail className='size-4 shrink-0' />
            {profile.email}
          </p>
        </div>
      </section>
      <ReferralInviteCard referralCode={profile.referralCode} />
      <ProfileDetailsForm key={`details-${profile.userId}`} profile={profile} />
      <ProfileInterestsForm key={`interests-${profile.userId}`} profile={profile} />
      {!env.VITE_ENABLE_MOCK && (
        <section className='unisurvey-card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-7'>
          <div>
            <h2 className='flex items-center gap-2 font-bold'>
              <ShieldCheck className='text-primary size-5' />
              Phương thức đăng nhập
            </h2>
            <p className='text-muted-foreground mt-1 text-sm'>
              Liên kết Google để thêm một cách đăng nhập vào tài khoản.
            </p>
          </div>
          <Button
            variant='outline'
            disabled={googleLink.isPending}
            onClick={() =>
              googleLink.mutate(undefined, {
                onSuccess: (authorizationPath) =>
                  window.location.assign(new URL(authorizationPath, env.VITE_API_BASE_URL).href),
                onError: (error) => notify.error(getErrorMessage(error))
              })
            }
          >
            {googleLink.isPending ? 'Đang chuyển hướng...' : 'Liên kết Google'}
          </Button>
        </section>
      )}
    </div>
  )
}
