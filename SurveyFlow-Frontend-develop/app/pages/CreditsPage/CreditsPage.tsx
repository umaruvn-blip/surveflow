import { env } from '@/config/env'
import { ArrowUpRight, CircleCheck, Coins, Gift, LockKeyhole, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { path } from '@/config/path'
import {
  useCreditTransactionsQuery,
  useCreditWalletQuery,
  useGrantParticipationRewardMutation,
  useRedeemRewardMutation,
  useReleaseSurveyBudgetMutation,
  useReserveSurveyBudgetMutation
} from '@/hooks/queries/credit/use-credit-queries'
import { useCreateTopupMutation } from '@/hooks/queries/payment/use-payment-queries'
import { getErrorMessage } from '@/utils/error'
import { notify } from '@/utils/notify'
import type { RedeemReward } from '@/types/credit.type'

const rules = [
  'Hoàn thành khảo sát hợp lệ sẽ được cộng Credits từ ngân sách của người tạo khảo sát.',
  'Khi xuất bản khảo sát, Credits được giữ riêng làm ngân sách thưởng cho người tham gia.',
  'Credits chưa dùng của khảo sát đã đóng có thể được hoàn về ví của người tạo.'
]

const redeemRewards: RedeemReward[] = [
  {
    id: 'coffee',
    name: 'Voucher cà phê 20.000đ',
    description: 'Mã voucher được gửi qua email.',
    credits: 100
  },
  {
    id: 'shopping',
    name: 'Voucher mua sắm 50.000đ',
    description: 'Áp dụng tại đối tác của SurveyFlow.',
    credits: 250
  },
  {
    id: 'premium',
    name: 'Gói Premium 1 tháng',
    description: 'Mở khóa các công cụ hỗ trợ nâng cao.',
    credits: 500
  }
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  )
}

