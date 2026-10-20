import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Clock3,
  Coins,
  ExternalLink,
  FileQuestionMark,
  ShieldCheck,
  Users
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'

import { SurveyParticipation } from '@/components/SurveyParticipation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { path } from '@/config/path'
import { useCategoriesQuery } from '@/hooks/queries/metadata/use-categories-query'
import { useInterestsQuery } from '@/hooks/queries/metadata/use-interests-query'
import { useSurveyDetailQuery } from '@/hooks/queries/survey/use-survey-discovery'
import { useAuthStore } from '@/stores/auth-store'
import type { SurveyDetail } from '@/types/survey-management.type'
import { getErrorMessage } from '@/utils/error'
import { getAxiosStatusCode } from '@/utils/http-error'
import {
  discoveryOptions,
  discoverySearch,
  formatSurveyDate,
  formatSurveyDuration
} from '@/utils/survey-discovery'

export function SurveyDetailPage() {
  const id = Number(useParams().surveyId)
  const [params] = useSearchParams()
  const query = useSurveyDetailQuery(id)
  const backUrl = `${path.exchange}?${discoverySearch(discoveryOptions(params))}`
  return (
    <div className='space-y-6'>
      <Button asChild variant='ghost' className='px-0'>
        <Link to={backUrl}>
          <ArrowLeft aria-hidden />
          Quay lại danh sách khảo sát
        </Link>
      </Button>
      {!Number.isSafeInteger(id) || id <= 0 ? (
        <section className='unisurvey-card p-6' role='alert'>
          <h1 className='text-xl font-black'>Mã khảo sát không hợp lệ</h1>
          <p className='text-muted-foreground mt-2'>
            Hãy chọn một khảo sát từ danh sách để xem chi tiết.
          </p>
        </section>
      ) : query.isPending ? (
        <section
          className='unisurvey-card space-y-6 p-6'
          role='status'
          aria-label='Đang tải chi tiết khảo sát'
        >
          <Skeleton className='h-10 w-3/4' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-48 w-full' />
        </section>
      ) : query.isError ? (
        <section className='unisurvey-card space-y-3 p-6' role='alert'>
          <h1 className='text-xl font-black'>
            {getAxiosStatusCode(query.error) === 404
              ? 'Không tìm thấy khảo sát'
              : 'Chưa tải được chi tiết khảo sát'}
          </h1>
          <p className='text-muted-foreground'>
            {getAxiosStatusCode(query.error) === 404
              ? 'Khảo sát không tồn tại hoặc bạn không có quyền xem.'
              : getErrorMessage(query.error)}
          </p>
          <Button
            variant='outline'
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Thử lại
          </Button>
        </section>
      ) : query.data ? (
        <SurveyDetailContent survey={query.data} backUrl={backUrl} />
      ) : null}
    </div>
  )
}

const PROVIDER_LABELS = {
  GOOGLE_FORMS: 'Google Forms',
  INTERNAL: 'Biểu mẫu SurveyFlow',
  OTHER: 'Biểu mẫu bên ngoài'
}
const METHOD_LABELS = {
  EXTERNAL_CODE: 'Mã hoàn thành qua biểu mẫu',
  INTERNAL_SUBMISSION: 'Gửi phản hồi trên SurveyFlow',
  MANUAL_REVIEW: 'Xác minh thủ công'
}
const GENDER_LABELS = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
  PREFER_NOT_TO_SAY: 'Không muốn chia sẻ'
}
const STATUS_LABELS = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đang mở',
  CLOSED: 'Đã đóng',
  ARCHIVED: 'Đã lưu trữ'
}

