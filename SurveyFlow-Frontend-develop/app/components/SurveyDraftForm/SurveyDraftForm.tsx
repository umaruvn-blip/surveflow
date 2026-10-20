import { useState, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import {
  CheckCircle2,
  ExternalLink,
  Link2,
  Unlink,
  RefreshCw,
  Loader2,
  Sparkles
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useInterestsQuery } from '@/hooks/queries/metadata/use-interests-query'
import { DEFAULT_SURVEY, googleFormId, surveySchema } from '@/schemas/survey.schema'
import type { SurveyDraftInput } from '@/types/survey-management.type'
import { getErrorMessage } from '@/utils/error'
import { notify } from '@/utils/notify'
import { googleFormsApi } from '@/apis/google-forms.api'
import { path } from '@/config/path'
import {
  useGoogleFormsConnectionStatusQuery,
  useGoogleFormsListQuery,
  useDisconnectGoogleFormsMutation
} from '@/hooks/queries/google-forms/use-google-forms'
import { QUERY_KEYS } from '@/constants/query-keys'

type Props = {
  initial?: SurveyDraftInput
  readOnly?: boolean
  isPublished?: boolean
  currentResponseCount?: number
  pending: boolean
  onSubmit: (values: SurveyDraftInput) => Promise<boolean | void>
  onDirtyChange?: (dirty: boolean) => void
  onVerifiedChange?: (verified: boolean) => void
}

export function SurveyDraftForm({
  initial,
  readOnly,
  isPublished = false,
  currentResponseCount,
  pending,
  onSubmit,
  onDirtyChange,
  onVerifiedChange
}: Props) {
  const queryClient = useQueryClient()
  const interests = useInterestsQuery()
  const googleStatus = useGoogleFormsConnectionStatusQuery()
  const isConnected = googleStatus.data?.connected ?? false
  const googleFormsList = useGoogleFormsListQuery(isConnected)
  const disconnectMutation = useDisconnectGoogleFormsMutation()
  const [connectingGoogle, setConnectingGoogle] = useState(false)
  const [selectedDriveFormId, setSelectedDriveFormId] = useState<string>('')
  const [checkingQuestion, setCheckingQuestion] = useState(false)

  const form = useForm<SurveyDraftInput>({
    mode: 'onChange',
    resolver: zodResolver(surveySchema),
    defaultValues: initial ?? DEFAULT_SURVEY
  })
  const values = useWatch({ control: form.control })
  const rewardCredit = values.rewardCredit ?? 10
  const targetCount = values.targetResponseCount ?? 0
  const totalReward = targetCount * rewardCredit
  const platformFee = targetCount * 1
  const budget = totalReward + platformFee
  const externalFormUrlValue = values.externalFormUrl || ''

  useEffect(() => {
    onVerifiedChange?.(isConnected)
  }, [isConnected, onVerifiedChange])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_FORMS_CONNECTED') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.googleForms.status })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.googleForms.list })
        setConnectingGoogle(false)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [queryClient])

  // Sync selected dropdown item with externalFormUrl
  useEffect(() => {
    if (externalFormUrlValue && googleFormsList.data) {
      const match = googleFormsList.data.find((f) => {
        const id = f.id || f.formId
        return (
          (id && externalFormUrlValue.includes(id)) ||
          (f.responderUri && externalFormUrlValue.includes(f.responderUri)) ||
          (f.responderUri && f.responderUri.includes(externalFormUrlValue))
        )
      })
      if (match) {
        setSelectedDriveFormId(match.id || match.formId || '')
      }
    }
  }, [externalFormUrlValue, googleFormsList.data])

  const handleConnectGoogle = async () => {
    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      'about:blank',
      'google_forms_auth',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    )

    try {
      setConnectingGoogle(true)
      const redirectUri = window.location.origin + path.googleFormsCallback
      const authUrl = await googleFormsApi.getAuthUrl(redirectUri)

      if (popup && !popup.closed) {
        popup.location.href = authUrl
      } else {
        window.location.href = authUrl
      }

      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer)
          setConnectingGoogle(false)
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.googleForms.status })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.googleForms.list })
        }
      }, 1000)
    } catch (err) {
      if (popup && !popup.closed) {
        popup.close()
      }
      setConnectingGoogle(false)
      console.error('Error initiating Google Forms connection:', err)
    }
  }

  const handleSelectForm = async (formId: string) => {
    setSelectedDriveFormId(formId)
    if (!formId) {
      return
    }
    const selected = googleFormsList.data?.find((f) => (f.id || f.formId) === formId)
    if (selected) {
      const formUrl = selected.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`
      form.setValue('externalFormUrl', formUrl, { shouldDirty: true, shouldValidate: true })

      if (selected.title && !form.getValues('title')) {
        form.setValue('title', selected.title, { shouldDirty: true, shouldValidate: true })
      }
      if (selected.description && !form.getValues('description')) {
        form.setValue('description', selected.description, {
          shouldDirty: true,
          shouldValidate: true
        })
      }
      if (selected.questionCount && !form.getValues('questionCount')) {
        form.setValue('questionCount', selected.questionCount, {
          shouldDirty: true,
          shouldValidate: true
        })
      }

      notify.success(`✓ Đã chọn Google Form: "${selected.title}"`)
    }
  }

  const handleManualCheckQuestion = async () => {
    const target = externalFormUrlValue || selectedDriveFormId
    if (!target || !target.trim()) {
      notify.error('Vui lòng chọn hoặc nhập đường dẫn Google Form trước khi kiểm tra.')
      return
    }
    const cleanId = googleFormId(target) || target.trim()
    try {
      setCheckingQuestion(true)
      const details = await googleFormsApi.getFormDetails(cleanId)
      notify.success(
        `✓ Google Form hợp lệ: "${details.title || cleanId}" (${details.questionCount || 0} câu hỏi). Hệ thống đã sẵn sàng tự động xác minh!`
      )
    } catch (e) {
      notify.error(
        getErrorMessage(e) || 'Không thể kiểm tra Google Form. Vui lòng kiểm tra quyền kết nối.'
      )
    } finally {
      setCheckingQuestion(false)
    }
  }
  const field = (
    name: FieldPath<SurveyDraftInput>,
    label: string,
    type = 'text',
    optional = false,
    disabled = false
  ) => {
    const error = form.getFieldState(name, form.formState).error
    const isDisabled = disabled || readOnly || pending
    return (
      <div key={name}>
        <div className='flex items-center justify-between'>
          <label className='text-sm font-bold' htmlFor={name}>
            {label}
          </label>
          {disabled && isPublished && (
            <span className='text-[11px] text-muted-foreground font-medium italic'>
              (Đã khóa khi xuất bản)
            </span>
          )}
        </div>
        <Input
          id={name}
          className='mt-2'
          type={type}
          disabled={isDisabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...form.register(name, {
            setValueAs:
              type === 'number'
                ? (v: string | number | null) =>
                    (v === '' || v === null) && optional ? null : Number(v)
                : optional
                  ? (v: string | null) => v?.trim() || null
                  : undefined
          })}
        />
        {error && (
          <p id={`${name}-error`} role='alert' className='text-destructive mt-1 text-sm'>
            {error.message}
          </p>
        )}
      </div>
    )
  }
  const textArea = (
    name: 'description' | 'researchPurpose' | 'participantInstructions' | 'dataUsageNotice',
    label: string
  ) => {
    const error = form.getFieldState(name, form.formState).error
    return (
      <div>
        <label htmlFor={name} className='text-sm font-bold'>
          {label}
        </label>
        <Textarea
          id={name}
          className='border-input bg-background focus-visible:ring-ring mt-2 min-h-24 w-full rounded-md border p-3 focus-visible:ring-2'
          aria-invalid={!!error}
          {...form.register(name, { setValueAs: (v: string | null) => v?.trim() || null })}
        />
        {error && (
          <p role='alert' className='text-destructive text-sm'>
            {error.message}
          </p>
        )}
      </div>
    )
  }
  return (
    <form
      className='space-y-6'
      onChange={() => onDirtyChange?.(true)}
      onSubmit={form.handleSubmit(async (data) => {
        const saved = await onSubmit(data)
        if (saved !== false) form.reset(data)
      })}
    >
      {isPublished && (
        <div className='rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-950 dark:text-blue-200 text-sm flex items-start gap-3'>
          <Sparkles className='size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5' />
          <div>
            <h4 className='font-bold'>Khảo sát đang xuất bản (PUBLISHED)</h4>
            <p className='text-xs mt-1 text-muted-foreground dark:text-blue-200/90 leading-relaxed'>
              Bạn có thể điều chỉnh <strong>Tiêu đề</strong>, <strong>Mô tả</strong>, <strong>Hướng dẫn</strong>, <strong>Thời lượng</strong>, <strong>Gia hạn thời gian kết thúc</strong> và <strong>Đối tượng tham gia</strong>. Chỉ có URL Form và Ngân sách/Xác minh là được khóa để đảm bảo an toàn kết nối và đối soát.
            </p>
          </div>
        </div>
      )}
      <fieldset disabled={pending || readOnly} className='grid min-w-0 gap-6 lg:grid-cols-2'>
        <section className='unisurvey-card min-w-0 space-y-5 p-5 sm:p-7'>
          <h2 className='text-xl font-black'>Thông tin khảo sát</h2>

          {/* Google Forms Connection & Form Picker Box */}
          <div className='rounded-xl border bg-muted/40 p-4 space-y-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex items-center gap-2.5'>
                <div className='size-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shadow-xs'>
                  GF
                </div>
                <div>
                  <div className='flex items-center gap-1.5'>
                    <h3 className='text-sm font-bold leading-none'>Google Forms</h3>
                    {isConnected && (
                      <span className='inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full'>
                        <CheckCircle2 className='size-3' /> Đã kết nối
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {isConnected
                      ? `${googleStatus.data?.googleEmail || 'Tài khoản Google'}`
                      : 'Kết nối tài khoản Google để chọn Form và xác minh tự động'}
                  </p>
                </div>
              </div>

              {isConnected ? (
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='text-xs h-7 px-2.5'
                    disabled={connectingGoogle || isPublished || readOnly}
                    onClick={handleConnectGoogle}
                  >
                    Đổi tài khoản
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10'
                    disabled={disconnectMutation.isPending || isPublished || readOnly}
                    onClick={() => disconnectMutation.mutate()}
                  >
                    <Unlink className='size-3 mr-1' />
                    Ngắt
                  </Button>
                </div>
              ) : (
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='text-xs h-8 font-semibold border-primary/30 text-primary hover:bg-primary/5'
                  disabled={connectingGoogle || isPublished || readOnly}
                  onClick={handleConnectGoogle}
                >
                  {connectingGoogle ? (
                    <Loader2 className='size-3.5 animate-spin mr-1.5' />
                  ) : (
                    <Link2 className='size-3.5 mr-1.5' />
                  )}
                  Kết nối Google Forms
                </Button>
              )}
            </div>

            {isConnected && (
              <div className='pt-2.5 border-t border-border/60 space-y-1.5'>
                <div className='flex items-center justify-between text-xs font-semibold'>
                  <label htmlFor='googleFormPicker' className='text-foreground'>
                    Chọn Form từ Google Drive của bạn:
                  </label>
                  <button
                    type='button'
                    onClick={() => googleFormsList.refetch()}
                    className='text-primary hover:underline inline-flex items-center gap-1 font-normal'
                  >
                    <RefreshCw
                      className={`size-3 ${googleFormsList.isFetching ? 'animate-spin' : ''}`}
                    />
                    Làm mới
                  </button>
                </div>

                <select
                  id='googleFormPicker'
                  className='border-input bg-background w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary'
                  value={selectedDriveFormId}
                  onChange={(e) => void handleSelectForm(e.target.value)}
                  disabled={googleFormsList.isLoading || isPublished || readOnly}
                >
                  <option value=''>
                    {googleFormsList.isLoading
                      ? 'Đang tải danh sách Google Forms...'
                      : '--- Nhấp để chọn Form từ Drive ---'}
                  </option>
                  {googleFormsList.data?.map((item) => {
                    const formId = item.id || item.formId
                    return (
                      <option key={formId} value={formId}>
                        {item.title} {item.questionCount ? `(${item.questionCount} câu hỏi)` : ''}
                      </option>
                    )
                  })}
                </select>
                {googleFormsList.isError && (
                  <p className='text-xs text-destructive'>
                    {getErrorMessage(googleFormsList.error) ||
                      'Không thể tải danh sách biểu mẫu từ Google Drive.'}
                  </p>
                )}
                {googleFormsList.data && googleFormsList.data.length === 0 && (
                  <p className='text-xs text-muted-foreground'>
                    Không tìm thấy Google Form nào trong tài khoản Google này.
                  </p>
                )}
              </div>
            )}

            {/* Thông tin xác minh tự động qua Google Forms API */}
            <div
              className={`rounded-lg border p-3.5 space-y-2 text-xs ${
                isConnected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                  : 'border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-1.5 font-bold'>
                  {isConnected ? (
                    <CheckCircle2 className='size-4 text-emerald-600 dark:text-emerald-400 shrink-0' />
                  ) : (
                    <span className='inline-flex size-4 items-center justify-center rounded-full bg-amber-500/30 text-[10px] font-black shrink-0'>
                      !
                    </span>
                  )}
                  {isConnected
                    ? 'Tự động xác minh qua Google Forms API'
                    : 'Yêu cầu kết nối tài khoản Google Forms:'}
                </div>

                {isConnected && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='text-xs h-7 px-2.5 font-medium shadow-2xs border-emerald-600/30 text-emerald-700 bg-white dark:bg-emerald-950/40 hover:bg-emerald-500/10'
                    disabled={checkingQuestion || (!externalFormUrlValue && !selectedDriveFormId) || isPublished || readOnly}
                    onClick={handleManualCheckQuestion}
                  >
                    {checkingQuestion ? (
                      <Loader2 className='size-3.5 animate-spin mr-1.5' />
                    ) : (
                      <RefreshCw className='size-3 mr-1.5' />
                    )}
                    {checkingQuestion ? 'Đang quét form...' : 'Kiểm tra Google Form'}
                  </Button>
                )}
              </div>

              <p className='leading-relaxed text-muted-foreground dark:text-emerald-200/90'>
                {isConnected
                  ? 'Hệ thống tự động đối soát phản hồi của người tham gia qua Email Google. Bạn không cần tạo thêm câu hỏi mã xác nhận nào trên Form.'
                  : 'Vui lòng bấm Kết nối Google Forms ở trên để xuất bản và tự động ghi nhận phản hồi khảo sát.'}
              </p>

              <div className='mt-2 rounded bg-background/60 p-2.5 border border-emerald-600/20 text-[11px] leading-relaxed'>
                💡 <strong>Khuyên dùng:</strong> Trong Google Form, hãy vào <strong>Cài đặt (Settings) ➔ Câu trả lời (Responses) ➔ Thu thập địa chỉ email: chọn &ldquo;Đã xác minh&rdquo; (Verified)</strong> hoặc &ldquo;Do người trả lời nhập&rdquo;. Điều này giúp SurveyFlow tự động xác nhận 100% lượt làm bài nhanh chóng và chính xác nhất.
              </div>
            </div>
          </div>

          {field('title', 'Tên khảo sát')}
          {field('externalFormUrl', 'URL Google Form đầy đủ (Link người trả lời)', 'url', false, isPublished)}
          <p className='text-muted-foreground text-xs mt-1'>
            Mở Google Form ➔ Bấm &ldquo;Gửi&rdquo; (Send) ➔ Sao chép link làm bài (dạng docs.google.com/forms/d/e/.../viewform hoặc forms.gle).
          </p>
          {textArea('description', 'Mô tả')}
          {textArea('researchPurpose', 'Mục đích nghiên cứu')}
          {textArea('participantInstructions', 'Hướng dẫn người tham gia')}
          <div className='grid gap-4 sm:grid-cols-2'>
            {field('estimatedDurationSeconds', 'Thời lượng dự kiến (giây)', 'number', true)}
            {field('questionCount', 'Số câu hỏi', 'number', true)}
          </div>
          {field('language', 'Ngôn ngữ', 'text', true)}
          <label className='flex items-center gap-2 text-sm font-bold'>
            <input type='checkbox' {...form.register('containsSensitiveQuestions')} />
            Có câu hỏi nhạy cảm
          </label>
          {textArea('dataUsageNotice', 'Thông báo sử dụng dữ liệu')}
        </section>
        <section className='unisurvey-card min-w-0 space-y-5 p-5 sm:p-7'>
          <h2 className='text-xl font-black'>Ngân sách và xác minh</h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            {field('rewardCredit', 'Credit thưởng / mỗi phản hồi', 'number', false, isPublished)}
            {field('targetResponseCount', 'Số phản hồi mong muốn', 'number', false, isPublished)}
          </div>
          <div className='bg-primary/5 rounded-xl p-4 space-y-2'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Thưởng cho người tham gia:</span>
              <span className='font-semibold text-foreground'>
                {targetCount} × {rewardCredit} = {Number.isFinite(totalReward) ? totalReward.toLocaleString('vi-VN') : 0} Credits
              </span>
            </div>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Phí dịch vụ nền tảng (1 Credit / phản hồi):</span>
              <span className='font-semibold text-foreground'>
                {targetCount} × 1 = {Number.isFinite(platformFee) ? platformFee.toLocaleString('vi-VN') : 0} Credits
              </span>
            </div>
            <div className='pt-2 border-t border-border/60 flex items-center justify-between font-bold text-sm text-foreground'>
              <span>Tổng chi phí xuất bản:</span>
              <span className='text-primary font-black text-base'>
                {Number.isFinite(budget) ? budget.toLocaleString('vi-VN') : '—'} Credits
              </span>
            </div>
            {isPublished && currentResponseCount !== undefined && (
              <div className='pt-2 border-t border-border/60 space-y-1.5'>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>Đã giải ngân ({currentResponseCount}/{targetCount} phản hồi):</span>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                    {(currentResponseCount * (rewardCredit + 1)).toLocaleString('vi-VN')} Credits
                  </span>
                </div>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>Còn lại trong quỹ (hoàn lại nếu đóng):</span>
                  <span className='font-bold text-primary'>
                    {(Math.max(0, targetCount - currentResponseCount) * (rewardCredit + 1)).toLocaleString('vi-VN')} Credits
                  </span>
                </div>
              </div>
            )}
          </div>
          <p className='text-muted-foreground text-xs'>
            💡 Lưu bản nháp hoàn toàn miễn phí. Chi phí trên chỉ được trừ từ ví khi bạn bấm Xuất bản khảo sát.
          </p>
          <div>
            <label htmlFor='deadline' className='text-sm font-bold'>
              Hạn kết thúc (giờ địa phương, tùy chọn)
            </label>
            <Input
              id='deadline'
              className='mt-2'
              type='datetime-local'
              defaultValue={initial?.deadline ? localDate(initial.deadline) : ''}
              onChange={(event) =>
                form.setValue(
                  'deadline',
                  event.target.value ? new Date(event.target.value).toISOString() : null,
                  { shouldDirty: true, shouldValidate: true }
                )
              }
            />
            {form.formState.errors.deadline && (
              <p role='alert' className='text-destructive'>
                {form.formState.errors.deadline.message}
              </p>
            )}
          </div>
          {field('slotTtlSeconds', 'Thời gian giữ chỗ (giây)', 'number')}
          <p className='text-muted-foreground text-sm'>
            Xác minh phản hồi tự động qua kết nối Google Forms API.
          </p>
          <div className='grid gap-4 sm:grid-cols-2'>
            {field('verification.minCompletionSeconds', 'Thời gian tối thiểu (giây)', 'number', false, isPublished)}
            {field('verification.maxCompletionSeconds', 'Thời gian tối đa (giây)', 'number', false, isPublished)}
          </div>
          {field('verification.maxAttempts', 'Số lần thử tối đa (1–10)', 'number', false, isPublished)}
          <h2 className='border-t pt-5 text-xl font-black'>Đối tượng tham gia (tùy chọn)</h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            {field('targeting.minBirthYear', 'Năm sinh tối thiểu', 'number', true)}
            {field('targeting.maxBirthYear', 'Năm sinh tối đa', 'number', true)}
          </div>
          <div>
            <label htmlFor='gender' className='text-sm font-bold'>
              Giới tính
            </label>
            <select
              id='gender'
              className='border-input mt-2 w-full rounded-md border p-2'
              disabled={readOnly || pending}
              {...form.register('targeting.gender', { setValueAs: (v: string) => v || null })}
            >
              <option value=''>Không giới hạn</option>
              <option value='MALE'>Nam</option>
              <option value='FEMALE'>Nữ</option>
              <option value='OTHER'>Khác</option>
              <option value='PREFER_NOT_TO_SAY'>Không muốn tiết lộ</option>
            </select>
          </div>
          {field('targeting.school', 'Trường học', 'text', true)}
          {field('targeting.occupation', 'Nghề nghiệp', 'text', true)}
          <fieldset>
            <legend className='text-sm font-bold'>Sở thích</legend>
            <div className='mt-2 flex flex-wrap gap-3'>
              {interests.data?.map((item) => (
                <label key={item.id} className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    disabled={readOnly || pending}
                    checked={values.targeting?.interestIds?.includes(item.id) ?? false}
                    onChange={(event) => {
                      const selected = form.getValues('targeting.interestIds') ?? []
                      form.setValue(
                        'targeting.interestIds',
                        event.target.checked
                          ? [...selected, item.id]
                          : selected.filter((id) => id !== item.id),
                        { shouldDirty: true }
                      )
                    }}
                  />
                  {item.name}
                </label>
              ))}
            </div>
            {interests.isPending && <p role='status'>Đang tải sở thích…</p>}
            {interests.isError && <p role='alert'>{getErrorMessage(interests.error)}</p>}
          </fieldset>
        </section>
      </fieldset>
      {!readOnly && (
        <Button type='submit' className='brand-gradient text-white' disabled={pending}>
          {pending
            ? 'Đang lưu…'
            : isPublished
              ? 'Cập nhật khảo sát'
              : 'Lưu bản nháp'}
        </Button>
      )}
    </form>
  )
}
function localDate(value: string) {
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