export function CreditsPage() {
  const navigate = useNavigate()
  const walletQuery = useCreditWalletQuery()
  const transactionsQuery = useCreditTransactionsQuery()
  const reserveMutation = useReserveSurveyBudgetMutation()
  const releaseMutation = useReleaseSurveyBudgetMutation()
  const rewardMutation = useGrantParticipationRewardMutation()
  const redeemMutation = useRedeemRewardMutation()
  const createTopupMutation = useCreateTopupMutation()
  const [topupCredits, setTopupCredits] = useState(100)
  const [surveyId, setSurveyId] = useState('')
  const [participationId, setParticipationId] = useState('')
  const wallet = walletQuery.data
  const canTopup =
    Number.isSafeInteger(topupCredits) &&
    topupCredits >= 10 &&
    Number.isSafeInteger(topupCredits * 100)

  async function createTopup() {
    try {
      const payment = await createTopupMutation.mutateAsync(topupCredits)
      navigate(path.paymentDemo(payment.id))
    } catch (error) {
      notify.error(getErrorMessage(error))
    }
  }

  function toId(value: string) {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
  }

  async function runMutation(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action()
      notify.success(successMessage)
    } catch (error) {
      notify.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      {!env.VITE_ENABLE_MOCK && (
        <p role='status'>Đổi thưởng và rút tiền chưa được hỗ trợ trong API mode.</p>
      )}
      <section className='flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
        <div>
          <span className='eyebrow'>Credit Exchange</span>
          <h1 className='mt-2 text-3xl font-black tracking-tight'>Ví Credits</h1>
          <p className='text-muted-foreground mt-2'>
            Theo dõi số dư có thể dùng, ngân sách đã giữ và các giao dịch Credit.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button asChild variant='outline'>
            <Link to={path.withdraw}>
              <ArrowUpRight /> Rút tiền
            </Link>
          </Button>
          <Button asChild className='brand-gradient text-white'>
            <Link to={path.exchange}>Khảo sát để nhận Credits</Link>
          </Button>
        </div>
      </section>

      {walletQuery.isError && (
        <p className='border-destructive/30 bg-destructive/5 text-destructive mt-6 rounded-xl border p-4 text-sm'>
          Không thể tải ví Credits. Vui lòng thử lại.
        </p>
      )}

      <section className='mt-8 grid gap-5 md:grid-cols-3'>
        <article className='unisurvey-credit-card rounded-2xl p-7 text-white'>
          <Coins className='size-9' />
          <p className='mt-6 text-sm font-bold text-white/75'>CÓ THỂ SỬ DỤNG</p>
          <strong className='mt-1 block text-4xl font-black'>
            {walletQuery.isLoading ? '—' : (wallet?.spendableBalance ?? 0)}
          </strong>
          <p className='mt-2 text-sm text-white/80'>Credits có thể phân bổ cho khảo sát mới.</p>
        </article>
        <article className='unisurvey-card p-7'>
          <LockKeyhole className='text-primary size-9' />
          <p className='text-muted-foreground mt-6 text-sm font-bold'>ĐANG GIỮ NGÂN SÁCH</p>
          <strong className='mt-1 block text-4xl font-black'>
            {walletQuery.isLoading ? '—' : (wallet?.reservedBalance ?? 0)}
          </strong>
          <p className='text-muted-foreground mt-2 text-sm'>
            Dành cho phần thưởng của khảo sát đang chạy.
          </p>
        </article>
        <article className='unisurvey-card p-7'>
          <ReceiptText className='text-secondary size-9' />
          <p className='text-muted-foreground mt-6 text-sm font-bold'>TỔNG SỐ DƯ</p>
          <strong className='mt-1 block text-4xl font-black'>
            {walletQuery.isLoading ? '—' : (wallet?.balance ?? 0)}
          </strong>
          <p className='text-muted-foreground mt-2 text-sm'>
            Thông tin được đồng bộ từ ví của bạn.
          </p>
        </article>
      </section>

      {(env.VITE_ENABLE_PAYMENT_DEMO || env.VITE_ENABLE_MOCK) && (
        <section className='unisurvey-card mt-7 p-6 sm:p-8'>
          <span className='eyebrow'>Môi trường thử nghiệm · Thanh toán giả lập</span>
          <h2 className='mt-2 text-xl font-black'>Nạp Credits</h2>
          <p className='text-muted-foreground mt-2 text-sm'>
            Tỷ lệ 1.000 VNĐ = 10 Credits. Đây là giao dịch giả lập, không chuyển tiền thật.
          </p>
          <label className='mt-5 block text-sm font-bold' htmlFor='topup-credits'>
            Số Credits muốn nạp
          </label>
          <Input
            className='mt-2 max-w-xs'
            id='topup-credits'
            min='10'
            onChange={(event) => setTopupCredits(Number(event.target.value))}
            step='1'
            type='number'
            value={topupCredits}
          />
          <p className='text-muted-foreground mt-2 text-sm'>
            Nhập số nguyên từ 10 Credits trở lên.
          </p>
          <p className='text-muted-foreground mt-2 text-sm'>
            Số tiền tham khảo: {canTopup ? (topupCredits * 100).toLocaleString('vi-VN') : '—'} VNĐ
          </p>
          <Button
            className='brand-gradient mt-5 text-white'
            disabled={!canTopup || createTopupMutation.isPending}
            onClick={() => void createTopup()}
          >
            {createTopupMutation.isPending ? 'Đang tạo đơn...' : 'Tiếp tục giả lập thanh toán'}
          </Button>
        </section>
      )}

      <section className='mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]'>
        <article className='unisurvey-card p-6'>
          <h2 className='text-xl font-black'>Lịch sử giao dịch</h2>
          {transactionsQuery.isLoading && (
            <p className='text-muted-foreground mt-5 text-sm'>Đang tải giao dịch...</p>
          )}
          {transactionsQuery.isError && (
            <p className='text-destructive mt-5 text-sm'>Không thể tải lịch sử giao dịch.</p>
          )}
          {transactionsQuery.data?.length === 0 && (
            <p className='text-muted-foreground mt-5 text-sm'>Chưa có giao dịch Credits.</p>
          )}
          <div className='mt-4 divide-y'>
            {transactionsQuery.data?.map((transaction) => (
              <div className='flex items-center justify-between gap-4 py-4' key={transaction.id}>
                <div>
                  <p className='text-sm font-black'>{transaction.description}</p>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
                <strong
                  className={
                    transaction.direction === 'CREDIT'
                      ? 'text-secondary text-sm'
                      : 'text-destructive text-sm'
                  }
                >
                  {transaction.direction === 'CREDIT' ? '+' : '-'}
                  {transaction.amount}
                </strong>
              </div>
            ))}
          </div>
        </article>
        <article className='unisurvey-card p-6'>
          <h2 className='flex items-center gap-2 text-xl font-black'>
            <CircleCheck className='text-secondary' /> Cách Credits hoạt động
          </h2>
          <ul className='mt-5 grid gap-4'>
            {rules.map((rule) => (
              <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={rule}>
                <span className='bg-primary mt-1 size-2 shrink-0 rounded-full' />
                {rule}
              </li>
            ))}
          </ul>
        </article>
      </section>
      <section className='unisurvey-window mt-7 p-6'>
        <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-end'>
          <div>
            <span className='eyebrow'>Redeem</span>
            <h2 className='mt-2 flex items-center gap-2 text-xl font-black'>
              <Gift className='text-primary size-5' /> Đổi Credits lấy phần thưởng
            </h2>
            <p className='text-muted-foreground mt-2 text-sm'>
              Bạn có {wallet?.spendableBalance ?? 0} Credits khả dụng để đổi thưởng.
            </p>
          </div>
          <p className='text-muted-foreground text-xs'>
            Phần thưởng sẽ được xử lý sau khi xác nhận.
          </p>
        </div>
        <div className='mt-5 grid gap-4 md:grid-cols-3'>
          {redeemRewards.map((reward) => {
            const canRedeem = (wallet?.spendableBalance ?? 0) >= reward.credits
            return (
              <article className='bg-background/60 rounded-2xl border p-5' key={reward.id}>
                <Gift className='text-secondary size-6' />
                <h3 className='mt-4 font-black'>{reward.name}</h3>
                <p className='text-muted-foreground mt-2 min-h-10 text-sm'>{reward.description}</p>
                <div className='mt-5 flex items-center justify-between gap-3'>
                  <strong className='text-primary'>{reward.credits} Credits</strong>
                  <Button
                    disabled={!env.VITE_ENABLE_MOCK || !canRedeem || redeemMutation.isPending}
                    onClick={() =>
                      void runMutation(
                        () => redeemMutation.mutateAsync(reward),
                        `Đã đổi ${reward.name}. Kiểm tra email để nhận thông tin phần thưởng.`
                      )
                    }
                    size='sm'
                  >
                    {canRedeem ? 'Đổi ngay' : 'Chưa đủ Credits'}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
      <section className='mt-7 grid gap-5 lg:grid-cols-2'>
        <article className='unisurvey-card p-6'>
          <h2 className='text-xl font-black'>Ngân sách khảo sát</h2>
          <p className='text-muted-foreground mt-2 text-sm'>
            Nhập ID khảo sát để giữ Credits khi xuất bản hoặc hoàn Credits chưa sử dụng khi khảo sát
            đã đóng.
          </p>
          <label className='mt-5 block text-sm font-bold' htmlFor='survey-id'>
            Survey ID
          </label>
          <Input
            className='mt-2'
            id='survey-id'
            min='1'
            onChange={(event) => setSurveyId(event.target.value)}
            placeholder='Ví dụ: 12'
            type='number'
            value={surveyId}
          />
          <div className='mt-4 flex flex-wrap gap-3'>
            <Button
              disabled={!toId(surveyId) || reserveMutation.isPending}
              onClick={() => {
                const id = toId(surveyId)
                if (id)
                  void runMutation(
                    () => reserveMutation.mutateAsync(id),
                    'Đã giữ ngân sách Credits cho khảo sát.'
                  )
              }}
            >
              Giữ ngân sách
            </Button>
            <Button
              disabled={!toId(surveyId) || releaseMutation.isPending}
              onClick={() => {
                const id = toId(surveyId)
                if (id)
                  void runMutation(
                    () => releaseMutation.mutateAsync(id),
                    'Đã hoàn Credits chưa dùng về ví.'
                  )
              }}
              variant='outline'
            >
              Hoàn Credits
            </Button>
          </div>
        </article>
        <article className='unisurvey-card p-6'>
          <h2 className='text-xl font-black'>Cấp thưởng người tham gia</h2>
          <p className='text-muted-foreground mt-2 text-sm'>
            Dùng ID participation hợp lệ để chuyển thưởng từ ngân sách khảo sát sang ví người trả
            lời.
          </p>
          <label className='mt-5 block text-sm font-bold' htmlFor='participation-id'>
            Participation ID
          </label>
          <Input
            className='mt-2'
            id='participation-id'
            min='1'
            onChange={(event) => setParticipationId(event.target.value)}
            placeholder='Ví dụ: 26'
            type='number'
            value={participationId}
          />
          <Button
            className='mt-4'
            disabled={!toId(participationId) || rewardMutation.isPending}
            onClick={() => {
              const id = toId(participationId)
              if (id)
                void runMutation(
                  () => rewardMutation.mutateAsync(id),
                  'Đã cấp thưởng Credits cho người tham gia.'
                )
            }}
          >
            Cấp thưởng
          </Button>
        </article>
      </section>
    </div>
  )
}
