import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Coins,
  Flame,
  GraduationCap,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react'
import { Link } from 'react-router'

import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { path } from '@/config/path'
import { useAuthStore } from '@/stores/auth-store'

const trendingSurveys = [
  {
    id: 1,
    tag: '#CôngNghệ',
    tagColor: 'bg-sky-50 text-sky-700 border-sky-200/60',
    title: 'Khảo sát Trải nghiệm AI & Công cụ học tập 2026',
    organization: 'AI & EdTech Research Lab',
    rewardCredits: 120,
    duration: '~4 phút',
    questionCount: 15,
    responses: 86,
    targetResponses: 100,
    isHot: true
  },
  {
    id: 2,
    tag: '#TàiChính',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
    title: 'Thói quen chi tiêu & Quản lý tài chính sinh viên',
    organization: 'CLB Tài chính Sinh viên',
    rewardCredits: 80,
    duration: '~3 phút',
    questionCount: 12,
    responses: 142,
    targetResponses: 150,
    isHot: false
  },
  {
    id: 3,
    tag: '#HOT',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200/60',
    title: 'Nghiên cứu Xu hướng việc làm & Mức lương Gen Z',
    organization: 'Dự án Hướng nghiệp Gen Z',
    rewardCredits: 150,
    duration: '~5 phút',
    questionCount: 18,
    responses: 48,
    targetResponses: 60,
    isHot: true
  },
  {
    id: 4,
    tag: '#ĐờiSống',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    title: 'Đánh giá Dịch vụ giao đồ ăn & Đặt xe công nghệ',
    organization: 'Nhóm Khảo sát Tiêu dùng',
    rewardCredits: 100,
    duration: '~3 phút',
    questionCount: 14,
    responses: 195,
    targetResponses: 200,
    isHot: false
  }
]

const features = [
  {
    icon: Users,
    title: 'Survey Exchange',
    description: 'Hoàn thành khảo sát của cộng đồng để nhận credits và mở rộng tệp phản hồi.'
  },
  {
    icon: Coins,
    title: 'Credits linh hoạt',
    description: 'Kiếm, mua và sử dụng credits theo đúng nhu cầu của từng chiến dịch.'
  },
  {
    icon: BarChart3,
    title: 'Dữ liệu chất lượng',
    description: 'Theo dõi tiến độ và kiểm soát chất lượng phản hồi trong một dashboard rõ ràng.'
  }
]

