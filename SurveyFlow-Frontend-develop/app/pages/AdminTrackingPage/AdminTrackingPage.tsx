import { useState } from 'react'
import {
  Activity,
  Award,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Coins,
  Copy,
  Crown,
  ExternalLink,
  GraduationCap,
  Layers,
  Link2,
  Lock,
  MessageSquare,
  MousePointerClick,
  QrCode,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  TriangleAlert,
  Users,
  Wallet,
  Zap
} from 'lucide-react'

import { useAdminTrackingSummaryQuery } from '@/hooks/queries/admin/use-admin-tracking'
import { getErrorMessage } from '@/utils/error'
import { formatTimeAgo } from '@/utils/date'

const SOURCE_LABELS: Record<string, { label: string; icon: string }> = {
  facebook: { label: 'Facebook (Group sinh viên / Fanpage)', icon: '🌐' },
  friends: { label: 'Bạn bè / Người quen giới thiệu', icon: '👥' },
  university: { label: 'Trường đại học / Giảng viên / CLB', icon: '🎓' },
  tiktok: { label: 'TikTok / Reels / Video ngắn', icon: '🎵' },
  google: { label: 'Tìm kiếm Google', icon: '🔍' },
  other: { label: 'Nguồn khác', icon: '💡' }
}

export function AdminTrackingPage() {
  const query = useAdminTrackingSummaryQuery()
  const data = query.data

  const userStats = data?.userStats
  const surveyStats = data?.surveyStats
  const creditStats = data?.creditStats
  const feedbackStats = data?.feedbackStats
  const subscriptionStats = data?.subscriptionStats
  const utmStats = data?.utmAttributionStats

  const totalSourceCounts = feedbackStats?.sourceCounts
    ? Object.values(feedbackStats.sourceCounts).reduce((acc, curr) => acc + curr, 0)
    : 0

  // State cho bộ tạo link UTM
  const [genDestination, setGenDestination] = useState('/')
  const [genSource, setGenSource] = useState('facebook')
  const [genCustomSource, setGenCustomSource] = useState('')
  const [genMedium, setGenMedium] = useState('group_sinhvien')
  const [genCampaign, setGenCampaign] = useState('early_bird_bonus')
  const [copied, setCopied] = useState(false)

  const activeSource = genSource === 'custom' ? genCustomSource.trim() : genSource
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://surveyflow.vn'
  const generatedUrl = `${baseUrl}${genDestination}?utm_source=${encodeURIComponent(activeSource || 'direct')}${genMedium ? `&utm_medium=${encodeURIComponent(genMedium)}` : ''}${genCampaign ? `&utm_campaign=${encodeURIComponent(genCampaign)}` : ''}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getSourceIcon = (src: string) => {
    if (src.includes('facebook') || src.includes('fb')) return '🌐'
    if (src.includes('tiktok')) return '🎵'
    if (src.includes('qr') || src.includes('poster')) return '📱'
    if (src.includes('zalo')) return '💬'
    if (src.includes('google')) return '🔍'
    if (src.includes('friend') || src.includes('ref')) return '👥'
    return '📌'
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <section className='unisurvey-window flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center'>
        <div>
          <div className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary'>
            <ShieldCheck className='size-4' />
            <span>Admin Control Center</span>
          </div>
          <h1 className='mt-2 text-3xl font-black'>Báo cáo Quản trị & Phân tích Toàn sàn</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Theo dõi thời gian thực: Tăng trưởng người dùng, Dòng tiền Credits, Hiệu suất khảo sát và Đánh giá chất lượng.
          </p>
        </div>
      </section>

      {query.isError && <p role='alert' className='text-destructive'>{getErrorMessage(query.error)}</p>}

      {/* 1. User & Survey Performance */}
      <section className='space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3'>
          <div>
            <div className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary'>
              <Activity className='size-3.5' />
              <span>Performance Analytics</span>
            </div>
            <h2 className='text-lg font-black text-foreground'>1. User & Survey Performance</h2>
            <p className='text-xs text-muted-foreground'>
              Theo dõi quy mô, tốc độ tăng trưởng người dùng, mức độ sử dụng gói Plus và chất lượng hoàn thành khảo sát.
            </p>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Card 1: Total Users & Weekly Growth */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-primary/10 p-2 text-primary'>
                <Users className='size-5' />
              </span>
              <span
                className='rounded-md bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary'
                title='Weekly User Growth: Tốc độ tăng trưởng người dùng trong tuần'
              >
                +{userStats?.newUsersLast7Days ?? 0} Weekly Growth
              </span>
            </div>
            <div>
              <div className='flex items-baseline justify-between'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Total Users</p>
                <span className='text-[10px] text-muted-foreground'>Quy mô người dùng</span>
              </div>
              <strong className='mt-1 block text-3xl font-black text-foreground'>
                {query.isLoading ? '—' : (userStats?.totalUsers ?? 0)}
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

          {/* Card 2: Subscription Users */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-indigo-500/10 p-2 text-indigo-500'>
                <Crown className='size-5' />
              </span>
              <span className='rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400'>
                {subscriptionStats?.activeSubscribers ?? 0} Active
              </span>
            </div>
            <div>
              <div className='flex items-baseline justify-between'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Subscription Users</p>
                <span className='text-[10px] text-muted-foreground'>Gói dịch vụ Plus</span>
              </div>
              <strong className='mt-1 block text-3xl font-black text-foreground'>
                {query.isLoading ? '—' : (subscriptionStats?.totalSubscribers ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Số người dùng thuộc nhóm subscription</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium'>
                <CheckCircle2 className='size-3.5' /> {subscriptionStats?.activeSubscribers ?? 0} Đang kích hoạt
              </span>
              <span>{subscriptionStats?.expiredSubscribers ?? 0} Hết hạn</span>
            </div>
          </article>

          {/* Card 3: Total Surveys, Open Surveys & Draft Surveys */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400'>
                <ClipboardList className='size-5' />
              </span>
              <span
                className='rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'
                title='Open Surveys: Số khảo sát đang tiếp nhận phản hồi'
              >
                {surveyStats?.activeSurveys ?? 0} Open Surveys
              </span>
            </div>
            <div>
              <div className='flex items-baseline justify-between'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Total Surveys</p>
                <span className='text-[10px] text-muted-foreground'>Mức tạo khảo sát</span>
              </div>
              <strong className='mt-1 block text-3xl font-black text-foreground'>
                {query.isLoading ? '—' : (surveyStats?.totalSurveys ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Tổng số khảo sát được ghi nhận</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span
                className='font-medium text-amber-600 dark:text-amber-400'
                title='Draft Surveys: Số khảo sát chưa hoàn tất hoặc chưa xuất bản'
              >
                {surveyStats?.draftSurveys ?? 0} Draft Surveys
              </span>
              <span>{surveyStats?.closedSurveys ?? 0} Đã đóng</span>
            </div>
          </article>

          {/* Card 4: Valid Completions, Valid Completion Rate & Opened / Error Events */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400'>
                <BadgeCheck className='size-5' />
              </span>
              <span
                className='rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary'
                title='Valid Completion Rate: Tỷ lệ hoàn thành khảo sát hợp lệ'
              >
                {surveyStats?.completionRate ?? 0}% Valid Rate
              </span>
            </div>
            <div>
              <div className='flex items-baseline justify-between'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Valid Completions</p>
                <span className='text-[10px] text-muted-foreground'>Hoạt động hoàn thành</span>
              </div>
              <strong className='mt-1 block text-3xl font-black text-foreground'>
                {query.isLoading ? '—' : (surveyStats?.validCompletions ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Số lượt hoàn thành khảo sát hợp lệ</p>
            </div>
            <div
              className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'
              title='Opened / Error Events: Hoạt động truy cập và lỗi trong quá trình khảo sát'
            >
              <span className='flex items-center gap-1'>
                <MousePointerClick className='size-3.5' /> {surveyStats?.totalFormOpens ?? 0} Opened
              </span>
              <span className='flex items-center gap-1 text-rose-500 font-medium'>
                <TriangleAlert className='size-3.5' /> {surveyStats?.invalidCodes ?? 0} Errors
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* 2. Credits */}
      <section className='space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3'>
          <div>
            <div className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400'>
              <Coins className='size-3.5' />
              <span>Tokenomics & Liquidity</span>
            </div>
            <h2 className='text-lg font-black text-foreground'>2. Credits</h2>
            <p className='text-xs text-muted-foreground'>
              Đo lường trao đổi giá trị bằng Credits và hoạt động chi trả Credits trên toàn hệ thống.
            </p>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Card 1: Credits in Circulation */}
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
              <div className='flex items-baseline justify-between'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Credits in Circulation</p>
                <span className='text-[10px] text-muted-foreground'>Trao đổi giá trị</span>
              </div>
              <strong className='mt-1 block text-3xl font-black text-amber-600 dark:text-amber-400'>
                {query.isLoading ? '—' : (creditStats?.totalCreditsInWallets?.toLocaleString('vi-VN') ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Tổng Credits đang lưu thông trong hệ thống</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Lock className='size-3.5 text-amber-500' /> Ký quỹ (Escrow):
              </span>
              <span className='font-bold text-foreground'>
                {creditStats?.heldCredits?.toLocaleString('vi-VN') ?? 0} Credits
              </span>
            </div>
          </article>

          {/* Card 2: Credits Paid */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-emerald-500/10 p-2 text-emerald-500'>
                <Award className='size-5' />
              </span>
              <span className='rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
                Đã giải ngân
              </span>
            </div>
            <div>
              <div className='flex items-baseline justify-between'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Credits Paid</p>
                <span className='text-[10px] text-muted-foreground'>Hoạt động chi trả</span>
              </div>
              <strong className='mt-1 block text-3xl font-black text-emerald-600 dark:text-emerald-400'>
                {query.isLoading ? '—' : (creditStats?.creditsAwarded?.toLocaleString('vi-VN') ?? 0)}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Số Credits được ghi nhận là đã trả</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Check className='size-3.5 text-emerald-500' /> Chi trả qua:
              </span>
              <span className='font-medium text-foreground'>Thưởng khảo sát hợp lệ</span>
            </div>
          </article>

          {/* Card 3: Early Bird & Welcome Reserve */}
          <article className='unisurvey-card p-5 space-y-3.5'>
            <div className='flex items-center justify-between'>
              <span className='rounded-lg bg-purple-500/10 p-2 text-purple-500'>
                <Sparkles className='size-5' />
              </span>
              <span className='rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400'>
                {creditStats?.earlyBirdSlotsUsed ?? 0} / {creditStats?.earlyBirdSlotsTotal ?? 40} slots
              </span>
            </div>
            <div>
              <div className='flex items-baseline justify-between'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Early Bird Reserve</p>
                <span className='text-[10px] text-muted-foreground'>Ngân sách chào mừng</span>
              </div>
              <strong className='mt-1 block text-3xl font-black text-purple-600 dark:text-purple-400'>
                {((creditStats?.earlyBirdSlotsUsed ?? 0) * 100).toLocaleString('vi-VN')} / {((creditStats?.earlyBirdSlotsTotal ?? 40) * 100).toLocaleString('vi-VN')}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Credits đã kích cầu người dùng mới (+100/user)</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span>Tiến độ phát thưởng:</span>
              <span className='font-bold text-foreground'>
                {Math.round(((creditStats?.earlyBirdSlotsUsed ?? 0) / (creditStats?.earlyBirdSlotsTotal || 40)) * 100)}%
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* 3. Automated UTM Attribution Tracking (Tracking Tự Động bằng UTM) */}
      <section className='unisurvey-card p-6 sm:p-8 space-y-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5'>
          <div>
            <div className='inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider'>
              <Radio className='size-4 animate-pulse text-indigo-500' />
              <span>Real-time Traffic Intelligence</span>
            </div>
            <h2 className='text-xl font-black mt-1'>Tracking Kênh Tiếp Cận Tự Động (UTM)</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Tự động nhận diện nguồn traffic thực tế (Facebook, TikTok, QR ĐH, Zalo,...) và tỷ lệ chuyển đổi thành User
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <div className='rounded-xl border bg-background/50 px-4 py-2 text-center'>
              <p className='text-[11px] font-semibold text-muted-foreground uppercase'>Lượt truy cập UTM</p>
              <p className='text-xl font-black text-indigo-600 dark:text-indigo-400'>
                {utmStats?.totalVisits ?? 0}
              </p>
            </div>
            <div className='rounded-xl border bg-background/50 px-4 py-2 text-center'>
              <p className='text-[11px] font-semibold text-muted-foreground uppercase'>Đã chuyển đổi</p>
              <p className='text-xl font-black text-emerald-600 dark:text-emerald-400'>
                {utmStats?.totalConversions ?? 0}
              </p>
            </div>
            <div className='rounded-xl border bg-background/50 px-4 py-2 text-center'>
              <p className='text-[11px] font-semibold text-muted-foreground uppercase'>Tỷ lệ chuyển đổi</p>
              <p className='text-xl font-black text-amber-500'>
                {utmStats?.overallConversionRate ?? 0}%
              </p>
            </div>
          </div>
        </div>

        {/* 2-column breakdown: Sources & Campaigns */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Top Sources */}
          <div className='space-y-4'>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <Target className='size-4 text-indigo-500' />
              <span>Top Kênh Tiếp Cận (UTM Source)</span>
            </h3>

            {(!utmStats?.sourceBreakdown || utmStats.sourceBreakdown.length === 0) ? (
              <div className='rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground'>
                Chưa ghi nhận lượt truy cập nào có gắn link UTM. Hãy sử dụng bộ tạo link bên dưới để bắt đầu chiến dịch!
              </div>
            ) : (
              <div className='space-y-2.5'>
                {utmStats.sourceBreakdown.map((src) => (
                  <div key={src.source} className='rounded-xl border bg-background/50 p-3 space-y-2'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='font-bold flex items-center gap-2'>
                        <span className='text-base'>{getSourceIcon(src.source)}</span>
                        <span className='capitalize'>{src.source}</span>
                      </span>
                      <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground'>{src.visits} visits</span>
                        <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                          {src.conversions} users ({src.conversionRate}%)
                        </span>
                      </div>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-muted/60'>
                      <div
                        className='h-full rounded-full bg-indigo-500 transition-all duration-500'
                        style={{ width: `${Math.min(100, Math.max(5, (src.visits / (utmStats.totalVisits || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Campaigns */}
          <div className='space-y-4'>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <TrendingUp className='size-4 text-emerald-500' />
              <span>Chiến Dịch Hiệu Quả (UTM Campaign)</span>
            </h3>

            {(!utmStats?.campaignBreakdown || utmStats.campaignBreakdown.length === 0) ? (
              <div className='rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground'>
                Chưa có dữ liệu chiến dịch.
              </div>
            ) : (
              <div className='space-y-2.5'>
                {utmStats.campaignBreakdown.map((cmp) => (
                  <div key={cmp.campaign} className='rounded-xl border bg-background/50 p-3 space-y-2'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='font-bold text-foreground truncate max-w-[200px]'>
                        🚀 {cmp.campaign}
                      </span>
                      <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground'>{cmp.visits} lượt</span>
                        <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                          {cmp.conversions} ĐK ({cmp.conversionRate}%)
                        </span>
                      </div>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-muted/60'>
                      <div
                        className='h-full rounded-full bg-emerald-500 transition-all duration-500'
                        style={{ width: `${Math.min(100, Math.max(5, (cmp.visits / (utmStats.totalVisits || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. UTM Link & QR Generator Widget */}
        <div className='rounded-2xl border bg-linear-to-br from-indigo-500/5 to-purple-500/5 p-5 sm:p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <QrCode className='size-5 text-indigo-500' />
              <h3 className='font-bold text-base'>Bộ Tạo Link Tracking & Mã QR Nhanh (Campaign Generator)</h3>
            </div>
            <span className='text-[11px] font-semibold text-muted-foreground'>Dùng để seeding bài viết hoặc in poster QR</span>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div>
              <label className='block text-xs font-semibold text-muted-foreground mb-1'>Trang đích (Destination)</label>
              <select
                value={genDestination}
                onChange={(e) => setGenDestination(e.target.value)}
                className='w-full rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none'
              >
                <option value='/'>Trang chủ (/)</option>
                <option value='/pricing'>Bảng giá (/pricing)</option>
                <option value='/explore'>Khám phá khảo sát (/explore)</option>
                <option value='/credits'>Credits & Thưởng (/credits)</option>
              </select>
            </div>

            <div>
              <label className='block text-xs font-semibold text-muted-foreground mb-1'>Kênh tiếp cận (Source)</label>
              <select
                value={genSource}
                onChange={(e) => setGenSource(e.target.value)}
                className='w-full rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none'
              >
                <option value='facebook'>Facebook (Group / Fanpage)</option>
                <option value='tiktok'>TikTok (Bio / Video)</option>
                <option value='qr_hcmut'>QR Bách Khoa HCMUT</option>
                <option value='qr_neu'>QR Kinh Tế Quốc Dân NEU</option>
                <option value='qr_uit'>QR ĐH CNTT UIT</option>
                <option value='qr_fpt'>QR ĐH FPT</option>
                <option value='zalo'>Zalo (Group chat)</option>
                <option value='google'>Google Search</option>
                <option value='custom'>Tùy chỉnh...</option>
              </select>
              {genSource === 'custom' && (
                <input
                  type='text'
                  value={genCustomSource}
                  onChange={(e) => setGenCustomSource(e.target.value)}
                  placeholder='vd: qr_uel, forum_voz...'
                  className='mt-2 w-full rounded-xl border bg-background px-3 py-1.5 text-xs'
                />
              )}
            </div>

            <div>
              <label className='block text-xs font-semibold text-muted-foreground mb-1'>Hình thức (Medium)</label>
              <input
                type='text'
                value={genMedium}
                onChange={(e) => setGenMedium(e.target.value)}
                placeholder='vd: group_sinhvien, poster_clb...'
                className='w-full rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-muted-foreground mb-1'>Tên chiến dịch (Campaign)</label>
              <input
                type='text'
                value={genCampaign}
                onChange={(e) => setGenCampaign(e.target.value)}
                placeholder='vd: early_bird_bonus, chao_tan_sv...'
                className='w-full rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none'
              />
            </div>
          </div>

          {/* Generated Result Box */}
          <div className='flex flex-col md:flex-row items-center gap-4 rounded-xl border bg-background p-3.5'>
            <div className='flex-1 min-w-0 w-full space-y-1'>
              <p className='text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5'>
                <Link2 className='size-3.5 text-primary' />
                <span>Link Tracking đã sẵn sàng</span>
              </p>
              <p className='text-xs font-mono text-foreground break-all select-all rounded bg-muted/40 p-2'>
                {generatedUrl}
              </p>
            </div>

            <div className='flex items-center gap-2 shrink-0'>
              <button
                type='button'
                onClick={handleCopyLink}
                className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95'
              >
                {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
                <span>{copied ? 'Đã sao chép!' : 'Copy Link'}</span>
              </button>

              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(generatedUrl)}`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted'
                title='Mở / Tải mã QR độ phân giải cao'
              >
                <QrCode className='size-4 text-indigo-500' />
                <span>Xem mã QR</span>
                <ExternalLink className='size-3 text-muted-foreground' />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feedback Attribution & User CSAT (Chuyển từ /tracking sang) */}
      <section className='unisurvey-card p-6 sm:p-8 space-y-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5'>
          <div>
            <div className='inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider'>
              <Share2 className='size-4' />
              <span>Attribution & Feedback Intelligence</span>
            </div>
            <h2 className='text-xl font-black mt-1'>Báo cáo Nguồn tiếp cận & Đánh giá người dùng</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Thống kê kênh khách hàng biết đến SurveyFlow và mức độ hài lòng thực tế
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <div className='rounded-xl border bg-background/50 px-4 py-2 text-center'>
              <p className='text-[11px] font-semibold text-muted-foreground uppercase'>Tổng lượt góp ý</p>
              <p className='text-xl font-black text-primary'>
                {feedbackStats?.totalFeedbacks ?? 0}
              </p>
            </div>
            <div className='rounded-xl border bg-background/50 px-4 py-2 text-center'>
              <p className='text-[11px] font-semibold text-muted-foreground uppercase'>Hài lòng trung bình</p>
              <p className='text-xl font-black text-amber-500 flex items-center justify-center gap-1'>
                <Star className='size-4 fill-amber-400 text-amber-400' />
                <span>{feedbackStats?.averageRating ? feedbackStats.averageRating.toFixed(1) : '5.0'}</span>
                <span className='text-xs font-normal text-muted-foreground'>/ 5</span>
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown nguồn tiếp cận & Góp ý gần nhất */}
        <div className='grid gap-6 lg:grid-cols-2'>
          <div className='space-y-4'>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <span>📊</span> Tỷ trọng kênh tiếp cận (Attribution Breakdown)
            </h3>
            <div className='space-y-3'>
              {Object.entries(SOURCE_LABELS).map(([key, item]) => {
                const count = feedbackStats?.sourceCounts?.[key] ?? 0
                const percent = totalSourceCounts > 0 ? Math.round((count / totalSourceCounts) * 100) : 0

                return (
                  <div key={key} className='space-y-1.5'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='flex items-center gap-1.5 font-medium'>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className='font-bold'>
                        {count} lượt <span className='text-muted-foreground font-normal'>({percent}%)</span>
                      </span>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-muted/60'>
                      <div
                        className='h-full rounded-full bg-primary transition-all duration-500'
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Góp ý gần nhất */}
          <div className='space-y-4'>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <MessageSquare className='size-4 text-primary' />
              <span>Góp ý & Cảm nhận gần nhất</span>
            </h3>

            {(!feedbackStats?.recentFeedbacks || feedbackStats.recentFeedbacks.length === 0) ? (
              <div className='rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground'>
                Chưa có phản hồi nào được ghi nhận.
              </div>
            ) : (
              <div className='space-y-3 max-h-[340px] overflow-y-auto pr-1'>
                {feedbackStats.recentFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className='rounded-xl border bg-background/60 p-3.5 space-y-2 text-xs shadow-2xs'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-foreground'>
                          {fb.userEmail ? fb.userEmail.split('@')[0] + '@...' : 'Người dùng ẩn danh'}
                        </span>
                        <div className='flex items-center text-amber-500'>
                          {Array.from({ length: fb.rating ?? 5 }).map((_, i) => (
                            <Star key={i} className='size-3 fill-amber-400 text-amber-400' />
                          ))}
                        </div>
                      </div>
                      <span className='text-[10px] text-muted-foreground'>
                        {formatTimeAgo(fb.createdAt)}
                      </span>
                    </div>

                    {fb.content && (
                      <p className='text-foreground/90 italic bg-muted/30 rounded-lg p-2'>
                        "{fb.content}"
                      </p>
                    )}

                    {fb.sources && fb.sources.length > 0 && (
                      <div className='flex flex-wrap gap-1 pt-1'>
                        {fb.sources.map((src) => (
                          <span
                            key={src}
                            className='inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'
                          >
                            {SOURCE_LABELS[src]?.icon ?? '📌'} {SOURCE_LABELS[src]?.label.split('(')[0] ?? src}
                          </span>
                        ))}
                        {fb.otherSource && (
                          <span className='inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                            Nguồn khác: {fb.otherSource}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Phân bố Học thuật, Gói Dịch vụ & Chiến dịch Early Bird */}
      <section className='grid gap-6 lg:grid-cols-3'>
        {/* Early Bird Campaign Status */}
        <article className='unisurvey-card p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles className='size-5 text-amber-500' />
              <h3 className='font-bold text-base'>Chiến dịch Early Bird (+100)</h3>
            </div>
            <span className='rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400'>
              {creditStats?.earlyBirdSlotsUsed ?? 0} / {creditStats?.earlyBirdSlotsTotal ?? 40} slots
            </span>
          </div>

          <p className='text-xs text-muted-foreground'>
            Tặng thêm +100 Credits chào mừng cho 40 tài khoản đăng ký đầu tiên để kích cầu tạo khảo sát.
          </p>

          <div className='space-y-1.5 pt-2'>
            <div className='flex items-center justify-between text-xs font-semibold'>
              <span>Tiến độ phát thưởng</span>
              <span>{Math.round(((creditStats?.earlyBirdSlotsUsed ?? 0) / (creditStats?.earlyBirdSlotsTotal || 40)) * 100)}%</span>
            </div>
            <div className='h-3 w-full overflow-hidden rounded-full bg-muted/60'>
              <div
                className='h-full rounded-full bg-amber-500 transition-all duration-500'
                style={{ width: `${Math.min(100, Math.round(((creditStats?.earlyBirdSlotsUsed ?? 0) / (creditStats?.earlyBirdSlotsTotal || 40)) * 100))}%` }}
              />
            </div>
          </div>
        </article>

        {/* Subscription Plans Breakdown */}
        <article className='unisurvey-card p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Crown className='size-5 text-indigo-500' />
              <h3 className='font-bold text-base'>Phân bố Gói Dịch vụ</h3>
            </div>
            <span className='rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400'>
              {subscriptionStats?.totalSubscribers ?? 0} người mua
            </span>
          </div>

          {(!subscriptionStats?.planBreakdown || subscriptionStats.planBreakdown.length === 0) ? (
            <p className='text-xs text-muted-foreground'>Chưa có dữ liệu người dùng đăng ký gói dịch vụ.</p>
          ) : (
            <div className='space-y-2'>
              {subscriptionStats.planBreakdown.map((plan) => (
                <div key={plan.planCode} className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                  <span className='font-medium text-foreground truncate max-w-[150px]'>
                    {plan.planName}
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground'>{plan.totalCount} lượt</span>
                    <span className='rounded bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400 text-[11px]'>
                      {plan.activeCount} active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Top Universities */}
        <article className='unisurvey-card p-6 space-y-4'>
          <div className='flex items-center gap-2'>
            <GraduationCap className='size-5 text-primary' />
            <h3 className='font-bold text-base'>Top Trường Đại học</h3>
          </div>

          {(!data?.topUniversities || data.topUniversities.length === 0) ? (
            <p className='text-xs text-muted-foreground'>Chưa có đủ dữ liệu trường học từ hồ sơ sinh viên.</p>
          ) : (
            <div className='space-y-2'>
              {data.topUniversities.map((uni, index) => (
                <div key={uni.name} className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                  <span className='flex items-center gap-2 font-medium'>
                    <span className='flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary'>
                      {index + 1}
                    </span>
                    <span className='truncate max-w-[200px]'>{uni.name}</span>
                  </span>
                  <span className='font-bold text-foreground'>{uni.count} sinh viên</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  )
}
