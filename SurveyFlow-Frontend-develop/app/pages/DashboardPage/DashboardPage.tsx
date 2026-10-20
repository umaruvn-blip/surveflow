import { ArrowRight, BarChart3, ClipboardList, Coins, Users } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { path } from '@/config/path'
import { useAuthStore } from '@/stores/auth-store'
import { useCreditWalletQuery } from '@/hooks/queries/credit/use-credit-queries'
import { useSurveyTrackingSummaryQuery } from '@/hooks/queries/survey/use-survey-queries'
import { useCreatorSurveysQuery } from '@/hooks/queries/survey/use-survey-creator'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const walletQuery = useCreditWalletQuery()
  const trackingQuery = useSurveyTrackingSummaryQuery('mine')
  const mySurveysQuery = useCreatorSurveysQuery(1)

  const surveyCount = mySurveysQuery.data?.totalElements ?? trackingQuery.data?.publishedCount ?? 0
  const responseCount = trackingQuery.data?.completedCount ?? 0
  const creditBalance = walletQuery.data?.balance ?? 0
  const xpCount = trackingQuery.data?.xpAwarded ?? 0

  const stats = [
    { label: 'Khảo sát đang có', value: surveyCount, icon: ClipboardList },
    { label: 'Phản hồi thu thập', value: responseCount, icon: Users },
    { label: 'Credits hiện có', value: creditBalance.toLocaleString('vi-VN'), icon: Coins }
  ]

  const isLoading = walletQuery.isLoading || trackingQuery.isLoading || mySurveysQuery.isLoading

  return (
    <div>
      <section className='unisurvey-window dashboard-hero flex flex-col justify-between gap-6 p-7 sm:flex-row sm:items-center sm:p-9'>
        <div className='max-w-2xl'>
          <span className='eyebrow'>Dashboard Overview</span>
          <h1 className='text-foreground mt-3 text-3xl font-black tracking-tight sm:text-4xl'>
            Xin chào, {user?.fullName || user?.email.split('@')[0] || 'bạn'}!
          </h1>
          <p className='text-muted-foreground mt-3'>
            Theo dõi khảo sát, Credits và chất lượng phản hồi của bạn trong một không gian rõ ràng.
          </p>
          <div className='mt-4 flex flex-wrap gap-2'>
            {user?.roles.map((role) => (
              <span
                className='bg-primary/8 text-primary rounded-full px-3 py-1 text-xs font-black'
                key={role}
              >
                ROLE: {role}
              </span>
            ))}
          </div>
        </div>
        <Button asChild className='brand-gradient mt-6 h-11 rounded-xl px-5 text-white' size='lg'>
          <Link to={path.mySurveys}>
            Quản lý khảo sát <ArrowRight />
          </Link>
        </Button>
      </section>
      <section className='mt-7 grid gap-5 sm:grid-cols-3'>
        {stats.map(({ label, value, icon: Icon }) => (
          <article className='unisurvey-card p-6' key={label}>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm font-bold'>{label}</span>
              <span className='bg-primary/8 text-primary grid size-10 place-items-center rounded-xl'>
                <Icon className='size-4' />
              </span>
            </div>
            <strong className='text-foreground mt-4 block text-3xl font-black'>
              {isLoading ? '—' : value}
            </strong>
          </article>
        ))}
      </section>
      <section className='unisurvey-card mt-7 p-6'>
        <div className='flex items-center gap-3'>
          <span className='bg-secondary/10 text-secondary grid size-10 place-items-center rounded-xl'>
            <BarChart3 />
          </span>
          <div>
            <h2 className='text-foreground font-black'>Tiến trình cộng đồng</h2>
            <p className='text-muted-foreground text-sm'>
              Bạn đang có {isLoading ? '—' : xpCount} XP. Hoàn thành khảo sát để nhận
              thêm Credits và mở khóa cấp độ mới.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