export function HomePage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const primaryPath = accessToken ? path.dashboard : path.login

  return (
    <main className='home-shell min-h-screen overflow-hidden'>
      <header className='relative z-30 px-4 pt-4 sm:px-6'>
        <nav className='border-border/80 mx-auto flex h-[72px] max-w-7xl items-center justify-between rounded-2xl border bg-white/85 px-4 shadow-[0_16px_40px_rgba(8,91,174,0.10)] backdrop-blur-xl sm:px-6'>
          <Link aria-label='Trang chủ SurveyFlow' to={path.home}>
            <Brand />
          </Link>

          <div className='hidden items-center gap-1 md:flex'>
            <a className='home-nav-link' href='#trending-surveys'>
              Khảo sát HOT
            </a>
            <a className='home-nav-link' href='#features'>
              Tính năng
            </a>
            <a className='home-nav-link' href='#how-it-works'>
              Cách hoạt động
            </a>
            <a className='home-nav-link' href='#community'>
              Cộng đồng
            </a>
            <Link className='home-nav-link' to={path.pricing}>
              Bảng giá
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <Link
              className='text-primary focus-visible:ring-primary rounded-lg px-2 py-2 text-sm font-bold focus-visible:ring-2 focus-visible:outline-none md:hidden'
              to={path.pricing}
            >
              Bảng giá
            </Link>
            {!accessToken && (
              <Button asChild className='hidden sm:inline-flex' variant='ghost'>
                <Link to={path.login}>Đăng nhập</Link>
              </Button>
            )}
            <Button
              asChild
              className='brand-gradient shadow-primary/15 h-10 rounded-xl px-4 font-bold text-white shadow-lg'
            >
              <Link to={primaryPath}>{accessToken ? 'Dashboard' : 'Bắt đầu miễn phí'}</Link>
            </Button>
            <Button aria-label='Mở menu' className='md:hidden' size='icon' variant='ghost'>
              <Menu />
            </Button>
          </div>
        </nav>
      </header>

      {/* Section đầu tiên: Hero kết hợp Khảo sát thưởng nóng */}
      <section className='relative mx-auto max-w-7xl px-6 pt-4 pb-16 lg:px-8 lg:pt-6 lg:pb-20' id='trending-surveys'>
        {/* Phần Tiêu đề & Thông điệp thương hiệu */}
        <div className='mx-auto max-w-4xl text-center'>
          <div className='flex flex-wrap items-center justify-center gap-2'>
            <span className='eyebrow'>
              <Sparkles className='size-3.5' /> SurveyFlow Community
            </span>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-xs font-black tracking-wider text-rose-600 uppercase shadow-xs'>
              <Flame className='size-3.5 animate-pulse fill-rose-600 text-rose-600' /> KHẢO SÁT THƯỞNG NÓNG HÔM NAY
            </span>
            <Link
              to={
                accessToken
                  ? path.exchange
                  : `${path.register}?redirectTo=${encodeURIComponent(path.exchange)}`
              }
              className='inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-linear-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 px-3 py-0.5 text-xs font-black text-amber-700 shadow-xs transition-transform hover:scale-105 dark:text-amber-300'
            >
              <Zap className='size-3.5 fill-amber-500 text-amber-500' />
              <span>🎁 Ưu đãi: Nhận <strong>300 Credits</strong> (+100 Early Bird) khi tạo tài khoản!</span>
              <ArrowRight className='size-3' />
            </Link>
          </div>

          <h1 className='text-foreground mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl'>
            Thu thập phản hồi <span className='brand-text'>nhanh và chất lượng hơn.</span>
          </h1>
          <p className='text-muted-foreground mx-auto mt-2.5 max-w-2xl text-sm leading-6 sm:text-base'>
            Tạo khảo sát, kết nối đúng cộng đồng và biến mỗi phản hồi thành insight có giá trị — tất
            cả trong một quy trình đơn giản.
          </p>

          <div className='text-muted-foreground mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-xs font-semibold sm:text-sm'>
            <span className='flex items-center gap-1.5'>
              <CheckCircle2 className='text-secondary size-3.5 sm:size-4' /> Bắt đầu miễn phí
            </span>
            <span className='flex items-center gap-1.5'>
              <Zap className='size-3.5 text-amber-500 fill-amber-500 sm:size-4' /> Tích lũy credits tức thì
            </span>
            <span className='flex items-center gap-1.5'>
              <ShieldCheck className='text-primary size-3.5 sm:size-4' /> Bảo vệ dữ liệu
            </span>
          </div>
        </div>

        {/* Khối Khảo sát thưởng nóng tích hợp (Instant Reward Showcase) */}
        <div className='mt-6'>
          <div className='mb-3.5 flex flex-wrap items-center justify-between gap-3 px-1'>
            <div className='flex items-center gap-2'>
              <span className='grid size-7 place-items-center rounded-xl bg-amber-500/10 text-amber-600 sm:size-8'>
                <Zap className='size-3.5 fill-amber-500 sm:size-4' />
              </span>
              <div>
                <h2 className='text-foreground text-sm font-black sm:text-base'>Làm khảo sát – Nhận Credits ngay hôm nay</h2>
                <p className='text-muted-foreground text-[11px] sm:text-xs'>
                  Hoàn thành khảo sát để nhận credits đổi lấy lượt phản hồi cho nghiên cứu của bạn
                </p>
              </div>
            </div>
            <Link
              to={
                accessToken
                  ? path.exchange
                  : `${path.login}?redirectTo=${encodeURIComponent(path.exchange)}`
              }
              className='text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold sm:text-sm'
            >
              Xem tất cả 50+ khảo sát <ArrowRight className='size-3.5 sm:size-4' />
            </Link>
          </div>

          <div className='grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4'>
            {trendingSurveys.map((survey) => {
              const progressPercentage = Math.round((survey.responses / survey.targetResponses) * 100)
              const remaining = survey.targetResponses - survey.responses

              return (
                <article
                  key={survey.id}
                  className='group relative flex flex-col justify-between rounded-3xl border border-primary/15 bg-white/95 p-5 shadow-[0_16px_40px_rgba(8,91,174,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_24px_55px_rgba(8,91,174,0.18)]'
                >
                  {survey.isHot && (
                    <div className='absolute -top-3 right-5 flex items-center gap-1 rounded-full bg-linear-to-r from-rose-500 to-amber-500 px-3 py-0.5 text-[11px] font-black text-white shadow-md'>
                      <Flame className='size-3 fill-white' /> HOT
                    </div>
                  )}

                  <div>
                    <div className='flex items-center justify-between gap-2'>
                      <span className={`rounded-xl border px-2.5 py-1 text-xs font-bold ${survey.tagColor}`}>
                        {survey.tag}
                      </span>
                      <span className='text-muted-foreground flex items-center gap-1 text-xs font-medium'>
                        <Clock className='size-3.5' /> {survey.duration}
                      </span>
                    </div>

                    <h3 className='text-foreground group-hover:text-primary mt-4 line-clamp-2 text-lg font-black leading-snug transition-colors'>
                      {survey.title}
                    </h3>

                    <div className='text-muted-foreground mt-3 flex items-center gap-1.5 text-xs'>
                      <GraduationCap className='text-primary size-4 shrink-0' />
                      <span className='truncate font-medium'>{survey.organization}</span>
                      <span className='text-border'>•</span>
                      <span className='shrink-0'>{survey.questionCount} câu</span>
                    </div>

                    {/* Progress */}
                    <div className='mt-5 space-y-1.5'>
                      <div className='text-muted-foreground flex items-center justify-between text-xs'>
                        <span>Tiến độ: <strong className='text-foreground'>{survey.responses}/{survey.targetResponses}</strong></span>
                        <span className='text-rose-600 font-bold'>Còn {remaining} suất</span>
                      </div>
                      <div className='bg-primary/10 h-2 w-full overflow-hidden rounded-full'>
                        <div
                          className='brand-gradient h-full rounded-full transition-all duration-500'
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút Nhận Credit siêu to */}
                  <div className='mt-6 pt-2'>
                    <Button
                      asChild
                      className='brand-gradient h-12 w-full rounded-2xl text-sm font-black text-white shadow-[0_8px_20px_rgba(8,91,174,0.22)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(8,91,174,0.35)]'
                    >
                      <Link
                        to={
                          accessToken
                            ? path.exchange
                            : `${path.login}?redirectTo=${encodeURIComponent(path.exchange)}`
                        }
                      >
                        <Zap className='size-4 fill-amber-300 text-amber-300' />
                        Nhận ngay +{survey.rewardCredits} Credits
                      </Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* Cụm nút mở rộng cuối Hero */}
        <div className='mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row'>
          <Button
            asChild
            className='brand-gradient h-12 rounded-2xl px-8 text-base font-bold text-white shadow-[0_14px_30px_rgba(8,91,174,0.22)]'
          >
            <Link
              to={
                accessToken
                  ? path.exchange
                  : `${path.login}?redirectTo=${encodeURIComponent(path.exchange)}`
              }
            >
              Khám phá tất cả 50+ khảo sát khác <ArrowRight className='size-4' />
            </Link>
          </Button>
          <Button asChild variant='outline' className='h-12 rounded-2xl px-7 text-base font-semibold'>
            <Link
              to={
                accessToken
                  ? path.createSurvey
                  : `${path.login}?redirectTo=${encodeURIComponent(path.createSurvey)}`
              }
            >
              Hoặc tạo khảo sát của bạn
            </Link>
          </Button>
        </div>
      </section>

      <section className='relative py-24' id='features'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <span className='eyebrow'>Tất cả trong một nền tảng</span>
            <h2 className='text-foreground mt-4 text-4xl font-black tracking-tight'>
              Vì sao chọn SurveyFlow?
            </h2>
            <p className='text-muted-foreground mt-4 leading-7'>
              Bộ công cụ gọn gàng cho người tạo khảo sát và cộng đồng người tham gia.
            </p>
          </div>

          <div className='mt-12 grid gap-5 md:grid-cols-3'>
            {features.map(({ icon: Icon, title, description }) => (
              <article
                className='border-primary/10 rounded-3xl border bg-white/88 p-7 shadow-[0_18px_44px_rgba(8,91,174,0.09)] transition hover:-translate-y-1'
                key={title}
              >
                <span className='brand-gradient shadow-primary/15 grid size-12 place-items-center rounded-2xl text-white shadow-lg'>
                  <Icon className='size-5' />
                </span>
                <h3 className='text-foreground mt-6 text-xl font-black'>{title}</h3>
                <p className='text-muted-foreground mt-3 leading-7'>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='px-6 pb-24 lg:px-8' id='how-it-works'>
        <div className='brand-gradient mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] p-8 text-white shadow-[0_24px_70px_rgba(8,91,174,0.22)] sm:p-12 lg:flex-row lg:items-center'>
          <div>
            <span className='text-xs font-black tracking-[0.12em] text-white/70 uppercase'>
              Sẵn sàng bắt đầu?
            </span>
            <h2 className='mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl'>
              Tạo khảo sát đầu tiên và bắt đầu nhận phản hồi.
            </h2>
          </div>
          <Button
            asChild
            className='text-primary h-12 shrink-0 rounded-xl bg-white px-7 font-bold hover:bg-white/90'
          >
            <Link to={primaryPath}>
              Bắt đầu ngay <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className='border-border/70 border-t bg-white/70 px-6 py-8' id='community'>
        <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row'>
          <Brand />
          <div className='flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground'>
            <Link to={path.pricing} className='hover:text-foreground transition-colors'>
              Bảng giá
            </Link>
            <Link to={path.termsOfService} className='hover:text-foreground transition-colors'>
              Điều khoản dịch vụ
            </Link>
            <Link to={path.privacyPolicy} className='hover:text-foreground transition-colors'>
              Chính sách quyền riêng tư
            </Link>
          </div>
          <p className='text-muted-foreground text-sm'>
            © 2026 SurveyFlow. Khảo sát tốt hơn, insight rõ hơn.
          </p>
        </div>
      </footer>
    </main>
  )
}
