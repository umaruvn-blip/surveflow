import { Link, useParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { path } from '@/config/path'
import { env } from '@/config/env'
import {
  useCompleteDemoPaymentMutation,
  usePaymentQuery
} from '@/hooks/queries/payment/use-payment-queries'
import type { DemoPaymentOutcome } from '@/types/payment.type'
import { getErrorMessage } from '@/utils/error'
import { notify } from '@/utils/notify'

const actions: { label: string; outcome: DemoPaymentOutcome; variant: 'default' | 'outline' }[] = [
  { label: 'Giả lập thành công', outcome: 'SUCCESS', variant: 'default' },
  { label: 'Giả lập thất bại', outcome: 'FAILED', variant: 'outline' },
  { label: 'Hủy thanh toán', outcome: 'CANCELLED', variant: 'outline' }
]

const statusLabel = {
  PENDING: 'Đang chờ thanh toán',
  SUCCESS: 'Thanh toán thành công',
  FAILED: 'Thanh toán thất bại',
  CANCELLED: 'Đã hủy thanh toán'
} as const

export function DemoPaymentPage() {
  const { paymentId } = useParams()
  const id = Number(paymentId)
  const isDemoEnabled = env.VITE_ENABLE_PAYMENT_DEMO || env.VITE_ENABLE_MOCK
  const paymentQuery = usePaymentQuery(id, isDemoEnabled)
  const completeMutation = useCompleteDemoPaymentMutation(id)
  const payment = paymentQuery.data

  async function complete(outcome: DemoPaymentOutcome) {
    try {
      await completeMutation.mutateAsync(outcome)
      notify.success('Đã ghi nhận kết quả thanh toán giả lập.')
    } catch (error) {
      notify.error(getErrorMessage(error))
    }
  }

  if (!isDemoEnabled) {
    return <p role='status'>Thanh toán giả lập chỉ có khi bật ở môi trường dev hoặc staging.</p>
  }

  if (!Number.isInteger(id) || id <= 0) {
    return <p role='alert'>Mã đơn thanh toán không hợp lệ.</p>
  }

  return (
    <section className='unisurvey-card mx-auto max-w-xl p-6 sm:p-8'>
      <span className='eyebrow'>Môi trường thử nghiệm · Thanh toán giả lập</span>
      <h1 className='mt-3 text-3xl font-black'>Nạp Credits</h1>
      {paymentQuery.isPending && <p className='mt-5'>Đang tải đơn thanh toán...</p>}
      {paymentQuery.isError && (
        <p className='text-destructive mt-5' role='alert'>
          {getErrorMessage(paymentQuery.error)}
        </p>
      )}
      {payment && (
        <>
          <dl className='mt-6 grid gap-4 rounded-2xl border p-5 sm:grid-cols-2'>
            <div>
              <dt className='text-muted-foreground text-sm'>Số Credits</dt>
              <dd className='mt-1 text-xl font-bold'>{payment.credits.toLocaleString('vi-VN')}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-sm'>Số tiền giả lập</dt>
              <dd className='mt-1 text-xl font-bold'>
                {payment.amountVnd.toLocaleString('vi-VN')} VNĐ
              </dd>
            </div>
            <div className='sm:col-span-2'>
              <dt className='text-muted-foreground text-sm'>Trạng thái</dt>
              <dd className='mt-1 font-bold' role='status'>
                {statusLabel[payment.status]}
              </dd>
            </div>
          </dl>
          <p className='text-muted-foreground mt-4 text-sm'>
            Đây là thanh toán giả lập. Không cần nhập thẻ hoặc chuyển tiền thật.
          </p>
          {payment.status === 'PENDING' && (
            <div className='mt-6 flex flex-wrap gap-3'>
              {actions.map((action) => (
                <Button
                  className={action.outcome === 'SUCCESS' ? 'brand-gradient text-white' : undefined}
                  disabled={completeMutation.isPending}
                  key={action.outcome}
                  onClick={() => void complete(action.outcome)}
                  variant={action.variant}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          <Button asChild className='mt-6' variant='outline'>
            <Link to={path.credits}>Về ví Credits</Link>
          </Button>
        </>
      )}
    </section>
  )
}
