import { ArrowRight, Check, Coins, Sparkles, Zap } from 'lucide-react'
import { Link } from 'react-router'

import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { path } from '@/config/path'
import {
  useCreditPackagesQuery,
  useSubscriptionPlansQuery
} from '@/hooks/queries/pricing/use-pricing-queries'
import { useAuthStore } from '@/stores/auth-store'
import type { PlanEntitlement, SubscriptionBillingPeriod } from '@/types/pricing.type'

const entitlementNames: Record<string, string> = {
  MONTHLY_CREDITS: 'Credits mỗi tháng',
  AI_AUDIENCE_MATCHING: 'AI gợi ý đúng đối tượng khảo sát',
  AI_QUALITY_CHECK: 'AI kiểm tra chất lượng phản hồi',
  PRIORITY_BOOST: 'Lượt ưu tiên khảo sát mỗi tháng',
  ADVANCED_DASHBOARD: 'Dashboard phân tích nâng cao',
  AI_INSIGHT_EXPORT: 'Xuất báo cáo và AI insight',
  EXTRA_CREDIT_DISCOUNT: 'Giảm giá khi mua thêm Credits'
}

const billingPeriodNames: Record<SubscriptionBillingPeriod, string> = {
  MONTH: 'tháng',
  YEAR: 'năm'
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount)
}

function describeEntitlement(entitlement: PlanEntitlement) {
  const name = entitlementNames[entitlement.code] ?? entitlement.code.replaceAll('_', ' ')
  const amount = entitlement.valueAmount

  if (amount !== null && entitlement.valueType === 'QUOTA') {
    if (entitlement.code === 'MONTHLY_CREDITS') return `${amount.toLocaleString('vi-VN')} ${name}`
    return `${amount.toLocaleString('vi-VN')} ${name.toLowerCase()}`
  }
  if (amount !== null && entitlement.valueType === 'PERCENT') {
    return `${amount}% ${name.toLowerCase()}`
  }
  return name
}

function CatalogLoading({ label }: { label: string }) {
  return (
    <div aria-label={label} className='grid gap-5 md:grid-cols-3' role='status'>
      {[0, 1, 2].map((item) => (
        <div className='rounded-3xl border bg-white p-6' key={item}>
          <Skeleton className='h-6 w-28' />
          <Skeleton className='mt-5 h-10 w-40' />
          <Skeleton className='mt-6 h-16 w-full' />
        </div>
      ))}
    </div>
  )
}

