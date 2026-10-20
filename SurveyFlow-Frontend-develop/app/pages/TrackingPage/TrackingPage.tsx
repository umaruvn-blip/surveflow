import { useState } from 'react'
import {
  Activity,
  BadgeCheck,
  ClipboardList,
  Coins,
  Globe,
  MousePointerClick,
  TriangleAlert,
  UserCheck
} from 'lucide-react'

import { getErrorMessage } from '@/utils/error'
import { useSurveyTrackingSummaryQuery } from '@/hooks/queries/survey/use-survey-queries'

export function TrackingPage() {
  const [scope, setScope] = useState<'mine' | 'global'>('mine')
  const query = useSurveyTrackingSummaryQuery(scope)
  const data = query.data

  const cards = [
    { label: 'Khảo sát đã đăng', value: data?.publishedCount, icon: ClipboardList },
    { label: 'Lượt mở Google Form', value: data?.formOpenCount, icon: MousePointerClick },
    { label: 'Hoàn thành hợp lệ', value: data?.completedCount, icon: BadgeCheck },
    {
      label: 'Tỷ lệ hoàn thành',
      value: data ? `${data.completionRate}%` : undefined,
      icon: Activity
    },
    { label: 'Credits đã cấp', value: data?.creditsAwarded, icon: Coins },
    { label: 'Mã chưa hợp lệ', value: data?.invalidCodeCount, icon: TriangleAlert }
  ]

  return (
    <div className='space-y-8'>
      <section className='unisurvey-window flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center'>
        <div>
          <span className='eyebrow'>Data tracking</span>
          <h1 className='mt-2 text-3xl font-black'>Theo dõi dữ liệu khảo sát</h1>
          <p className='text-muted-foreground mt-2'>
            Theo dõi hành trình từ lúc Google Form được mở đến khi phần thưởng được cấp.
          </p>
        </div>
        <div className='bg-muted/40 inline-flex items-center gap-1 rounded-xl p-1.5 border'>
          <button
            type='button'
            onClick={() => setScope('mine')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              scope === 'mine'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className='size-3.5' />
            Khảo sát của tôi
          </button>
          <button
            type='button'
            onClick={() => setScope('global')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              scope === 'global'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className='size-3.5' />
            Toàn sàn
          </button>
        </div>
      </section>

      {query.isError && <p role='alert'>{getErrorMessage(query.error)}</p>}

      <section className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {cards.map(({ label, value, icon: Icon }) => (
          <article className='unisurvey-card p-6' key={label}>
            <Icon className='text-primary size-7' />
            <p className='text-muted-foreground mt-5 text-sm font-bold'>{label}</p>
            <strong className='mt-1 block text-3xl font-black'>
              {query.isLoading || query.isError ? '—' : (value ?? 0)}
            </strong>
          </article>
        ))}
      </section>

      <section className='unisurvey-card p-6'>
        <h2 className='text-xl font-black'>Diễn giải chỉ số</h2>
        <div className='text-muted-foreground mt-5 grid gap-4 text-sm md:grid-cols-3'>
          <p>
            <b className='text-foreground'>Lượt mở</b> được ghi khi người dùng nhấn mở Google Form
            từ Survey Exchange.
          </p>
          <p>
            <b className='text-foreground'>Hoàn thành hợp lệ</b> được ghi khi người dùng dán mã hoàn
            tất và nhận thưởng.
          </p>
          <p>
            <b className='text-foreground'>Mã chưa hợp lệ</b> ghi các lần xác nhận trống; có thể mở
            rộng kiểm tra mã trùng ở backend.
          </p>
        </div>
      </section>
    </div>
  )
}
