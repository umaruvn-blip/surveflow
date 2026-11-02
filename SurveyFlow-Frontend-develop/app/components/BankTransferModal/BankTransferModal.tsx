import { useState } from 'react'
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { BankTransferPayment } from '@/types/payment.type'
import { notify } from '@/utils/notify'

type BankTransferModalProps = {
  isOpen: boolean
  onClose: () => void
  payment: BankTransferPayment | null
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      notify.success(`Đã sao chép ${label}`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      notify.error('Không thể sao chép vào bộ nhớ tạm')
    }
  }

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors'
      title={`Sao chép ${label}`}
    >
      {copied ? <Check className='size-3.5 text-emerald-600' /> : <Copy className='size-3.5' />}
      <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
    </button>
  )
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND'
  }).format(amount)
}

export function BankTransferModal({ isOpen, onClose, payment }: BankTransferModalProps) {
  const [isNotifiedAdmin, setIsNotifiedAdmin] = useState(false)

  if (!isOpen || !payment) return null

  const isSubscription = payment.type === 'SUBSCRIPTION'
  const itemName = isSubscription
    ? payment.planName ?? 'SurveyFlow Plus (30 ngày)'
    : `Gói ${payment.creditAmount?.toLocaleString('vi-VN')} Credits`

  const handleConfirmTransfer = () => {
    setIsNotifiedAdmin(true)
    notify.success('Đã gửi thông báo xác nhận chuyển khoản tới Ban quản trị!')
  }

  const handleClose = () => {
    setIsNotifiedAdmin(false)
    onClose()
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200'>
      <div
        className='relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-background border border-border/80 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200'
        role='dialog'
        aria-modal='true'
        aria-labelledby='bank-transfer-title'
      >
        {/* Close Button */}
        <button
          type='button'
          onClick={handleClose}
          className='absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          aria-label='Đóng cửa sổ thanh toán'
        >
          <X className='size-5' />
        </button>

        {/* Header */}
        <div className='flex items-start gap-3.5 border-b pb-5'>
          <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <QrCode className='size-6' />
          </div>
          <div>
            <div className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary'>
              <ShieldCheck className='size-3.5' />
              <span>Chuyển khoản an toàn qua VietQR</span>
            </div>
            <h2 id='bank-transfer-title' className='mt-1 text-xl font-black text-foreground sm:text-2xl'>
              Thanh toán Chuyển khoản Ngân hàng
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Quét mã QR từ ứng dụng ngân hàng hoặc chuyển khoản theo thông tin bên dưới.
            </p>
          </div>
        </div>

        {/* Status notification banner if confirmed */}
        {isNotifiedAdmin ? (
          <div className='mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300'>
            <div className='flex items-center gap-2.5 font-bold text-sm'>
              <CheckCircle2 className='size-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
              <span>Yêu cầu thanh toán của bạn đã được ghi nhận!</span>
            </div>
            <p className='mt-1.5 text-xs text-emerald-700 dark:text-emerald-400/90 leading-5'>
              Ban quản trị SurveyFlow sẽ đối soát biến động số dư theo nội dung{' '}
              <strong className='font-mono font-bold'>{payment.transactionCode}</strong> và kích hoạt
              dịch vụ cho bạn trong vòng 5–15 phút. Bạn có thể kiểm tra lịch sử trong ví Credits hoặc
              trang Tổng quan.
            </p>
          </div>
        ) : null}

        {/* Main Body */}
        <div className='mt-6 grid gap-6 sm:grid-cols-5'>
          {/* Left Column: QR Code */}
          <div className='sm:col-span-2 flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-muted/20 p-4 text-center'>
            <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3'>
              Mã VietQR tự động
            </p>
            <div className='relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-white p-2 shadow-sm'>
              <img
                src={payment.qrCodeUrl}
                alt={`Mã VietQR thanh toán ${payment.transactionCode}`}
                className='w-48 h-auto max-w-full rounded-xl object-contain mx-auto'
              />
            </div>

            <div className='mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground'>
              <span className='size-2 rounded-full bg-amber-500 animate-pulse' />
              <span className='font-medium'>Trạng thái: Chờ đối soát</span>
            </div>

            <a
              href={payment.qrCodeUrl}
              target='_blank'
              rel='noopener noreferrer'
              download={`vietqr-${payment.transactionCode}.png`}
              className='mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline'
            >
              <Download className='size-3.5' /> Mở ảnh QR kích thước lớn
            </a>
          </div>

          {/* Right Column: Transfer details */}
          <div className='sm:col-span-3 space-y-3.5 text-sm'>
            {/* Service & Amount */}
            <div className='rounded-2xl border bg-primary/5 p-3.5'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>Dịch vụ đăng ký:</span>
                <span className='font-black text-foreground'>{itemName}</span>
              </div>
              <div className='mt-2 flex items-baseline justify-between border-t border-primary/10 pt-2'>
                <span className='text-xs font-medium text-muted-foreground'>Số tiền cần chuyển:</span>
                <div className='flex items-center gap-2'>
                  <strong className='text-xl font-black text-primary'>
                    {formatCurrency(payment.amount, payment.currency)}
                  </strong>
                  <CopyButton text={String(Math.round(payment.amount))} label='Số tiền' />
                </div>
              </div>
            </div>

            {/* Bank details list */}
            <div className='space-y-2.5 rounded-2xl border p-4 bg-background/50'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground'>Ngân hàng thụ hưởng:</span>
                <span className='font-bold text-foreground text-right'>{payment.bankName}</span>
              </div>

              <div className='flex items-center justify-between border-t pt-2'>
                <span className='text-xs text-muted-foreground'>Số tài khoản:</span>
                <div className='flex items-center gap-2'>
                  <span className='font-mono font-bold text-foreground'>{payment.accountNo}</span>
                  <CopyButton text={payment.accountNo} label='Số tài khoản' />
                </div>
              </div>

              <div className='flex items-center justify-between border-t pt-2'>
                <span className='text-xs text-muted-foreground'>Chủ tài khoản:</span>
                <div className='flex items-center gap-2'>
                  <span className='font-bold uppercase text-foreground'>{payment.accountName}</span>
                  <CopyButton text={payment.accountName} label='Tên chủ tài khoản' />
                </div>
              </div>

              {/* Transaction code - CRITICAL */}
              <div className='rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold text-amber-700 dark:text-amber-400 uppercase'>
                    Nội dung chuyển khoản (bắt buộc):
                  </span>
                  <CopyButton text={payment.transactionCode} label='Nội dung chuyển khoản' />
                </div>
                <div className='mt-1 flex items-center justify-between'>
                  <span className='font-mono text-lg font-black text-amber-600 dark:text-amber-400 tracking-wider'>
                    {payment.transactionCode}
                  </span>
                </div>
                <p className='mt-1.5 text-[11px] text-amber-700 dark:text-amber-400/90 leading-4'>
                  * Vui lòng giữ nguyên nội dung trên để hệ thống tự động đối chiếu đơn của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='mt-7 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t pt-5'>
          <Button variant='outline' onClick={handleClose}>
            {isNotifiedAdmin ? 'Đóng' : 'Hủy & Đóng'}
          </Button>

          {!isNotifiedAdmin ? (
            <Button
              className='brand-gradient text-white font-bold gap-2'
              onClick={handleConfirmTransfer}
            >
              <Check className='size-4' />
              <span>Tôi đã chuyển tiền xong</span>
            </Button>
          ) : (
            <Button
              className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2'
              onClick={handleClose}
            >
              <CheckCircle2 className='size-4' />
              <span>Đã hoàn tất</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
