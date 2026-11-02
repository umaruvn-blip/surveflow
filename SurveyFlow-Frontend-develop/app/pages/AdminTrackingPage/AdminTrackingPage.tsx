import { useState, useMemo } from 'react'
import {
  Activity,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Coins,
  Copy,
  Crown,
  ExternalLink,
  Filter,
  GraduationCap,
  Layers,
  Link2,
  Lock,
  MessageSquare,
  MousePointerClick,
  QrCode,
  Radio,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  TriangleAlert,
  Users,
  Wallet,
  XCircle,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAdminTrackingSummaryQuery } from '@/hooks/queries/admin/use-admin-tracking'
import {
  useAdminPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation
} from '@/hooks/queries/payment/use-payment-queries'
import type { PaymentStatus } from '@/types/payment.type'
import { getErrorMessage } from '@/utils/error'
import { formatTimeAgo } from '@/utils/date'
import { notify } from '@/utils/notify'

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

  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL')
  const [processingPaymentId, setProcessingPaymentId] = useState<number | null>(null)
  const adminPaymentsQuery = useAdminPaymentsQuery(
    paymentStatusFilter === 'ALL' ? undefined : paymentStatusFilter
  )
  const approveMutation = useApprovePaymentMutation()
  const rejectMutation = useRejectPaymentMutation()

  const pendingPaymentsCount = useMemo(() => {
    return (adminPaymentsQuery.data ?? []).filter((p) => p.status === 'PENDING').length
  }, [adminPaymentsQuery.data])

  const handleApprovePayment = async (id: number) => {
    try {
      setProcessingPaymentId(id)
      await approveMutation.mutateAsync(id)
      notify.success('Đã duyệt đơn thanh toán và kích hoạt dịch vụ thành công!')
    } catch (error) {
      notify.error(getErrorMessage(error))
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const handleRejectPayment = async (id: number) => {
    const reason = window.prompt('Nhập lý do từ chối đơn thanh toán (tùy chọn):')
    if (reason === null) return
    try {
      setProcessingPaymentId(id)
      await rejectMutation.mutateAsync({ paymentId: id, reason: reason.trim() || undefined })
      notify.success('Đã từ chối đơn thanh toán thành công!')
    } catch (error) {
      notify.error(getErrorMessage(error))
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const userStats = data?.userStats
  const surveyStats = data?.surveyStats
  const creditStats = data?.creditStats
  const feedbackStats = data?.feedbackStats
  const subscriptionStats = data?.subscriptionStats
  const utmStats = data?.utmAttributionStats

  // Lọc chỉ các gói dịch vụ trả phí (loại trừ gói mặc định FREE)
  const paidPlanBreakdown = useMemo(() => {
    return (subscriptionStats?.planBreakdown ?? []).filter(
      (p) => p.planCode?.toUpperCase() !== 'FREE'
    )
  }, [subscriptionStats?.planBreakdown])

  const totalPaidSubscribers = useMemo(() => {
    if (!subscriptionStats?.planBreakdown || subscriptionStats.planBreakdown.length === 0) {
      return 0
    }
    const hasOnlyFree = subscriptionStats.planBreakdown.every(
      (p) => p.planCode?.toUpperCase() === 'FREE'
    )
    if (hasOnlyFree) return 0
    return paidPlanBreakdown.reduce((acc, curr) => acc + curr.totalCount, 0)
  }, [paidPlanBreakdown, subscriptionStats?.planBreakdown])

  const activePaidSubscribers = useMemo(() => {
    if (!subscriptionStats?.planBreakdown || subscriptionStats.planBreakdown.length === 0) {
      return 0
    }
    const hasOnlyFree = subscriptionStats.planBreakdown.every(
      (p) => p.planCode?.toUpperCase() === 'FREE'
    )
    if (hasOnlyFree) return 0
    return paidPlanBreakdown.reduce((acc, curr) => acc + curr.activeCount, 0)
  }, [paidPlanBreakdown, subscriptionStats?.planBreakdown])

  const expiredPaidSubscribers = useMemo(() => {
    if (!subscriptionStats?.planBreakdown || subscriptionStats.planBreakdown.length === 0) {
      return 0
    }
    const hasOnlyFree = subscriptionStats.planBreakdown.every(
      (p) => p.planCode?.toUpperCase() === 'FREE'
    )
    if (hasOnlyFree) return 0
    return subscriptionStats?.expiredSubscribers ?? 0
  }, [subscriptionStats?.planBreakdown, subscriptionStats?.expiredSubscribers])

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
                {activePaidSubscribers} Active
              </span>
            </div>
            <div>
              <div className='flex items-baseline justify-between'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Subscription Users</p>
                <span className='text-[10px] text-muted-foreground'>Gói dịch vụ Plus</span>
              </div>
              <strong className='mt-1 block text-3xl font-black text-foreground'>
                {query.isLoading ? '—' : totalPaidSubscribers}
              </strong>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Số người dùng thuộc nhóm subscription</p>
            </div>
            <div className='flex items-center justify-between pt-2.5 text-xs border-t text-muted-foreground'>
              <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium'>
                <CheckCircle2 className='size-3.5' /> {activePaidSubscribers} Đang kích hoạt
              </span>
              <span>{expiredPaidSubscribers} Hết hạn</span>
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

      {/* 5. Phân bố Học thuật, Nghề nghiệp, Gói Dịch vụ & Chiến dịch */}
      <section className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
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
              {totalPaidSubscribers} người mua
            </span>
          </div>

          {paidPlanBreakdown.length === 0 ? (
            <p className='text-xs text-muted-foreground'>Chưa có dữ liệu người dùng đăng ký gói dịch vụ trả phí.</p>
          ) : (
            <div className='space-y-2'>
              {paidPlanBreakdown.map((plan) => (
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
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <GraduationCap className='size-5 text-primary' />
              <h3 className='font-bold text-base'>Top Trường Đại học</h3>
            </div>
            <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary'>
              {userStats?.studentCount ?? 56} sinh viên
            </span>
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

        {/* Top Occupations / Thống kê Nghề nghiệp */}
        <article className='unisurvey-card p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Briefcase className='size-5 text-secondary' />
              <h3 className='font-bold text-base'>Thống kê Nghề nghiệp</h3>
            </div>
            <span className='rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary'>
              {userStats?.totalUsers ?? 85} hồ sơ
            </span>
          </div>

          {(!data?.topOccupations || data.topOccupations.length === 0) ? (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                <span className='flex items-center gap-2 font-medium'>
                  <span className='flex size-5 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-bold text-secondary'>
                    1
                  </span>
                  <span className='truncate max-w-[150px]'>Sinh viên</span>
                </span>
                <span className='font-bold text-foreground'>{userStats?.studentCount ?? 0} người</span>
              </div>
              <div className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                <span className='flex items-center gap-2 font-medium'>
                  <span className='flex size-5 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-bold text-secondary'>
                    2
                  </span>
                  <span className='truncate max-w-[150px]'>Người đi làm</span>
                </span>
                <span className='font-bold text-foreground'>{userStats?.workerCount ?? 0} người</span>
              </div>
            </div>
          ) : (
            <div className='space-y-2'>
              {data.topOccupations.map((occ, index) => (
                <div key={occ.name} className='flex items-center justify-between text-xs rounded-lg border bg-background/50 p-2.5'>
                  <span className='flex items-center gap-2 font-medium'>
                    <span className='flex size-5 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-bold text-secondary'>
                      {index + 1}
                    </span>
                    <span className='truncate max-w-[150px]'>{occ.name}</span>
                  </span>
                  <span className='font-bold text-foreground'>{occ.count} người</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* 6. Quản lý & Đối soát Thanh toán Ngân hàng (Bank Transfer) */}
      <section className='space-y-4 pt-4 border-t'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div>
            <div className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary'>
              <ShieldCheck className='size-3.5' />
              <span>Financial Reconciliation</span>
            </div>
            <h2 className='text-lg font-black text-foreground'>
              6. Quản lý & Đối soát Thanh toán Ngân hàng (Bank Transfer)
            </h2>
            <p className='text-xs text-muted-foreground'>
              Đối chiếu biến động số dư theo mã nội dung chuyển khoản để kích hoạt gói Plus hoặc nạp Credits cho người dùng.
            </p>
          </div>

          <div className='flex items-center gap-2 self-start sm:self-auto'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 text-xs gap-1.5 cursor-pointer'
              onClick={() => void adminPaymentsQuery.refetch()}
              disabled={adminPaymentsQuery.isFetching}
            >
              <RefreshCw className={`size-3.5 ${adminPaymentsQuery.isFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1'>
            <Filter className='size-3' /> Lọc:
          </span>
          {[
            { key: 'ALL', label: 'Tất cả đơn' },
            { key: 'PENDING', label: 'Chờ duyệt', count: pendingPaymentsCount },
            { key: 'SUCCESS', label: 'Đã hoàn tất' },
            { key: 'CANCELLED', label: 'Đã hủy' }
          ].map((item) => (
            <button
              key={item.key}
              type='button'
              onClick={() => setPaymentStatusFilter(item.key as PaymentStatus | 'ALL')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                paymentStatusFilter === item.key
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className='flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white'>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Payments Table Card */}
        <div className='unisurvey-card overflow-hidden'>
          {adminPaymentsQuery.isLoading ? (
            <div className='p-8 text-center text-xs text-muted-foreground'>
              <RefreshCw className='size-5 animate-spin mx-auto text-primary mb-2' />
              Đang tải danh sách đơn thanh toán...
            </div>
          ) : adminPaymentsQuery.isError ? (
            <div className='p-6 text-center text-xs text-destructive'>
              Không thể tải danh sách đơn thanh toán. Vui lòng thử lại.
            </div>
          ) : (adminPaymentsQuery.data ?? []).length === 0 ? (
            <div className='p-8 text-center text-xs text-muted-foreground'>
              Chưa có đơn thanh toán nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs'>
                <thead className='border-b bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                  <tr>
                    <th className='px-4 py-3'>Mã GD / Nội dung</th>
                    <th className='px-4 py-3'>Khách hàng</th>
                    <th className='px-4 py-3'>Dịch vụ</th>
                    <th className='px-4 py-3 text-right'>Số tiền</th>
                    <th className='px-4 py-3'>Thời gian</th>
                    <th className='px-4 py-3 text-center'>Trạng thái</th>
                    <th className='px-4 py-3 text-right'>Thao tác</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60'>
                  {adminPaymentsQuery.data?.map((payment) => {
                    const isPending = payment.status === 'PENDING'
                    const isSuccess = payment.status === 'SUCCESS'
                    const isCancelled = payment.status === 'CANCELLED'
                    const isProcessing = processingPaymentId === payment.id

                    return (
                      <tr key={payment.id} className='hover:bg-muted/20 transition-colors'>
                        {/* Transaction Code */}
                        <td className='px-4 py-3.5 font-medium'>
                          <span className='font-mono font-bold text-sm text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md'>
                            {payment.transactionCode || `PAY-${payment.id}`}
                          </span>
                        </td>

                        {/* Customer Info */}
                        <td className='px-4 py-3.5'>
                          <div className='font-bold text-foreground'>
                            {payment.userName || 'Người dùng'}
                          </div>
                          <div className='text-[11px] text-muted-foreground'>
                            {payment.userEmail || `User ID: ${payment.userId}`}
                          </div>
                        </td>

                        {/* Service & Entitlements */}
                        <td className='px-4 py-3.5'>
                          {payment.type === 'SUBSCRIPTION' ? (
                            <div className='space-y-0.5'>
                              <span className='inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400'>
                                <Crown className='size-3' /> {payment.planName || 'SurveyFlow Plus'}
                              </span>
                              <div className='text-[10px] text-muted-foreground'>
                                +500 Credits đặc quyền / 30 ngày
                              </div>
                            </div>
                          ) : (
                            <div className='space-y-0.5'>
                              <span className='inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
                                <Coins className='size-3' /> Nạp Credits
                              </span>
                              <div className='text-[10px] text-muted-foreground'>
                                +{payment.creditAmount?.toLocaleString('vi-VN')} Credits vào ví
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className='px-4 py-3.5 text-right font-black text-foreground'>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: payment.currency || 'VND'
                          }).format(payment.amount)}
                        </td>

                        {/* Created At */}
                        <td className='px-4 py-3.5 text-muted-foreground'>
                          <div className='flex items-center gap-1'>
                            <Clock className='size-3' />
                            <span>{formatTimeAgo(payment.createdAt)}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className='px-4 py-3.5 text-center'>
                          {isPending && (
                            <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400'>
                              <span className='size-1.5 rounded-full bg-amber-500 animate-pulse' />
                              Chờ đối soát
                            </span>
                          )}
                          {isSuccess && (
                            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
                              <CheckCircle2 className='size-3' /> Đã duyệt
                            </span>
                          )}
                          {isCancelled && (
                            <span className='inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-bold text-destructive'>
                              <XCircle className='size-3' /> Đã hủy
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className='px-4 py-3.5 text-right'>
                          {isPending ? (
                            <div className='flex items-center justify-end gap-1.5'>
                              <Button
                                size='sm'
                                className='h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 px-2.5 cursor-pointer'
                                disabled={isProcessing}
                                onClick={() => handleApprovePayment(payment.id)}
                              >
                                <Check className='size-3.5' />
                                <span>{isProcessing ? 'Đang duyệt...' : 'Duyệt'}</span>
                              </Button>

                              <Button
                                size='sm'
                                variant='outline'
                                className='h-7 text-xs text-destructive hover:bg-destructive/10 px-2 cursor-pointer'
                                disabled={isProcessing}
                                onClick={() => handleRejectPayment(payment.id)}
                              >
                                <span>Hủy</span>
                              </Button>
                            </div>
                          ) : isSuccess ? (
                            <span className='text-[11px] text-muted-foreground'>
                              {payment.paidAt ? formatTimeAgo(payment.paidAt) : 'Hoàn tất'}
                            </span>
                          ) : (
                            <span className='text-[11px] text-muted-foreground italic' title={payment.description}>
                              Đã từ chối
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
