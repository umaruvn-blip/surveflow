import { useState } from 'react'
import { Check, Loader2, MessageSquarePlus, Star, X } from 'lucide-react'
import { toast } from 'sonner'

import { useCreateFeedbackMutation } from '@/hooks/queries/feedback/use-feedback'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/utils'

const SOURCE_OPTIONS = [
  { id: 'facebook', label: 'Facebook (Group sinh viên / Fanpage)', icon: '🌐' },
  { id: 'friends', label: 'Bạn bè / Người quen giới thiệu', icon: '👥' },
  { id: 'university', label: 'Trường đại học / Giảng viên / CLB', icon: '🎓' },
  { id: 'tiktok', label: 'TikTok / Reels / Video ngắn', icon: '🎵' },
  { id: 'google', label: 'Tìm kiếm Google', icon: '🔍' },
  { id: 'other', label: 'Khác', icon: '💡' }
]

const RATING_LABELS: Record<number, string> = {
  1: 'Chưa hài lòng 😞',
  2: 'Tạm được 😐',
  3: 'Bình thường 🙂',
  4: 'Tốt & Hài lòng 😊',
  5: 'Rất tuyệt vời! ⭐'
}

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [otherSourceText, setOtherSourceText] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [content, setContent] = useState('')

  const createFeedbackMutation = useCreateFeedbackMutation()

  const handleSelectSource = (sourceId: string) => {
    setSelectedSource((prev) => (prev === sourceId ? '' : sourceId))
  }

  const isOtherSelected = selectedSource === 'other'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createFeedbackMutation.mutate(
      {
        rating,
        sources: selectedSource ? [selectedSource] : [],
        otherSource: isOtherSelected ? otherSourceText : undefined,
        content: content.trim() || undefined
      },
      {
        onSuccess: () => {
          toast.success('Cảm ơn bạn đã gửi phản hồi và góp ý cho SurveyFlow!')
          setIsOpen(false)
          // Reset form
          setSelectedSource('')
          setOtherSourceText('')
          setRating(5)
          setContent('')
        },
        onError: () => {
          toast.error('Không thể gửi phản hồi lúc này. Vui lòng thử lại sau!')
        }
      }
    )
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95'
        aria-label='Góp ý & Phản hồi'
      >
        <MessageSquarePlus className='size-4' />
        <span>Góp ý & Phản hồi</span>
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200'>
          <div
            className='relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl text-card-foreground animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto'
            role='dialog'
            aria-modal='true'
            aria-labelledby='feedback-title'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b pb-4'>
              <div>
                <h2 id='feedback-title' className='text-lg font-bold flex items-center gap-2'>
                  <span>💬</span> Góp ý & Phản hồi
                </h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Ý kiến của bạn giúp SurveyFlow ngày một hoàn thiện hơn!
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                aria-label='Đóng'
              >
                <X className='size-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='mt-5 space-y-5'>
              {/* Question 1: Nguồn tiếp cận */}
              <div className='space-y-2.5'>
                <label className='block text-sm font-bold text-foreground'>
                  1. Bạn biết đến SurveyFlow từ đâu?{' '}
                  <span className='text-xs font-normal text-muted-foreground'>(Chọn 1 mục)</span>
                </label>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {SOURCE_OPTIONS.map((opt) => {
                    const isChecked = selectedSource === opt.id
                    return (
                      <button
                        key={opt.id}
                        type='button'
                        onClick={() => handleSelectSource(opt.id)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-medium transition-all',
                          isChecked
                            ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                            : 'border-border/70 hover:border-muted-foreground/30 hover:bg-muted/40'
                        )}
                      >
                        <div
                          className={cn(
                            'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                            isChecked
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/40 bg-background'
                          )}
                        >
                          {isChecked && <div className='size-1.5 rounded-full bg-primary-foreground' />}
                        </div>
                        <span className='text-sm leading-none'>{opt.icon}</span>
                        <span className='truncate'>{opt.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Input for Other source */}
                {isOtherSelected && (
                  <div className='mt-2 animate-in fade-in slide-in-from-top-1 duration-150'>
                    <Input
                      type='text'
                      value={otherSourceText}
                      onChange={(e) => setOtherSourceText(e.target.value)}
                      placeholder='Nhập nguồn bạn biết đến SurveyFlow...'
                      className='h-9 text-xs'
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Question 2: Đánh giá sao & Góp ý */}
              <div className='space-y-3 border-t pt-4'>
                <label className='block text-sm font-bold text-foreground'>
                  2. Đánh giá & Góp ý trải nghiệm
                </label>

                {/* Star Rating */}
                <div className='flex flex-col gap-1.5'>
                  <div className='flex items-center gap-1.5'>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating ?? rating) >= star
                      return (
                        <button
                          key={star}
                          type='button'
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className='p-1 text-muted-foreground hover:scale-110 transition-transform focus:outline-none'
                          aria-label={`${star} sao`}
                        >
                          <Star
                            className={cn(
                              'size-7 transition-colors',
                              active
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/40 hover:text-amber-300'
                            )}
                          />
                        </button>
                      )
                    })}
                    <span className='ml-2 text-xs font-semibold text-amber-600 dark:text-amber-400'>
                      {RATING_LABELS[hoverRating ?? rating]}
                    </span>
                  </div>
                </div>

                {/* Textarea */}
                <div className='space-y-1'>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder='Chia sẻ cảm nhận, góp ý hoặc tính năng bạn muốn có thêm...'
                    rows={3}
                    className='text-xs resize-none'
                  />
                </div>
              </div>

              {/* Actions */}
              <div className='flex items-center justify-end gap-2 border-t pt-4'>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  className='rounded-lg px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                  disabled={createFeedbackMutation.isPending}
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={createFeedbackMutation.isPending}
                  className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-60'
                >
                  {createFeedbackMutation.isPending ? (
                    <>
                      <Loader2 className='size-3.5 animate-spin' />
                      Đang gửi...
                    </>
                  ) : (
                    <>Gửi phản hồi 🚀</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