export function PricingPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const plansQuery = useSubscriptionPlansQuery()
  const packagesQuery = useCreditPackagesQuery()

  return (
    <div className='bg-background min-h-screen'>
      <header className='border-border/70 border-b bg-white/85 px-4 backdrop-blur-xl sm:px-6'>
        <nav
          aria-label='Điều hướng bảng giá'
          className='mx-auto flex h-20 max-w-7xl items-center justify-between gap-4'
        >
          <Link aria-label='Trang chủ SurveyFlow' to={path.home}>
            <Brand />
          </Link>
          <div className='flex items-center gap-2 sm:gap-5'>
            <Link
              className='text-muted-foreground hover:text-primary focus-visible:ring-primary hidden rounded-lg px-2 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none sm:inline-flex'
              to={path.home}
            >
              Trang chủ
            </Link>
            <Button asChild className='h-10 rounded-xl px-3 font-bold sm:px-4' variant='outline'>
              <Link to={accessToken ? path.dashboard : path.login}>
                {accessToken ? 'Vào ứng dụng' : 'Đăng nhập'}
                <ArrowRight aria-hidden className='hidden sm:block' />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className='unisurvey-pricing'>
          <div className='mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pt-24 lg:px-8'>
            <div className='max-w-3xl'>
              <span className='eyebrow'>Giá rõ ràng, chọn theo nhu cầu</span>
              <h1 className='text-foreground mt-5 text-4xl leading-tight font-black tracking-[-0.045em] sm:text-6xl'>
                Nhiều phản hồi hơn. <span className='brand-text'>Nhiều insight hơn.</span>
              </h1>
              <p className='text-muted-foreground mt-6 max-w-2xl text-base leading-8 sm:text-lg'>
                Dùng Credits linh hoạt cho từng chiến dịch, hoặc chọn SurveyFlow Plus để mở rộng bộ
                công cụ nghiên cứu của bạn.
              </p>
              <div className='mt-8 flex flex-wrap gap-3'>
                <a
                  className='brand-gradient shadow-primary/15 focus-visible:ring-primary inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                  href='#plus'
                >
                  Xem SurveyFlow Plus <ArrowRight aria-hidden className='size-4' />
                </a>
                <a
                  className='border-border text-foreground hover:bg-muted focus-visible:ring-primary inline-flex h-11 items-center rounded-xl border bg-white px-5 text-sm font-bold focus-visible:ring-2 focus-visible:outline-none'
                  href='#credits'
                >
                  Xem gói Credits
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-7xl px-6 py-14 lg:px-8' id='plus'>
          <div className='mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
            <div>
              <span className='eyebrow'>Dành cho người tạo khảo sát</span>
              <h2 className='mt-3 text-3xl font-black tracking-tight sm:text-4xl'>
                SurveyFlow Plus
              </h2>
              <p className='text-muted-foreground mt-3 max-w-2xl leading-7'>
                Một gói để tăng tốc nghiên cứu với AI, Credits và công cụ phân tích.
              </p>
            </div>
            <span className='bg-secondary/10 text-secondary inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-black'>
              <Sparkles aria-hidden className='size-4' /> Quyền lợi cập nhật từ catalog
            </span>
          </div>

          {plansQuery.isPending ? (
            <CatalogLoading label='Đang tải gói SurveyFlow Plus' />
          ) : plansQuery.isError ? (
            <div
              className='border-destructive/30 bg-destructive/5 rounded-2xl border p-6'
              role='alert'
            >
              <p className='font-bold'>Không thể tải thông tin gói.</p>
              <Button className='mt-4' onClick={() => void plansQuery.refetch()} variant='outline'>
                Thử lại
              </Button>
            </div>
          ) : plansQuery.data.length === 0 ? (
            <p className='border-border rounded-2xl border bg-white p-6'>
              Hiện chưa có gói đăng ký đang mở bán.
            </p>
          ) : (
            <div
              className={
                plansQuery.data.length === 1 ? 'mx-auto max-w-3xl' : 'grid gap-5 lg:grid-cols-2'
              }
            >
              {plansQuery.data.map((plan) => (
                <article
                  className='rounded-[2rem] bg-[#071d2f] p-7 text-white shadow-[0_24px_60px_rgba(7,29,47,0.18)] sm:p-9'
                  key={plan.id}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <span className='inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white/90'>
                        <Zap aria-hidden className='size-3.5' /> Gói đăng ký
                      </span>
                      <h3 className='mt-5 text-3xl font-black'>{plan.name}</h3>
                      {plan.description && (
                        <p className='mt-2 text-sm text-white/70'>{plan.description}</p>
                      )}
                    </div>
                    <Sparkles aria-hidden className='size-9 shrink-0 text-[#55d66f]' />
                  </div>

                  <div className='mt-7 flex flex-wrap gap-3'>
                    {plan.prices.length === 0 ? (
                      <p className='text-white/75'>Giá đang được cập nhật.</p>
                    ) : (
                      plan.prices.map((price) => (
                        <p
                          className='rounded-2xl border border-white/15 bg-white/8 px-5 py-4'
                          key={price.id}
                        >
                          <strong className='text-3xl font-black'>
                            {formatPrice(price.price, price.currency)}
                          </strong>
                          <span className='ml-2 text-sm text-white/70'>
                            / {billingPeriodNames[price.billingPeriod]}
                          </span>
                        </p>
                      ))
                    )}
                  </div>

                  <div className='mt-8 border-t border-white/15 pt-7'>
                    <p className='text-xs font-black tracking-widest text-white/60 uppercase'>
                      Bao gồm
                    </p>
                    {plan.entitlements.length === 0 ? (
                      <p className='mt-4 text-sm text-white/75'>Quyền lợi đang được cập nhật.</p>
                    ) : (
                      <ul className='mt-4 grid gap-3 sm:grid-cols-2'>
                        {plan.entitlements.map((entitlement) => (
                          <li
                            className='flex items-start gap-2 text-sm leading-6'
                            key={entitlement.code}
                          >
                            <Check aria-hidden className='mt-1 size-4 shrink-0 text-[#55d66f]' />
                            <span>{describeEntitlement(entitlement)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button className='mt-8 h-11 w-full rounded-xl bg-white/15 text-white' disabled>
                    Thanh toán sắp mở
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className='border-border/70 border-y bg-white/80' id='credits'>
          <div className='mx-auto max-w-7xl px-6 py-16 lg:px-8'>
            <div className='mb-8 max-w-2xl'>
              <span className='eyebrow'>Linh hoạt theo chiến dịch</span>
              <h2 className='mt-3 text-3xl font-black tracking-tight sm:text-4xl'>
                Mua thêm Credits
              </h2>
              <p className='text-muted-foreground mt-3 leading-7'>
                Chọn số Credits phù hợp với nhu cầu khảo sát. Giá bên dưới là giá niêm yết của từng
                gói.
              </p>
            </div>

            {packagesQuery.isPending ? (
              <CatalogLoading label='Đang tải các gói Credits' />
            ) : packagesQuery.isError ? (
              <div
                className='border-destructive/30 bg-destructive/5 rounded-2xl border p-6'
                role='alert'
              >
                <p className='font-bold'>Không thể tải các gói Credits.</p>
                <Button
                  className='mt-4'
                  onClick={() => void packagesQuery.refetch()}
                  variant='outline'
                >
                  Thử lại
                </Button>
              </div>
            ) : packagesQuery.data.length === 0 ? (
              <p className='border-border rounded-2xl border p-6'>
                Hiện chưa có gói Credits đang mở bán.
              </p>
            ) : (
              <div className='grid gap-5 md:grid-cols-3'>
                {packagesQuery.data.map((creditPackage) => (
                  <article
                    className='border-border rounded-3xl border bg-white p-6 shadow-[0_18px_44px_rgba(8,91,174,0.08)] sm:p-7'
                    key={creditPackage.id}
                  >
                    <span className='bg-primary/8 text-primary grid size-12 place-items-center rounded-2xl'>
                      <Coins aria-hidden className='size-6' />
                    </span>
                    <h3 className='mt-6 text-xl font-black'>{creditPackage.name}</h3>
                    <p className='text-primary mt-2 text-3xl font-black'>
                      {creditPackage.creditAmount.toLocaleString('vi-VN')} Credits
                    </p>
                    <p className='text-muted-foreground mt-4 border-t pt-4 text-sm'>
                      Giá gói{' '}
                      <strong className='text-foreground ml-1 text-lg'>
                        {formatPrice(creditPackage.price, creditPackage.currency)}
                      </strong>
                    </p>
                    <Button className='mt-6 h-10 w-full rounded-xl' disabled variant='outline'>
                      Thanh toán sắp mở
                    </Button>
                  </article>
                ))}
              </div>
            )}
            <p className='text-muted-foreground mt-6 text-sm'>
              Quyền giảm giá của Plus sẽ được tính khi thanh toán mở bán; giá cuối cùng do hệ thống
              xác nhận tại thời điểm mua.
            </p>
          </div>
        </section>

        <section className='mx-auto flex max-w-7xl flex-col gap-4 px-6 py-16 sm:flex-row sm:items-center sm:justify-between lg:px-8'>
          <div>
            <p className='text-2xl font-black'>Bắt đầu với SurveyFlow</p>
            <p className='text-muted-foreground mt-2'>
              Tạo khảo sát và khám phá cộng đồng ngay hôm nay.
            </p>
          </div>
          <Button asChild className='brand-gradient h-11 rounded-xl px-6 font-bold text-white'>
            <Link to={accessToken ? path.dashboard : path.register}>
              {accessToken ? 'Mở dashboard' : 'Tạo tài khoản miễn phí'} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </section>
      </main>

      <footer className='border-border/70 border-t bg-white/70 px-6 py-8'>
        <div className='mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
          <Brand />
          <p className='text-muted-foreground text-sm'>© 2026 SurveyFlow</p>
        </div>
      </footer>
    </div>
  )
}
