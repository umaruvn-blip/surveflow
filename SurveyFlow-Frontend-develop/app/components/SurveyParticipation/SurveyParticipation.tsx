import { SURVEY_CODE_QUESTION } from '@/constants/survey'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useParticipation } from '@/hooks/queries/survey/use-participation'
import { useAuthStore } from '@/stores/auth-store'
import type { SurveyDetail } from '@/types/survey-management.type'
import { getErrorMessage } from '@/utils/error'
import { formatSurveyDate } from '@/utils/survey-discovery'
import { notify } from '@/utils/notify'
import { CheckCircle2, ExternalLink, Loader2, Sparkles, Mail, Edit2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'

const LABELS = {
  RESERVED: 'Đã giữ chỗ làm bài',
  SUBMITTED: 'Đang xác minh phản hồi',
  VERIFIED: 'Đã xác minh và nhận thưởng',
  VALID: 'Đã hoàn thành',
  REJECTED: 'Không được xác minh',
  EXPIRED: 'Lượt tham gia đã hết hạn',
  CANCELLED: 'Đã hủy'
}

export function SurveyParticipation({ survey }: { survey: SurveyDetail }) {
  const { query, reserve, code, verify } = useParticipation(survey.id)
  const user = useAuthStore((state) => state.user)
  const userId = user?.id

  const [now, setNow] = useState(Date.now)
  const [customEmail, setCustomEmail] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [showManualCode, setShowManualCode] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const participation = query.data
  const expired = !!participation && Date.parse(participation.slotExpiresAt) <= now
  const remaining = participation
    ? Math.max(0, Math.ceil((Date.parse(participation.codeAvailableAt) - now) / 1000))
    : 0
  const blocked =
    !userId ||
    userId === survey.creatorId ||
    survey.status !== 'PUBLISHED' ||
    survey.availableSlots <= 0 ||
    (!!survey.deadline && Date.parse(survey.deadline) <= now) ||
    survey.verification.method !== 'EXTERNAL_CODE'

  const effectiveEmail = (customEmail.trim() || user?.email || '').trim()
  const error = reserve.error || code.error || verify.error || query.error

  const handleVerify = () => {
    verify.mutate(
      {
        respondentEmail: effectiveEmail,
        completionCode: code.data?.completionCode
      },
      {
        onSuccess: () => {
          notify.success('Xác nhận thành công! Bạn đã nhận được điểm thưởng Credits.')
        },
        onError: (err) => {
          notify.error(getErrorMessage(err))
        }
      }
    )
  }

  return (
    <section className='space-y-4 border-t pt-5' aria-label='Đăng ký tham gia khảo sát'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-bold'>Tham gia khảo sát</h2>
        {participation?.status === 'VERIFIED' && (
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'>
            <CheckCircle2 className='h-3.5 w-3.5' /> Đã hoàn thành
          </span>
        )}
      </div>

      {!participation ? (
        <>
          <Button
            className='w-full'
            disabled={blocked || query.isPending || query.isError || reserve.isPending}
            onClick={() => reserve.mutate()}
          >
            {reserve.isPending ? 'Đang đăng ký...' : 'Đăng ký tham gia'}
          </Button>
          <p className='text-muted-foreground text-xs'>
            {userId === survey.creatorId
              ? 'Bạn không thể tham gia khảo sát của mình.'
              : survey.verification.method !== 'EXTERNAL_CODE'
                ? 'Luồng tham gia này chưa hỗ trợ phương thức xác minh của khảo sát.'
                : 'Đăng ký để giữ chỗ và nộp phản hồi Google Form nhận thưởng.'}
          </p>
        </>
      ) : participation.status === 'VERIFIED' ? (
        <div className='rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 dark:border-emerald-800/40 dark:bg-emerald-950/20'>
          <div className='flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm'>
            <Sparkles className='h-4 w-4' />
            Chúc mừng bạn đã hoàn thành khảo sát!
          </div>
          <p className='text-xs text-muted-foreground'>
            Hệ thống đã xác minh phản hồi Google Form của bạn và cộng thưởng{' '}
            <strong className='text-emerald-600 dark:text-emerald-400'>
              +{participation.rewardCredit || 10} Credits
            </strong>{' '}
            vào ví tài khoản.
          </p>
        </div>
      ) : (
        <>
          <div className='rounded-lg bg-muted/40 p-3 space-y-1'>
            <p role='status' className='text-sm font-semibold'>
              Trạng thái:{' '}
              <span className='font-bold text-primary'>
                {expired && participation.status === 'RESERVED'
                  ? LABELS.EXPIRED
                  : LABELS[participation.status] || participation.status}
              </span>
            </p>
            <p className='text-muted-foreground text-xs'>
              Hạn giữ chỗ: {formatSurveyDate(participation.slotExpiresAt)}
            </p>
          </div>

          {participation.status === 'RESERVED' && !expired && (
            <div className='space-y-4'>
              {/* Google Account Email Matching Card */}
              <div className='rounded-xl border bg-primary/5 p-3.5 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5 text-xs font-semibold text-foreground'>
                    <Mail className='h-4 w-4 text-primary' />
                    Email Google nộp bài:
                  </div>
                  {!isEditingEmail && (
                    <button
                      type='button'
                      onClick={() => setIsEditingEmail(true)}
                      className='inline-flex items-center gap-1 text-[11px] text-primary hover:underline'
                    >
                      <Edit2 className='h-3 w-3' /> Đổi email
                    </button>
                  )}
                </div>

                {isEditingEmail ? (
                  <div className='space-y-2'>
                    <Input
                      type='email'
                      placeholder='Nhập email Google bạn dùng để nộp form'
                      defaultValue={effectiveEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className='h-8 text-xs'
                    />
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 text-xs'
                        onClick={() => setIsEditingEmail(false)}
                      >
                        Xong
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='rounded-md bg-background px-3 py-1.5 border text-xs font-mono font-medium text-primary break-all'>
                    {effectiveEmail || '(Chưa có email tài khoản)'}
                  </div>
                )}

                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  💡 Hệ thống sẽ tự động đối chiếu phản hồi từ email Google này để cộng thưởng mà không cần nhập thêm câu hỏi nào trên biểu mẫu.
                </p>
              </div>

              {/* Step 1: Open Google Form */}
              {survey.externalFormUrl && (
                <a
                  href={survey.externalFormUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm'
                >
                  <ExternalLink className='h-4 w-4' />
                  1. Mở Google Form để làm bài
                </a>
              )}

              {/* Step 2: Confirm Submit Button */}
              <Button
                className='w-full font-semibold shadow-sm h-11'
                variant='outline'
                disabled={verify.isPending}
                onClick={handleVerify}
              >
                {verify.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang kiểm tra phản hồi từ Google Form...
                  </>
                ) : (
                  <>
                    <ShieldCheck className='mr-2 h-4 w-4 text-emerald-600' />
                    2. Tôi đã gửi bài — Xác nhận hoàn thành
                  </>
                )}
              </Button>

              {/* Optional Manual Completion Code Toggle (Fallback) */}
              <div className='border-t pt-2'>
                <button
                  type='button'
                  onClick={() => setShowManualCode(!showManualCode)}
                  className='flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground py-1'
                >
                  <span>Dùng mã xác nhận thủ công (Tùy chọn)</span>
                  {showManualCode ? <ChevronUp className='h-3.5 w-3.5' /> : <ChevronDown className='h-3.5 w-3.5' />}
                </button>

                {showManualCode && (
                  <div className='mt-2 bg-muted/40 rounded-lg p-3 space-y-2.5 text-xs'>
                    {!code.data ? (
                      <Button
                        className='w-full'
                        size='sm'
                        variant='secondary'
                        disabled={remaining > 0 || code.isPending}
                        onClick={() => {
                          setCopyMessage('')
                          code.mutate()
                        }}
                      >
                        {remaining > 0
                          ? `Lấy mã sau ${remaining} giây`
                          : code.isPending
                            ? 'Đang lấy mã...'
                            : 'Lấy mã xác nhận'}
                      </Button>
                    ) : (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between gap-2 bg-background p-2 rounded border'>
                          <span className='font-mono font-bold text-primary break-all'>
                            {code.data.completionCode}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 text-xs'
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(code.data!.completionCode)
                                setCopyMessage('Đã chép!')
                                setTimeout(() => setCopyMessage(''), 3000)
                              } catch {
                                setCopyMessage('Lỗi sao chép')
                              }
                            }}
                          >
                            {copyMessage || 'Sao chép'}
                          </Button>
                        </div>
                        <p className='text-[11px] text-muted-foreground'>
                          Nếu form có câu hỏi “{SURVEY_CODE_QUESTION}”, hãy dán mã trên vào trước khi gửi.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {['EXPIRED', 'CANCELLED'].includes(participation.status) && (
            <Button
              className='w-full'
              disabled={blocked || reserve.isPending}
              onClick={() => {
                code.reset()
                verify.reset()
                reserve.mutate()
              }}
            >
              Đăng ký lượt mới
            </Button>
          )}
        </>
      )}

      {error && (
        <div role='alert' className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium leading-relaxed'>
          {getErrorMessage(error)}
        </div>
      )}

      {query.isError && (
        <Button variant='outline' className='w-full' onClick={() => void query.refetch()}>
          Tải lại lượt tham gia
        </Button>
      )}
    </section>
  )
}

