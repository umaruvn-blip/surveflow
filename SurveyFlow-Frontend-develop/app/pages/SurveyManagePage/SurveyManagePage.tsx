import { useEffect, useState, useCallback } from 'react'
import { AlertDialog } from 'radix-ui'
import { Link, useParams } from 'react-router'
import { CheckCircle2, ChevronDown, ChevronUp, Rocket, Sparkles } from 'lucide-react'

import { SURVEY_CODE_QUESTION } from '@/constants/survey'
import { SurveyDraftForm } from '@/components/SurveyDraftForm'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { env } from '@/config/env'
import { useCreditWalletQuery } from '@/hooks/queries/credit/use-credit-queries'
import {
  useCreatorMutations,
  useCreatorSurveyQuery
} from '@/hooks/queries/survey/use-survey-creator'
import { useGoogleFormsConnectionStatusQuery } from '@/hooks/queries/google-forms/use-google-forms'
import { useAuthStore } from '@/stores/auth-store'
import { DEFAULT_SURVEY, googleFormId } from '@/schemas/survey.schema'
import type {
  SurveyDetail,
  SurveyDraftInput,
  SurveyWebhookConfiguration
} from '@/types/survey-management.type'
import { getErrorMessage } from '@/utils/error'
import { googleFormsScript } from '@/utils/google-forms-script'
import { notify } from '@/utils/notify'

export function SurveyManagePage() {
  const id = Number(useParams().surveyId)
  const query = useCreatorSurveyQuery(id)
  const userId = useAuthStore((state) => state.user?.id)
  if (!Number.isSafeInteger(id) || id <= 0) return <p role='alert'>Mã khảo sát không hợp lệ.</p>
  if (query.isPending) return <p role='status'>Đang tải khảo sát…</p>
  if (query.isError)
    return (
      <div role='alert'>
        <p>{getErrorMessage(query.error)}</p>
        <Button onClick={() => void query.refetch()}>Thử lại</Button>
      </div>
    )
  if (query.data.creatorId !== userId)
    return <p role='alert'>Bạn chỉ có thể quản lý khảo sát do mình tạo.</p>
  return <SurveyWorkspace key={id} survey={query.data} />
}

