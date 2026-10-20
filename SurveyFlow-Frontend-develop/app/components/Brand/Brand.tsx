import { Sparkles } from 'lucide-react'

import { cn } from '@/utils/utils'

type BrandProps = {
  className?: string
  compact?: boolean
}

export function Brand({ className, compact = false }: BrandProps) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <img
        src='/logo.png'
        alt='SurveyFlow Logo'
        className='size-11 object-contain'
      />
      {!compact && (
        <span className='text-foreground flex items-center gap-1.5 text-xl font-black tracking-[-0.03em]'>
          SurveyFlow <Sparkles className='text-secondary size-4' />
        </span>
      )}
    </div>
  )
}
