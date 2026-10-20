import { useState } from 'react'
import {
  Trophy,
  Medal,
  Flame,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  School,
  Briefcase,
  TrendingUp,
  Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLeaderboardQuery } from '@/hooks/queries/leaderboard/use-leaderboard-queries'
import { useAuthStore } from '@/stores/auth-store'
import type { LeaderboardItem, LeaderboardPeriod, LeaderboardType } from '@/types/leaderboard.type'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'

export function LeaderboardPage() {
  const [type, setType] = useState<LeaderboardType>('RESPONDENT')
  const [period, setPeriod] = useState<LeaderboardPeriod>('ALL_TIME')
  const user = useAuthStore((state) => state.user)

  const { data, isLoading, isError, refetch, isFetching } = useLeaderboardQuery(type, period, 50)

  const items = data?.items || []
  const top1 = items[0]
  const top2 = items[1]
  const top3 = items[2]
  const restItems = items.slice(3)
  const myRank = data?.myRank

  return (
    <div className='space-y-8 pb-16'>
      {/* Header Banner */}
      <div className='relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/95 via-primary to-indigo-900 p-6 text-white shadow-xl sm:p-10'>
        <div className='relative z-10 max-w-2xl space-y-3'>
          <div className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md'>
            <Trophy className='size-3.5' /> Bảng vàng vinh danh SurveyFlow
          </div>
          <h1 className='text-3xl font-black tracking-tight sm:text-4xl'>
            Bảng Xếp Hạng Cộng Đồng
          </h1>
          <p className='text-sm text-white/80 leading-relaxed sm:text-base'>
            Vinh danh những thành viên tích cực nhất trong việc khảo sát và các tác giả đóng góp nhiều đề tài nghiên cứu giá trị.
          </p>
        </div>

        {/* Decorative elements */}
        <div className='absolute -right-12 -bottom-12 size-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none' />
        <div className='absolute top-0 right-10 size-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none' />
      </div>

      {/* Control Tabs & Filters */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        {/* Main Tab: Respondent vs Creator */}
        <div className='flex rounded-2xl bg-muted/70 p-1.5 shadow-inner'>
          <button
            type='button'
            onClick={() => setType('RESPONDENT')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
              type === 'RESPONDENT'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Flame className={cn('size-4', type === 'RESPONDENT' ? 'text-amber-500 fill-amber-500' : '')} />
            Thợ săn khảo sát
          </button>
          <button
            type='button'
            onClick={() => setType('CREATOR')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
              type === 'CREATOR'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Award className={cn('size-4', type === 'CREATOR' ? 'text-indigo-500' : '')} />
            Tác giả nổi bật
          </button>
        </div>

        {/* Time Period Filter */}
        <div className='flex items-center gap-1.5 self-start sm:self-auto rounded-xl border bg-background p-1 text-xs font-semibold text-muted-foreground shadow-2xs'>
          {(
            [
              { value: 'WEEK', label: 'Tuần này' },
              { value: 'MONTH', label: 'Tháng này' },
              { value: 'ALL_TIME', label: 'Tất cả' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type='button'
              onClick={() => setPeriod(tab.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 transition',
                period === tab.value
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-20 space-y-3'>
          <div className='size-8 animate-spin rounded-full border-3 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground font-medium'>Đang tải bảng xếp hạng...</p>
        </div>
      ) : isError ? (
        <div className='rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3'>
          <p className='text-sm text-destructive font-semibold'>Không thể tải dữ liệu bảng xếp hạng.</p>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-2xl border bg-muted/20 p-12 text-center space-y-3'>
          <Trophy className='mx-auto size-12 text-muted-foreground/50' />
          <h3 className='text-base font-bold'>Chưa có dữ liệu xếp hạng</h3>
          <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
            Hãy là người đầu tiên hoàn thành khảo sát để ghi danh trên bảng vàng!
          </p>
        </div>
      ) : (
        <div className='space-y-8'>
          {/* TOP 3 PODIUM */}
          <div className='grid gap-4 pt-6 sm:grid-cols-3 sm:items-end'>
            {/* Top 2 */}
            {top2 && <PodiumCard item={top2} rank={2} type={type} />}
            {/* Top 1 (Center, Elevated) */}
            {top1 && <PodiumCard item={top1} rank={1} type={type} />}
            {/* Top 3 */}
            {top3 && <PodiumCard item={top3} rank={3} type={type} />}
          </div>

          {/* RANKING TABLE FOR REST (4 to 50) */}
          {restItems.length > 0 && (
            <div className='overflow-hidden rounded-2xl border bg-card shadow-xs'>
              <div className='border-b bg-muted/40 px-6 py-4'>
                <h3 className='text-sm font-black uppercase tracking-wider text-muted-foreground'>
                  Bảng thứ hạng ({restItems.length + 3} thành viên)
                </h3>
              </div>
              <div className='divide-y divide-border/60'>
                {restItems.map((item) => (
                  <LeaderboardTableRow
                    key={item.userId}
                    item={item}
                    type={type}
                    isMe={user?.id === item.userId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STICKY MY RANK CARD (If logged in) */}
          {user && myRank && (
            <div className='sticky bottom-4 z-20 rounded-2xl border-2 border-primary/40 bg-background/95 p-4 shadow-xl backdrop-blur-md sm:p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex items-center gap-3.5'>
                  <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-base'>
                    #{myRank.rank}
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-bold text-foreground text-sm'>{myRank.displayName}</span>
                      <span className='rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold text-primary'>
                        Bạn
                      </span>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {myRank.school || myRank.occupation || `Level ${myRank.levelNumber} · ${myRank.levelTitle}`}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-4 text-right'>
                  {type === 'RESPONDENT' ? (
                    <div>
                      <p className='text-base font-black text-emerald-600 dark:text-emerald-400'>
                        {myRank.completedSurveysCount || 0} bài
                      </p>
                      <p className='text-[11px] text-muted-foreground'>Đã hoàn thành</p>
                    </div>
                  ) : (
                    <div>
                      <p className='text-base font-black text-indigo-600 dark:text-indigo-400'>
                        {myRank.totalResponsesCollected || 0} lượt
                      </p>
                      <p className='text-[11px] text-muted-foreground'>Thu hút phản hồi</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PodiumCard({
  item,
  rank,
  type
}: {
  item: LeaderboardItem
  rank: 1 | 2 | 3
  type: LeaderboardType
}) {
  const configs = {
    1: {
      border: 'border-amber-400/60 bg-linear-to-b from-amber-500/15 via-background to-background',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950',
      badgeText: '🥇 TOP 1',
      medalColor: 'text-amber-400',
      scale: 'sm:-translate-y-4 shadow-lg ring-2 ring-amber-400/30'
    },
    2: {
      border: 'border-slate-300/60 bg-linear-to-b from-slate-400/10 via-background to-background',
      badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-500 text-white',
      badgeText: '🥈 TOP 2',
      medalColor: 'text-slate-400',
      scale: ''
    },
    3: {
      border: 'border-amber-700/40 bg-linear-to-b from-amber-700/10 via-background to-background',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-amber-800 text-white',
      badgeText: '🥉 TOP 3',
      medalColor: 'text-amber-700',
      scale: ''
    }
  }[rank]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.1 }}
      className={cn(
        'relative flex flex-col items-center rounded-3xl border p-6 text-center transition-transform',
        configs.border,
        configs.scale
      )}
    >
      {/* Crown / Rank Badge */}
      <span className={cn('absolute -top-3.5 rounded-full px-3 py-1 text-xs font-black shadow-md', configs.badgeBg)}>
        {configs.badgeText}
      </span>

      {/* Avatar Circle */}
      <div className='relative mt-2 size-20 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-md'>
        {item.avatarUrl ? (
          <img src={item.avatarUrl} alt={item.displayName} className='size-full object-cover' />
        ) : (
          <span className='font-black text-2xl text-primary uppercase'>
            {item.displayName.charAt(0)}
          </span>
        )}
        <span className='absolute bottom-0 inset-x-0 bg-primary/90 text-[10px] font-bold text-white py-0.5'>
          Lv.{item.levelNumber}
        </span>
      </div>

      {/* Name & School */}
      <h4 className='mt-3.5 font-black text-foreground text-base line-clamp-1' title={item.displayName}>
        {item.displayName}
      </h4>
      <p className='text-xs text-muted-foreground line-clamp-1 mt-0.5'>
        {item.school || item.occupation || item.levelTitle}
      </p>

      {/* Main Metric Stat Box */}
      <div className='mt-4 w-full rounded-2xl bg-muted/40 p-3 space-y-1 border border-border/50'>
        {type === 'RESPONDENT' ? (
          <>
            <div className='text-2xl font-black text-emerald-600 dark:text-emerald-400'>
              {item.completedSurveysCount || 0}
            </div>
            <p className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
              Khảo sát hoàn thành
            </p>
          </>
        ) : (
          <>
            <div className='text-2xl font-black text-indigo-600 dark:text-indigo-400'>
              {item.totalResponsesCollected || 0}
            </div>
            <p className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
              Phản hồi thu hút
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}

function LeaderboardTableRow({
  item,
  type,
  isMe
}: {
  item: LeaderboardItem
  type: LeaderboardType
  isMe: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 transition hover:bg-muted/30',
        isMe && 'bg-primary/5 hover:bg-primary/10'
      )}
    >
      <div className='flex items-center gap-4 min-w-0'>
        {/* Rank Number */}
        <span className='w-7 text-center font-black text-muted-foreground text-sm'>
          #{item.rank}
        </span>

        {/* Avatar */}
        <div className='relative size-10 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border'>
          {item.avatarUrl ? (
            <img src={item.avatarUrl} alt={item.displayName} className='size-full object-cover' />
          ) : (
            <span className='font-bold text-sm text-primary uppercase'>
              {item.displayName.charAt(0)}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='font-bold text-foreground text-sm truncate'>{item.displayName}</span>
            {isMe && (
              <span className='rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary'>
                Bạn
              </span>
            )}
          </div>
          <p className='text-xs text-muted-foreground truncate'>
            {item.school || item.occupation || `Level ${item.levelNumber} · ${item.levelTitle}`}
          </p>
        </div>
      </div>

      {/* Metric Stat */}
      <div className='text-right shrink-0 pl-4'>
        {type === 'RESPONDENT' ? (
          <div>
            <span className='text-sm font-black text-emerald-600 dark:text-emerald-400'>
              {item.completedSurveysCount || 0} bài
            </span>
            <p className='text-[11px] text-muted-foreground'>Đã hoàn thành</p>
          </div>
        ) : (
          <div>
            <span className='text-sm font-black text-indigo-600 dark:text-indigo-400'>
              {item.totalResponsesCollected || 0} lượt
            </span>
            <p className='text-[11px] text-muted-foreground'>{item.createdSurveysCount || 0} khảo sát</p>
          </div>
        )}
      </div>
    </div>
  )
}
