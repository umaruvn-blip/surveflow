import { ArrowUpRight, Clock3, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import type { SurveySummary } from '@/types/survey-management.type'
import { formatSurveyDate, formatSurveyDuration, surveyProgress } from '@/utils/survey-discovery'

type Props = {
  survey: SurveySummary
  detailUrl: string
  category?: string
  matchScore?: number | null
}
export function SurveyDiscoveryCard({ survey, detailUrl, category, matchScore }: Props) {
  const percentage =
    matchScore != null ? Math.round(matchScore <= 1 ? matchScore * 100 : matchScore) : null

  return (
    <article className='unisurvey-card flex min-w-0 flex-col p-5 sm:p-6'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='bg-primary/8 text-primary rounded-full px-3 py-1 text-sm font-black'>
            +{survey.rewardCredit.toLocaleString('vi-VN')} Credits
          </span>
          {percentage != null && (
            <span className='bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 px-2.5 py-0.5 text-xs font-black'>
              <Sparkles className='size-3 text-emerald-600 dark:text-emerald-400' aria-hidden />
              Phù hợp {percentage}%
            </span>
          )}
        </div>
        <span className='text-muted-foreground text-xs font-bold'>
          {category ?? 'Khảo sát cộng đồng'}
        </span>
      </div>
      <h2 className='mt-5 text-lg leading-snug font-black'>
        <Link
          to={detailUrl}
          className='hover:text-primary focus-visible:ring-ring rounded-sm break-words focus-visible:ring-2'
        >
          {survey.title}
        </Link>
      </h2>
      <div className='text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm'>
        <span className='inline-flex items-center gap-1.5'>
          <Clock3 className='size-4' aria-hidden />
          {formatSurveyDuration(survey.estimatedDurationSeconds)}
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <Users className='size-4' aria-hidden />
          Còn {survey.availableSlots} chỗ
        </span>
      </div>
      <div className='mt-5 space-y-2'>
        <div className='text-muted-foreground flex justify-between gap-3 text-xs'>
          <span>
            {survey.currentResponseCount}/{survey.targetResponseCount} phản hồi
          </span>
          <span>{surveyProgress(survey)}%</span>
        </div>
        <progress
          className='accent-primary h-2 w-full'
          value={survey.currentResponseCount}
          max={Math.max(1, survey.targetResponseCount)}
          aria-label={`Tiến độ khảo sát ${survey.title}`}
        />
      </div>
      <p className='text-muted-foreground mt-3 text-xs'>
        {survey.deadline
          ? `Hạn kết thúc: ${formatSurveyDate(survey.deadline)} (GMT+7)`
          : 'Không đặt thời hạn'}
      </p>
      <Button asChild className='mt-5 w-full' variant='outline'>
        <Link to={detailUrl}>
          Xem chi tiết <ArrowUpRight aria-hidden />
        </Link>
      </Button>
    </article>
  )
}