function SurveyWorkspace({ survey }: { survey: SurveyDetail }) {
  const query = useCreatorSurveyQuery(survey.id)
  const wallet = useCreditWalletQuery()
  const actions = useCreatorMutations()
  const [config, setConfig] = useState<SurveyWebhookConfiguration | null>(null)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<'publish' | 'close' | 'configure' | null>(null)
  const googleStatus = useGoogleFormsConnectionStatusQuery()
  const isGoogleConnected = googleStatus.data?.connected ?? false
  const [isFormCodeVerified, setIsFormCodeVerified] = useState(false)
  const handleVerifiedChange = useCallback((verified: boolean) => {
    setIsFormCodeVerified((prev) => (prev !== verified ? verified : prev))
  }, [])
  const isPublishReady = survey.verification.webhookVerified || isGoogleConnected
  const [showLegacyWebhook, setShowLegacyWebhook] = useState(false)
  const isDraft = survey.status === 'DRAFT'
  const isPublished = survey.status === 'PUBLISHED'
  const canEdit = isDraft || isPublished
  const supported =
    survey.provider === 'GOOGLE_FORMS' && survey.verification.method === 'EXTERNAL_CODE'
  const rewardCredit = survey.rewardCredit || 10
  const costPerResponse = rewardCredit + 1
  const budget = survey.targetResponseCount * costPerResponse
  const completedResponses = survey.currentResponseCount || 0
  const remainingResponses = Math.max(0, survey.targetResponseCount - completedResponses)
  const spentBudget = completedResponses * costPerResponse
  const remainingBudget = remainingResponses * costPerResponse
  const progressPercent =
    survey.targetResponseCount > 0
      ? Math.min(100, Math.round((completedResponses / survey.targetResponseCount) * 100))
      : 0
  const insufficient = wallet.data ? wallet.data.spendableBalance < budget : false
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const expired = !!survey.deadline && Date.parse(survey.deadline) <= now
  const busy = Object.values(actions).some((mutation) => mutation.isPending)
  const script = config
    ? googleFormsScript(config, env.VITE_API_BASE_URL, googleFormId(survey.externalFormUrl) ?? '')
    : ''
  async function run(action: () => Promise<unknown>, message: string) {
    setError(null)
    try {
      await action()
      notify.success(message)
      return true
    } catch (cause) {
      const message = getErrorMessage(cause)
      setError(message)
      notify.error(message)
      return false
    }
  }
  const initial: SurveyDraftInput = {
    categoryId: survey.categoryId,
    title: survey.title,
    description: survey.description,
    researchPurpose: survey.researchPurpose,
    participantInstructions: survey.participantInstructions,
    provider: 'GOOGLE_FORMS',
    externalFormUrl: survey.externalFormUrl ?? '',
    estimatedDurationSeconds: survey.estimatedDurationSeconds,
    questionCount: survey.questionCount,
    language: survey.language,
    containsSensitiveQuestions: survey.containsSensitiveQuestions,
    dataUsageNotice: survey.dataUsageNotice,
    rewardCredit: survey.rewardCredit,
    targetResponseCount: survey.targetResponseCount,
    slotTtlSeconds: survey.slotTtlSeconds,
    deadline: survey.deadline,
    verification: {
      method: 'EXTERNAL_CODE',
      minCompletionSeconds: survey.verification.minCompletionSeconds,
      maxCompletionSeconds: survey.verification.maxCompletionSeconds,
      maxAttempts: survey.verification.maxAttempts
    },
    targeting: survey.targeting ?? DEFAULT_SURVEY.targeting
  }
  return (
    <div className='space-y-6'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <Link to='/my-surveys' className='text-primary text-sm underline'>
            ← Khảo sát của tôi
          </Link>
          <h1 className='mt-2 text-3xl font-black'>{survey.title}</h1>
          <p className='text-muted-foreground mt-1'>
            {SURVEY_STATUS[survey.status]} · {survey.currentResponseCount}/
            {survey.targetResponseCount} phản hồi
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {isDraft && (
            <Button
              className='group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none h-auto'
              disabled={
                busy ||
                dirty ||
                !supported ||
                !isPublishReady ||
                expired ||
                insufficient ||
                !wallet.data
              }
              onClick={() => setConfirm('publish')}
            >
              <Rocket className='size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
              <span>Xuất bản khảo sát</span>
              <Sparkles className='size-3.5 text-amber-300 animate-pulse' />
            </Button>
          )}
          {isPublished && (
            <Button
              variant='destructive'
              disabled={busy}
              onClick={() => setConfirm('close')}
              className='font-bold px-5 py-2.5 h-auto text-sm'
            >
              Đóng khảo sát
            </Button>
          )}
        </div>
      </header>
      {error && (
        <p role='alert' className='text-destructive rounded-xl border p-4'>
          {error}
        </p>
      )}
      {dirty && (
        <p role='status' className='bg-primary/5 rounded-xl p-4'>
          {isPublished
            ? 'Có thay đổi chưa lưu. Vui lòng bấm "Cập nhật khảo sát" để lưu thay đổi.'
            : 'Có thay đổi chưa lưu. Lưu bản nháp trước khi cấu hình kết nối hoặc xuất bản.'}
        </p>
      )}
      {!supported && (
        <p role='alert'>
          Màn hình này hỗ trợ cấu hình Google Forms với mã hoàn thành. Khảo sát này chỉ có thể xem
          và đóng nếu đang mở.
        </p>
      )}

      <section className='unisurvey-card space-y-4 p-5 sm:p-7'>
        <h2 className='text-xl font-black'>Trạng thái & Ngân sách khảo sát</h2>
        
        {isDraft ? (
          <div className='bg-primary/5 rounded-xl p-4 space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Chi phí xuất bản dự kiến:</span>
              <span className='font-bold text-foreground'>{budget.toLocaleString('vi-VN')} Credits</span>
            </div>
            {wallet.data && (
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>Số dư khả dụng trong ví:</span>
                <span className={`font-semibold ${insufficient ? 'text-destructive font-bold' : 'text-foreground'}`}>
                  {wallet.data.spendableBalance.toLocaleString('vi-VN')} Credits
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className='bg-muted/40 rounded-xl p-4 space-y-3 border'>
            <div className='flex items-center justify-between text-sm font-bold'>
              <span>Tiến độ thu thập phản hồi</span>
              <span className='text-primary'>{completedResponses} / {survey.targetResponseCount} ({progressPercent}%)</span>
            </div>
            <div className='w-full bg-secondary/20 h-2 rounded-full overflow-hidden'>
              <div
                className='bg-primary h-full transition-all duration-300'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs'>
              <div className='bg-background p-3 rounded-lg border'>
                <span className='text-muted-foreground block mb-1'>Tổng ngân sách xuất bản:</span>
                <span className='font-bold text-sm text-foreground'>{budget.toLocaleString('vi-VN')} Credits</span>
              </div>
              <div className='bg-background p-3 rounded-lg border'>
                <span className='text-muted-foreground block mb-1'>Đã giải ngân ({completedResponses} lượt):</span>
                <span className='font-bold text-sm text-emerald-600 dark:text-emerald-400'>
                  {spentBudget.toLocaleString('vi-VN')} Credits
                </span>
              </div>
              <div className='bg-background p-3 rounded-lg border'>
                <span className='text-muted-foreground block mb-1'>Còn lại ({remainingResponses} lượt):</span>
                <span className='font-bold text-sm text-primary'>
                  {remainingBudget.toLocaleString('vi-VN')} Credits
                </span>
              </div>
            </div>
          </div>
        )}

        {wallet.isPending && <p role='status'>Đang tải số dư…</p>}
        {wallet.isError && (
          <div role='alert'>
            <p>{getErrorMessage(wallet.error)}</p>
            <Button variant='outline' onClick={() => void wallet.refetch()}>
              Tải lại số dư
            </Button>
          </div>
        )}
        {isDraft && (
          <>
            <p className='text-muted-foreground text-sm'>
              Xuất bản sẽ trừ {budget.toLocaleString('vi-VN')} Credits và mở khảo sát cho người tham gia phù hợp.
            </p>
            {!isGoogleConnected && !survey.verification.webhookVerified && (
              <p className='text-destructive text-sm'>
                Cần kết nối Google Forms hoặc xác minh webhook trước khi xuất bản.
              </p>
            )}
            {isGoogleConnected && (
              <p className='text-emerald-600 dark:text-emerald-400 text-sm font-medium'>
                ✓ Đã kết nối Google Forms. Hệ thống sẽ tự động xác minh phản hồi của người tham gia.
              </p>
            )}
            {expired && <p className='text-destructive'>Thời hạn đã hết. Hãy cập nhật bản nháp.</p>}
            {insufficient && (
              <p className='text-destructive'>
                Credits khả dụng không đủ.{' '}
                <Link className='underline' to='/credits'>
                  Xem ví Credits
                </Link>
              </p>
            )}
            <Button
              className='group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none h-auto'
              disabled={
                busy ||
                dirty ||
                !supported ||
                !isPublishReady ||
                expired ||
                insufficient ||
                !wallet.data
              }
              onClick={() => setConfirm('publish')}
            >
              <Rocket className='size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
              <span>Xuất bản khảo sát ngay</span>
              <Sparkles className='size-3.5 text-amber-300 animate-pulse' />
            </Button>
          </>
        )}
        {survey.status === 'PUBLISHED' && (
          <>
            <p className='text-muted-foreground text-sm'>
              Đóng khảo sát sẽ ngừng nhận lượt tham gia mới. Hệ thống sẽ tự động hoàn lại{' '}
              <strong className='text-foreground'>{remainingBudget.toLocaleString('vi-VN')} Credits</strong> ({remainingResponses} lượt chưa có người làm × {costPerResponse} Credits) vào ví của bạn.
            </p>
            <Button variant='destructive' disabled={busy} onClick={() => setConfirm('close')}>
              Đóng khảo sát
            </Button>
          </>
        )}
        {survey.status === 'CLOSED' && (
          <div className='space-y-1 text-sm text-muted-foreground'>
            <p className='font-medium text-foreground'>Khảo sát đã đóng.</p>
            {remainingResponses > 0 && (
              <p className='text-xs'>
                Số dư chưa sử dụng ({remainingBudget.toLocaleString('vi-VN')} Credits cho {remainingResponses} lượt) đã được hoàn trả về ví khi đóng khảo sát.
              </p>
            )}
          </div>
        )}
      </section>
      <SurveyDraftForm
        key={survey.id}
        initial={initial}
        readOnly={!canEdit || !supported}
        isPublished={isPublished}
        currentResponseCount={survey.currentResponseCount}
        pending={busy}
        onDirtyChange={setDirty}
        onVerifiedChange={handleVerifiedChange}
        onSubmit={async (payload) => {
          return run(async () => {
            await actions.save.mutateAsync({ id: survey.id, payload })
            if (payload.externalFormUrl !== survey.externalFormUrl) setConfig(null)
            setDirty(false)
          }, isPublished ? 'Đã cập nhật thông tin khảo sát.' : 'Đã cập nhật bản nháp.')
        }}
      />
      <section className='unisurvey-card space-y-4 p-5 sm:p-7'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <h2 className='text-xl font-black flex items-center gap-2'>
            {isGoogleConnected ? (
              <CheckCircle2 className='size-5 text-emerald-500' />
            ) : null}
            Xác minh phản hồi Google Forms
          </h2>
          {isGoogleConnected && (
            <span className='inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full'>
              Tự động xác minh qua API
            </span>
          )}
        </div>

        {isGoogleConnected ? (
          <div className='space-y-2'>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              Đã kết nối tài khoản Google: <strong>{googleStatus.data?.googleEmail}</strong>. Hệ thống
              sẽ tự động đối soát câu trả lời qua Google Forms API khi có người tham gia hoàn thành
              khảo sát. Bạn không cần cấu hình Webhook thủ công.
            </p>
            <div className='rounded-lg bg-background p-3 border border-emerald-600/20 text-xs text-muted-foreground leading-relaxed'>
              💡 <strong>Mẹo:</strong> Hãy vào <strong>Cài đặt (Settings) ➔ Câu trả lời (Responses) ➔ Thu thập địa chỉ email: chọn &ldquo;Đã xác minh&rdquo; (Verified)</strong> trên Google Form của bạn để hệ thống tự động ghi nhận kết quả cho người làm bài tức thì.
            </div>
          </div>
        ) : (
          <p className='text-muted-foreground text-sm leading-relaxed'>
            Bạn có thể kết nối tài khoản Google Forms ở phần biểu mẫu bên trên để hệ thống tự động
            xác minh lượt làm khảo sát mà không cần cài đặt Apps Script phức tạp.
          </p>
        )}

        <div className='pt-2 border-t'>
          <button
            type='button'
            onClick={() => setShowLegacyWebhook(!showLegacyWebhook)}
            className='text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium'
          >
            {showLegacyWebhook ? (
              <ChevronUp className='size-3.5' />
            ) : (
              <ChevronDown className='size-3.5' />
            )}
            {showLegacyWebhook
              ? 'Ẩn cấu hình Webhook thủ công'
              : 'Tùy chọn nâng cao: Cấu hình Webhook thủ công (Dự phòng)'}
          </button>
        </div>

        {showLegacyWebhook && (
          <div className='pt-3 space-y-4 border-t'>
            <p
              role='status'
              className={
                survey.verification.webhookVerified
                  ? 'text-secondary font-bold'
                  : 'text-muted-foreground'
              }
            >
              {survey.verification.webhookVerified
                ? 'Đã xác minh kết nối webhook thủ công'
                : 'Chưa xác minh kết nối webhook thủ công'}
            </p>
            <ol className='text-muted-foreground list-decimal space-y-2 pl-5 text-sm'>
              <li>
                Thêm đúng một câu hỏi trả lời ngắn bắt buộc tên “{SURVEY_CODE_QUESTION}” trong
                Google Form.
              </li>
              <li>Sinh cấu hình bên dưới. Mở Apps Script từ Google Form và dán script.</li>
              <li>
                Chạy setupSurveyFlow để cấp quyền và cài trigger. Chạy verifyConnection để kiểm tra
                kết nối thật.
              </li>
              <li>Quay lại đây và bấm “Kiểm tra trạng thái kết nối”.</li>
            </ol>
            <div className='flex flex-wrap gap-3'>
              {isDraft && supported && (
                <Button
                  variant='outline'
                  disabled={busy || dirty}
                  onClick={() => setConfirm('configure')}
                >
                  {config || survey.verification.webhookVerified
                    ? 'Sinh lại cấu hình webhook'
                    : 'Sinh cấu hình webhook'}
                </Button>
              )}
              <Button
                variant='outline'
                disabled={busy || dirty || query.isFetching || !supported}
                onClick={() =>
                  void run(async () => {
                    const result = await query.refetch()
                    if (result.error) throw result.error
                    if (!result.data?.verification.webhookVerified)
                      throw new Error(
                        'Chưa xác minh. Hãy chạy verifyConnection trong Apps Script rồi kiểm tra lại.'
                      )
                  }, 'Kết nối Google Forms đã được xác minh.')
                }
              >
                {query.isFetching ? 'Đang kiểm tra…' : 'Kiểm tra trạng thái kết nối'}
              </Button>
            </div>
            {config && isDraft && (
              <div className='space-y-3'>
                <p className='text-sm font-bold'>
                  Script chứa token chỉ hiển thị trong phiên này. Sao chép vào Apps Script trước khi
                  rời trang.
                </p>
                <label htmlFor='apps-script' className='text-sm font-bold'>
                  Google Apps Script
                </label>
                <Textarea
                  id='apps-script'
                  readOnly
                  value={script}
                  className='h-80 w-full resize-y font-mono text-xs'
                />
                <Button
                  variant='outline'
                  onClick={() =>
                    void run(() => navigator.clipboard.writeText(script), 'Đã sao chép script.')
                  }
                >
                  Sao chép script
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
      <AlertDialog.Root
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirm(null)
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className='bg-foreground/40 fixed inset-0 z-50' />
          <AlertDialog.Content className='bg-background fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-xl'>
            <AlertDialog.Title className='text-xl font-black'>
              {confirm === 'publish'
                ? 'Xuất bản khảo sát?'
                : confirm === 'close'
                  ? 'Đóng khảo sát?'
                  : 'Sinh cấu hình webhook?'}
            </AlertDialog.Title>
            <AlertDialog.Description className='text-muted-foreground mt-3'>
              {confirm === 'publish'
                ? `Hệ thống sẽ trừ ${budget.toLocaleString('vi-VN')} Credits (${survey.targetResponseCount} phản hồi × (${rewardCredit} thưởng + 1 phí nền tảng)). Sau khi xuất bản, bạn có thể chỉnh sửa thông tin mô tả, đối tượng tham gia, gia hạn thời gian và không thể thay đổi URL Form hay Ngân sách phản hồi.`
                : confirm === 'close'
                  ? `Khảo sát ngừng nhận lượt tham gia mới. Hệ thống sẽ tự động hoàn lại ${remainingBudget.toLocaleString('vi-VN')} Credits (${remainingResponses} lượt chưa có người làm × ${costPerResponse} Credits) vào ví của bạn.`
                  : 'Token cũ sẽ bị vô hiệu hóa và trạng thái kết nối được đặt lại. Bạn cần cập nhật script và kiểm tra kết nối.'}
            </AlertDialog.Description>
            {error && (
              <p role='alert' className='text-destructive mt-3'>
                {error}
              </p>
            )}
            <div className='mt-6 flex justify-end gap-3'>
              <AlertDialog.Cancel asChild>
                <Button variant='outline' disabled={busy}>
                  Hủy
                </Button>
              </AlertDialog.Cancel>
              <Button
                disabled={busy}
                onClick={() =>
                  void run(
                    async () => {
                      if (confirm === 'configure') {
                        setConfig(null)
                        setConfig(await actions.configure.mutateAsync(survey.id))
                      }
                      if (confirm === 'publish') {
                        await actions.publish.mutateAsync(survey.id)
                        setConfig(null)
                      }
                      if (confirm === 'close') await actions.close.mutateAsync(survey.id)
                      setConfirm(null)
                    },
                    confirm === 'configure'
                      ? 'Đã sinh cấu hình webhook.'
                      : confirm === 'publish'
                        ? 'Đã xuất bản khảo sát.'
                        : 'Đã đóng khảo sát.'
                  )
                }
              >
                {busy ? 'Đang xử lý…' : 'Xác nhận'}
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
export const SURVEY_STATUS = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đang mở',
  CLOSED: 'Đã đóng',
  ARCHIVED: 'Đã lưu trữ'
} as const