function SurveyDetailContent({ survey, backUrl }: { survey: SurveyDetail; backUrl: string }) {
  const categories = useCategoriesQuery()
  const interests = useInterestsQuery()
  const ownerId = useAuthStore((state) => state.user?.id)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])
  let formUrl: string | null = null
  try {
    const url = new URL(survey.externalFormUrl ?? '')
    if (url.protocol === 'https:' && !url.username && !url.password) formUrl = url.href
  } catch {
    // Missing or malformed external URLs cannot be opened.
  }
  const expired = !!survey.deadline && Date.parse(survey.deadline) <= now
  const target = survey.targeting
  const yearRange =
    target?.minBirthYear && target.maxBirthYear
      ? `${target.minBirthYear}–${target.maxBirthYear}`
      : target?.minBirthYear
        ? `Từ ${target.minBirthYear}`
        : target?.maxBirthYear
          ? `Đến ${target.maxBirthYear}`
          : 'Không giới hạn'
  const category = categories.data?.find((item) => item.id === survey.categoryId)?.name
  const content = (title: string, value: string | null, fallback: string) => (
    <section className='unisurvey-card space-y-3 p-5 sm:p-7'>
      <h2 className='text-xl font-black'>{title}</h2>
      <p className='text-muted-foreground leading-relaxed break-words whitespace-pre-wrap'>
        {value?.trim() || fallback}
      </p>
    </section>
  )
  return (
    <>
      <header className='unisurvey-window space-y-4 p-5 sm:p-8'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold'>
            {STATUS_LABELS[survey.status]}
          </span>
          <span className='text-muted-foreground text-sm'>{category ?? 'Khảo sát cộng đồng'}</span>
          {survey.containsSensitiveQuestions && (
            <span className='bg-destructive/10 text-destructive rounded-full px-3 py-1 text-xs font-bold'>
              Có câu hỏi nhạy cảm
            </span>
          )}
        </div>
        <h1 className='text-3xl leading-tight font-black break-words'>{survey.title}</h1>
        <div className='text-muted-foreground flex flex-wrap gap-x-6 gap-y-3 text-sm'>
          <span className='text-primary inline-flex items-center gap-2 font-bold lg:hidden'>
            <Coins className='size-4' aria-hidden />+{survey.rewardCredit.toLocaleString('vi-VN')}{' '}
            Credits
          </span>
          <span className='inline-flex items-center gap-2'>
            <Clock3 className='size-4' aria-hidden />
            {formatSurveyDuration(survey.estimatedDurationSeconds)}
          </span>
          <span className='inline-flex items-center gap-2'>
            <FileQuestionMark className='size-4' aria-hidden />
            {survey.questionCount ? `${survey.questionCount} câu hỏi` : 'Chưa cung cấp số câu hỏi'}
          </span>
          <span className='inline-flex items-center gap-2'>
            <Users className='size-4' aria-hidden />
            {survey.currentResponseCount}/{survey.targetResponseCount} phản hồi
          </span>
        </div>
      </header>
      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]'>
        <div className='min-w-0 space-y-5'>
          {content('Giới thiệu khảo sát', survey.description, 'Người tạo chưa cung cấp mô tả.')}
          {content(
            'Mục đích nghiên cứu',
            survey.researchPurpose,
            'Người tạo chưa cung cấp mục đích nghiên cứu.'
          )}
          {content(
            'Hướng dẫn người tham gia',
            survey.participantInstructions,
            'Người tạo chưa cung cấp hướng dẫn.'
          )}
          {content(
            'Thông báo sử dụng dữ liệu',
            survey.dataUsageNotice,
            'Người tạo chưa cung cấp thông báo sử dụng dữ liệu.'
          )}
          <section className='unisurvey-card space-y-4 p-5 sm:p-7'>
            <h2 className='text-xl font-black'>Đối tượng khảo sát</h2>
            <dl className='grid gap-4 text-sm sm:grid-cols-2'>
              <Info label='Năm sinh' value={yearRange} />
              <Info
                label='Giới tính'
                value={target?.gender ? GENDER_LABELS[target.gender] : 'Không giới hạn'}
              />
              <Info label='Trường học' value={target?.school || 'Không giới hạn'} />
              <Info label='Nghề nghiệp' value={target?.occupation || 'Không giới hạn'} />
            </dl>
            <div>
              <h3 className='text-muted-foreground text-sm'>Sở thích</h3>
              <div className='mt-2 flex flex-wrap gap-2'>
                {target?.interestIds.length ? (
                  target.interestIds.map((id) => (
                    <span className='bg-primary/5 rounded-full px-3 py-1 text-sm' key={id}>
                      {interests.data?.find((item) => item.id === id)?.name ??
                        'Sở thích được yêu cầu'}
                    </span>
                  ))
                ) : (
                  <p className='text-sm font-bold'>Không giới hạn</p>
                )}
              </div>
              {interests.isError && !!target?.interestIds.length && (
                <Button
                  size='sm'
                  variant='outline'
                  className='mt-2'
                  onClick={() => void interests.refetch()}
                >
                  Tải lại tên sở thích
                </Button>
              )}
            </div>
          </section>
        </div>
        <aside className='unisurvey-card space-y-5 p-5 sm:p-6'>
          <div>
            <span className='text-muted-foreground text-sm'>Phần thưởng mỗi phản hồi</span>
            <p className='text-primary mt-2 flex items-center gap-2 text-3xl font-black'>
              <Coins className='size-6' aria-hidden />
              {survey.rewardCredit.toLocaleString('vi-VN')}
              <span className='text-base'>Credits</span>
            </p>
          </div>
          <dl className='grid gap-4 border-t pt-5 text-sm'>
            <Info label='Chỗ còn lại' value={`${survey.availableSlots} chỗ`} />
            <Info label='Hạn kết thúc (GMT+7)' value={formatSurveyDate(survey.deadline)} />
            <Info
              label='Ngôn ngữ'
              value={
                survey.language === 'vi'
                  ? 'Tiếng Việt'
                  : survey.language === 'en'
                    ? 'Tiếng Anh'
                    : survey.language || 'Chưa cung cấp'
              }
            />
            <Info label='Biểu mẫu' value={PROVIDER_LABELS[survey.provider]} />
            <Info
              label='Xuất bản (GMT+7)'
              value={survey.publishedAt ? formatSurveyDate(survey.publishedAt) : 'Chưa xuất bản'}
            />
          </dl>
          <SurveyParticipation key={`${ownerId}:${survey.id}`} survey={survey} />
          <section className='min-w-0 space-y-3 border-t pt-5'>
            <h2 className='text-sm font-bold'>Link biểu mẫu khảo sát</h2>
            {formUrl ? (
              <>
                <a
                  href={formUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary block text-sm break-all underline underline-offset-4'
                >
                  {formUrl}
                </a>
                <Button asChild className='w-full'>
                  <a href={formUrl} target='_blank' rel='noopener noreferrer'>
                    <ExternalLink className='size-4' aria-hidden />
                    Mở biểu mẫu
                    <span className='sr-only'> (tab mới)</span>
                  </a>
                </Button>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  Đăng ký tham gia ở phía trên để giữ chỗ. Lấy mã xác nhận và nhập vào biểu mẫu
                  trước khi gửi để được xác minh và nhận Credits.
                </p>
              </>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Khảo sát chưa có link biểu mẫu hợp lệ.
              </p>
            )}
          </section>
          {(expired || survey.availableSlots === 0 || survey.status !== 'PUBLISHED') && (
            <p role='status' className='bg-muted rounded-xl p-3 text-sm'>
              {expired
                ? 'Khảo sát đã hết thời hạn.'
                : survey.status !== 'PUBLISHED'
                  ? 'Khảo sát hiện không mở cho người tham gia.'
                  : 'Khảo sát hiện không còn chỗ.'}
            </p>
          )}
          <div className='bg-primary/5 space-y-2 rounded-xl p-4'>
            <h2 className='flex items-center gap-2 text-sm font-bold'>
              <ShieldCheck className='size-4' aria-hidden />
              Cách xác minh phản hồi
            </h2>
            <p className='text-muted-foreground text-sm'>
              {METHOD_LABELS[survey.verification.method]}
            </p>
            <p className='text-muted-foreground text-xs'>
              Thời gian hoàn thành: {formatSurveyDuration(survey.verification.minCompletionSeconds)}
              –{formatSurveyDuration(survey.verification.maxCompletionSeconds)}.
            </p>
          </div>
          {ownerId === survey.creatorId && (
            <Button asChild variant='outline' className='w-full'>
              <Link to={`${path.mySurveys}/${survey.id}`}>Quản lý khảo sát của tôi</Link>
            </Button>
          )}
          <Button asChild variant='outline' className='w-full'>
            <Link to={backUrl}>Khám phá khảo sát khác</Link>
          </Button>
        </aside>
      </div>
    </>
  )
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='mt-1 font-bold break-words'>{value}</dd>
    </div>
  )
}
