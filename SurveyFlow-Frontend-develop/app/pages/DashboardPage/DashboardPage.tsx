import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  Coins,
  GraduationCap,
  Layers,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { path } from '@/config/path'
import { useAuthStore } from '@/stores/auth-store'
import { useCreditWalletQuery } from '@/hooks/queries/credit/use-credit-queries'
import { useSurveyTrackingSummaryQuery } from '@/hooks/queries/survey/use-survey-queries'
import { useCreatorSurveysQuery } from '@/hooks/queries/survey/use-survey-creator'
import { useAdminTrackingSummaryQuery } from '@/hooks/queries/admin/use-admin-tracking'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const walletQuery = useCreditWalletQuery()
  const trackingQuery = useSurveyTrackingSummaryQuery('mine')
  const mySurveysQuery = useCreatorSurveysQuery(1)
  const adminTrackingQuery = useAdminTrackingSummaryQuery()

  const surveyCount = mySurveysQuery.data?.totalElements ?? trackingQuery.data?.publishedCount ?? 0
  const responseCount = trackingQuery.data?.completedCount ?? 0
  const creditBalance = walletQuery.data?.balance ?? 0
  const xpCount = trackingQuery.data?.xpAwarded ?? 0

  const personalStats = [
    { label: 'Khảo sát của bạn', value: surveyCount, icon: ClipboardList },
    { label: 'Phản hồi thu thập', value: responseCount, icon: Users },
    { label: 'Credits trong ví', value: creditBalance.toLocaleString('vi-VN'), icon: Coins }
  ]

  const isLoadingPersonal = walletQuery.isLoading || trackingQuery.isLoading || mySurveysQuery.isLoading

  // Dữ liệu thống kê toàn sàn
  const trackingData = adminTrackingQuery.data
  const userStats = trackingData?.userStats
  const surveyStats = trackingData?.surveyStats
  const creditStats = trackingData?.creditStats
  const topUniversities = trackingData?.topUniversities ?? []
  const topOccupations = trackingData?.topOccupations ?? []
  const topCategories = trackingData?.topCategories ?? []
  const isLoadingSystem = adminTrackingQuery.isLoading

  return (
    <div className='space-y-8'>
      {/* 1. Hero Header */}
      <section className='unisurvey-window dashboard-hero flex flex-col justify-between gap-6 p-7 sm:flex-row sm:items-center sm:p-9'>
        <div className='max-w-2xl'>
          <span className='eyebrow'>Dashboard Overview</span>
          <h1 className='text-foreground mt-3 text-3xl font-black tracking-tight sm:text-4xl'>
            Xin chào, {user?.fullName || user?.email.split('@')[0] || 'bạn'}!
          </h1>
          <p className='text-muted-foreground mt-3'>
            Theo dõi khảo sát, Credits và các chỉ số hoạt động toàn hệ thống trong một không gian trực quan.
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
        <div className='flex flex-wrap items-center gap-3'>
          <Button asChild className='brand-gradient h-11 rounded-xl px-5 text-white' size='lg'>
            <Link to={path.mySurveys}>
              Quản lý khảo sát <ArrowRight className='size-4' />
            </Link>
          </Button>
          <Button asChild variant='outline' className='h-11 rounded-xl px-5' size='lg'>
            <Link to={path.exchange}>
              Đổi khảo sát
            </Link>
          </Button>
        </div>
      </section>

      {/* 2. Chỉ số cá nhân & Tiến trình */}
      <section className='space-y-4'>
        <div className='flex items-center gap-2 border-b pb-2'>
          <Sparkles className='size-4 text-primary' />
          <h2 className='text-base font-bold text-foreground'>Hoạt động của bạn</h2>
        </div>
        <div className='grid gap-5 sm:grid-cols-4'>
          {personalStats.map(({ label, value, icon: Icon }) => (
            <article className='unisurvey-card p-5' key={label}>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-xs font-bold uppercase tracking-wider'>{label}</span>
                <span className='bg-primary/10 text-primary grid size-8 place-items-center rounded-lg'>
                  <Icon className='size-4' />
                </span>
              </div>
              <strong className='text-foreground mt-3 block text-2xl font-black'>
                {isLoadingPersonal ? '—' : value}
              </strong>
            </article>
          ))}
          <article className='unisurvey-card p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-xs font-bold uppercase tracking-wider'>Điểm kinh nghiệm</span>
              <span className='bg-secondary/10 text-secondary grid size-8 place-items-center rounded-lg'>
                <BarChart3 className='size-4' />
              </span>
            </div>
            <strong className='text-foreground mt-3 block text-2xl font-black'>
              {isLoadingPersonal ? '—' : `${xpCount} XP`}
            </strong>
          </article>
        </div>
      </section>

      {/* 3. Thống kê Hiệu suất & Chỉ số Toàn hệ thống */}
      <section className='space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3'>
          <div>
            <div className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary'>
              <Activity className='size-3.5' />
              <span>Performance Analytics</span>
            </div>
            <h2 className='text-lg font-black text-foreground'>Thống kê Hoạt động & Hiệu suất Toàn sàn</h2>
            <p className='text-xs text-muted-foreground'>
              Tổng quan quy mô người dùng, tiến độ hoàn thành khảo sát và dòng tiền Credits trong hệ thống.
            </p>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Card 1: Total Users */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-primary/10 p-2 text-primary'>
                <Users className='size-5' />
              </span>
              <span className='rounded-md bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary'>
                +{userStats?.newUsersLast7Days ?? 0} Weekly Growth
              </span>
            </div>
            <div>
              <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Total Users</p>
              <strong className='mt-1 block text-3xl font-black text-foreground'>
                {isLoadingSystem ? '—' : (userStats?.totalUsers ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Tổng số người dùng được ghi nhận</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <GraduationCap className='size-3.5 text-primary' /> {userStats?.studentCount ?? 0} Sinh viên
              </span>
              <span className='flex items-center gap-1'>
                <Building2 className='size-3.5 text-secondary' /> {userStats?.workerCount ?? 0} Đi làm
              </span>
            </div>
          </article>

          {/* Card 2: Total Surveys */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400'>
                <ClipboardList className='size-5' />
              </span>
              <span className='rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
                {surveyStats?.activeSurveys ?? 0} Open Surveys
              </span>
            </div>
            <div>
              <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Total Surveys</p>
              <strong className='mt-1 block text-3xl font-black text-foreground'>
                {isLoadingSystem ? '—' : (surveyStats?.totalSurveys ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Mức tạo khảo sát toàn hệ thống</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span className='font-medium text-amber-600 dark:text-amber-400'>
                {surveyStats?.draftSurveys ?? 0} Bản nháp
              </span>
              <span>{surveyStats?.closedSurveys ?? 0} Đã đóng</span>
            </div>
          </article>

          {/* Card 3: Valid Completions */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400'>
                <BadgeCheck className='size-5' />
              </span>
              <span className='rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary'>
                {surveyStats?.completionRate ?? 0}% Valid Rate
              </span>
            </div>
            <div>
              <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Valid Completions</p>
              <strong className='mt-1 block text-3xl font-black text-foreground'>
                {isLoadingSystem ? '—' : (surveyStats?.validCompletions ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Số lượt hoàn thành khảo sát hợp lệ</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span>{surveyStats?.totalFormOpens ?? 0} Lượt mở form</span>
              <span className='text-rose-500 font-medium'>{surveyStats?.invalidCodes ?? 0} Lỗi mã</span>
            </div>
          </article>

          {/* Card 4: Credits in Circulation */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-amber-500/10 p-2 text-amber-500'>
                <Coins className='size-5' />
              </span>
              <span className='rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400'>
                Lưu thông
              </span>
            </div>
            <div>
              <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Credits in Circulation</p>
              <strong className='mt-1 block text-3xl font-black text-amber-600 dark:text-amber-400'>
                {isLoadingSystem ? '—' : (creditStats?.totalCreditsInWallets?.toLocaleString('vi-VN') ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Tổng Credits đang lưu thông</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span>Đã giải ngân:</span>
              <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                {creditStats?.creditsAwarded?.toLocaleString('vi-VN') ?? 0} Credits
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* 4. Thống kê Nghề nghiệp & Nhân khẩu học */}
      <section className='space-y-4'>
        <div className='flex items-center gap-2 border-b pb-2'>
          <TrendingUp className='size-4 text-primary' />
          <h2 className='text-base font-bold text-foreground'>Nhân khẩu học & Cơ cấu Cộng đồng</h2>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Card 1: Thống kê Nghề nghiệp */}
          <article className='unisurvey-card p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Briefcase className='size-5 text-secondary' />
                <h3 className='font-bold text-base'>Thống kê Nghề nghiệp</h3>
              </div>
              <span className='rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary'>
                {userStats?.totalUsers ?? 0} hồ sơ
              </span>
            </div>

            {topOccupations.length === 0 ? (
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                  <span className='flex items-center gap-2 font-medium'>
                    <span className='flex size-5 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-bold text-secondary'>
                      1
                    </span>
                    <span>Sinh viên</span>
                  </span>
                  <span className='font-bold text-foreground'>{userStats?.studentCount ?? 0} người</span>
                </div>
                <div className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                  <span className='flex items-center gap-2 font-medium'>
                    <span className='flex size-5 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-bold text-secondary'>
                      2
                    </span>
                    <span>Người đi làm</span>
                  </span>
                  <span className='font-bold text-foreground'>{userStats?.workerCount ?? 0} người</span>
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                {topOccupations.map((occ, index) => (
                  <div key={occ.name} className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                    <span className='flex items-center gap-2 font-medium'>
                      <span className='flex size-5 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-bold text-secondary'>
                        {index + 1}
                      </span>
                      <span className='truncate max-w-[170px]'>{occ.name}</span>
                    </span>
                    <span className='font-bold text-foreground'>{occ.count} người</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Card 2: Top Trường Đại học */}
          <article className='unisurvey-card p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <GraduationCap className='size-5 text-primary' />
                <h3 className='font-bold text-base'>Top Trường Đại học</h3>
              </div>
              <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary'>
                {userStats?.studentCount ?? 0} sinh viên
              </span>
            </div>

            {topUniversities.length === 0 ? (
              <p className='text-xs text-muted-foreground'>Đang cập nhật dữ liệu trường đại học...</p>
            ) : (
              <div className='space-y-2'>
                {topUniversities.map((uni, index) => (
                  <div key={uni.name} className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                    <span className='flex items-center gap-2 font-medium'>
                      <span className='flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary'>
                        {index + 1}
                      </span>
                      <span className='truncate max-w-[170px]'>{uni.name}</span>
                    </span>
                    <span className='font-bold text-foreground'>{uni.count} sinh viên</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Card 3: Danh mục Khảo sát Hàng đầu */}
          <article className='unisurvey-card p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Layers className='size-5 text-indigo-500' />
                <h3 className='font-bold text-base'>Lĩnh vực Khảo sát</h3>
              </div>
              <span className='rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400'>
                {surveyStats?.totalSurveys ?? 0} khảo sát
              </span>
            </div>

            {topCategories.length === 0 ? (
              <p className='text-xs text-muted-foreground'>Đang cập nhật danh mục phổ biến...</p>
            ) : (
              <div className='space-y-2'>
                {topCategories.map((cat, index) => (
                  <div key={cat.name} className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                    <span className='flex items-center gap-2 font-medium'>
                      <span className='flex size-5 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-600 dark:text-indigo-400'>
                        {index + 1}
                      </span>
                      <span className='truncate max-w-[170px]'>{cat.name}</span>
                    </span>
                    <span className='font-bold text-foreground'>{cat.count} khảo sát</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  )
}
