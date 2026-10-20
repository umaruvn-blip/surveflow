import { env } from '@/config/env'
import { ArrowLeft, Building2, CircleDollarSign, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { path } from '@/config/path'
import {
  useCreditWalletQuery,
  useRequestWithdrawalMutation
} from '@/hooks/queries/credit/use-credit-queries'
import { getErrorMessage } from '@/utils/error'
import { notify } from '@/utils/notify'
import type { WithdrawalRequest } from '@/types/credit.type'

const MINIMUM_CREDITS = 5000
const CREDIT_VALUE = 10
const PROCESSING_FEE = 0.05

function formatVnd(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`
}

export function WithdrawPage() {
  const navigate = useNavigate()
  const walletQuery = useCreditWalletQuery()
  const withdrawalMutation = useRequestWithdrawalMutation()
  const [credits, setCredits] = useState(MINIMUM_CREDITS)
  const [method, setMethod] = useState<WithdrawalRequest['method']>('BANK_TRANSFER')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const convertedValue = credits * CREDIT_VALUE
  const processingFee = Math.round(convertedValue * PROCESSING_FEE)
  const receivingValue = convertedValue - processingFee
  const spendableBalance = walletQuery.data?.spendableBalance ?? 0
  const isValid =
    credits >= MINIMUM_CREDITS &&
    credits <= spendableBalance &&
    Boolean(accountName.trim()) &&
    Boolean(accountNumber.trim())

  async function submit() {
    try {
      await withdrawalMutation.mutateAsync({ credits, method, accountName, accountNumber })
      notify.success(`Đã tạo yêu cầu rút ${formatVnd(receivingValue)}. Yêu cầu đang chờ xử lý.`)
      navigate(path.credits)
    } catch (error) {
      notify.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      {!env.VITE_ENABLE_MOCK && (
        <p role='status'>Đổi thưởng và rút tiền chưa được hỗ trợ trong API mode.</p>
      )}
      <section className='brand-gradient rounded-3xl p-7 text-white sm:p-9'>
        <span className='text-xs font-black tracking-[0.16em] text-white/75'>
          REWARDS & WITHDRAWAL
        </span>
        <h1 className='mt-4 text-4xl font-black tracking-tight sm:text-5xl'>Rút tiền</h1>
        <p className='mt-3 text-white/80'>Quy đổi Credits thành tiền và gửi yêu cầu rút tiền.</p>
        <div className='mt-7 rounded-xl bg-white/20 px-5 py-4 text-sm backdrop-blur'>
          <b>Tối thiểu 5.000 Credits = 50.000 VNĐ.</b> Phí xử lý là 5%.
        </div>
      </section>

      <section className='mt-7 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <article className='unisurvey-card p-6 sm:p-8'>
          <span className='eyebrow'>Withdrawal request</span>
          <h2 className='mt-2 text-2xl font-black'>Tạo yêu cầu rút tiền</h2>
          <label className='mt-7 block text-sm font-bold' htmlFor='withdrawal-credits'>
            Số Credits muốn đổi
          </label>
          <Input
            className='mt-2'
            id='withdrawal-credits'
            min={MINIMUM_CREDITS}
            onChange={(event) => setCredits(Number(event.target.value) || 0)}
            step='100'
            type='number'
            value={credits}
          />
          <p className='text-muted-foreground mt-2 text-xs'>
            Số dư hiện tại: {spendableBalance} Credits khả dụng.
          </p>
          {credits > 0 && credits < MINIMUM_CREDITS && (
            <p className='text-destructive mt-2 text-xs'>
              Cần tối thiểu {MINIMUM_CREDITS} Credits để rút tiền.
            </p>
          )}
          {credits > spendableBalance && (
            <p className='text-destructive mt-2 text-xs'>Số Credits rút vượt quá số dư khả dụng.</p>
          )}

          <label className='mt-6 block text-sm font-bold' htmlFor='withdrawal-method'>
            Phương thức nhận tiền
          </label>
          <select
            className='border-input bg-background focus-visible:ring-ring mt-2 flex h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3'
            id='withdrawal-method'
            onChange={(event) => setMethod(event.target.value as WithdrawalRequest['method'])}
            value={method}
          >
            <option value='BANK_TRANSFER'>Chuyển khoản ngân hàng</option>
            <option value='MOMO'>Ví MoMo</option>
          </select>
          <div className='mt-5 grid gap-5 sm:grid-cols-2'>
            <div>
              <label className='text-sm font-bold' htmlFor='account-name'>
                Tên chủ tài khoản
              </label>
              <Input
                className='mt-2'
                id='account-name'
                onChange={(event) => setAccountName(event.target.value)}
                placeholder='Nguyễn Văn A'
                value={accountName}
              />
            </div>
            <div>
              <label className='text-sm font-bold' htmlFor='account-number'>
                {method === 'MOMO' ? 'Số điện thoại MoMo' : 'Số tài khoản'}
              </label>
              <Input
                className='mt-2'
                id='account-number'
                onChange={(event) => setAccountNumber(event.target.value)}
                placeholder={method === 'MOMO' ? '09xxxxxxxx' : 'Số tài khoản ngân hàng'}
                value={accountNumber}
              />
            </div>
          </div>
          <div className='mt-7 flex flex-wrap gap-3'>
            <Button
              className='brand-gradient text-white'
              disabled={!env.VITE_ENABLE_MOCK || !isValid || withdrawalMutation.isPending}
              onClick={() => void submit()}
            >
              {withdrawalMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu rút tiền'}
            </Button>
            <Button asChild variant='outline'>
              <Link to={path.credits}>
                <ArrowLeft /> Quay lại Credits
              </Link>
            </Button>
          </div>
          <p className='text-muted-foreground mt-4 text-xs'>
            Ở môi trường mock, đây là yêu cầu mô phỏng và không tạo chuyển khoản thực tế.
          </p>
        </article>
        <aside className='unisurvey-card h-fit p-6 sm:p-8'>
          <span className='eyebrow'>Tạm tính</span>
          <div className='mt-6 divide-y'>
            <div className='flex justify-between gap-4 py-4'>
              <span>Giá trị quy đổi</span>
              <b>{formatVnd(convertedValue)}</b>
            </div>
            <div className='flex justify-between gap-4 py-4'>
              <span>Phí xử lý 5%</span>
              <b>-{formatVnd(processingFee)}</b>
            </div>
          </div>
          <div className='from-primary/10 to-secondary/10 mt-4 rounded-2xl bg-gradient-to-r p-5'>
            <p className='text-sm font-bold'>Thực nhận</p>
            <strong className='text-primary mt-2 block text-3xl font-black'>
              {formatVnd(Math.max(0, receivingValue))}
            </strong>
          </div>
          <div className='text-muted-foreground mt-6 space-y-3 text-xs leading-5'>
            <p className='flex gap-2'>
              <Building2 className='text-primary size-4 shrink-0' />
              Yêu cầu được xử lý theo phương thức bạn đã chọn.
            </p>
            <p className='flex gap-2'>
              <ShieldCheck className='text-secondary size-4 shrink-0' />
              Thông tin nhận tiền chỉ được dùng cho yêu cầu rút tiền này.
            </p>
            <p className='flex gap-2'>
              <CircleDollarSign className='text-primary size-4 shrink-0' />
              Tỷ lệ quy đổi: 1 Credit = 10 VNĐ.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
