import {
  BadgeDollarSign,
  ChartSpline,
  ChartNoAxesCombined,
  ClipboardList,
  Coins,
  LogOut,
  Repeat2,
  ShieldCheck,
  Trophy,
  UserRound
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'

import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { path } from '@/config/path'
import { useLogoutMutation } from '@/hooks/queries/auth/use-logout-mutation'
import { useCreditWalletQuery } from '@/hooks/queries/credit/use-credit-queries'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/utils/utils'

const navigationItems = [
  { to: path.dashboard, label: 'Tổng quan', icon: ChartNoAxesCombined },
  { to: path.exchange, label: 'Đổi khảo sát', icon: Repeat2 },
  { to: path.mySurveys, label: 'Khảo sát của tôi', icon: ClipboardList },
  { to: path.leaderboard, label: 'Bảng xếp hạng', icon: Trophy },
  { to: path.tracking, label: 'Theo dõi dữ liệu', icon: ChartSpline },
  { to: path.credits, label: 'Credits & thưởng', icon: Coins },
  { to: path.pricing, label: 'Bảng giá', icon: BadgeDollarSign },
  { to: path.profile, label: 'Hồ sơ cá nhân', icon: UserRound }
]

export function AppShell() {
  const user = useAuthStore((state) => state.user)
  const logoutMutation = useLogoutMutation()
  const walletQuery = useCreditWalletQuery()

  const isAdmin = user?.roles?.some((r) => r === 'ADMIN' || r === 'ROLE_ADMIN')
  const allNavItems = isAdmin
    ? [...navigationItems, { to: path.adminTracking, label: 'Admin Tracking', icon: ShieldCheck }]
    : navigationItems

  return (
    <div className='unisurvey-shell min-h-screen lg:grid lg:grid-cols-[270px_1fr]'>
      <aside className='unisurvey-sidebar sticky top-0 hidden h-screen px-6 py-6 lg:flex lg:flex-col'>
        <Link aria-label='Trang chủ SurveyFlow' className='px-1' to={path.home}>
          <Brand />
        </Link>
        <nav aria-label='Điều hướng ứng dụng' className='mt-9 grid gap-2'>
          {allNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'unisurvey-nav-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-primary',
                  to === path.adminTracking && !isActive && 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                )
              }
              key={to}
              to={to}
            >
              <Icon className='size-4' /> {label}
            </NavLink>
          ))}
        </nav>
        <Link
          className='unisurvey-account hover:ring-primary/20 mt-auto block rounded-2xl p-4 transition hover:ring-2'
          to={path.profile}
        >
          <p className='text-foreground truncate text-sm font-black'>{user?.email}</p>
          <p className='text-muted-foreground mt-1 text-xs'>Xem hồ sơ cá nhân</p>
        </Link>
        <div className='px-1'>
          <Button
            className='mt-3 w-full justify-start font-bold border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive transition-colors'
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            size='sm'
            variant='ghost'
          >
            <LogOut className='text-destructive' /> {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Button>
        </div>
      </aside>
      <div className='min-w-0'>
        <header className='unisurvey-topbar sticky top-0 z-20 flex min-h-[76px] items-center justify-between px-5 lg:px-8'>
          <Link className='lg:hidden' to={path.home}>
            <Brand />
          </Link>
          <span className='text-muted-foreground hidden text-sm font-bold lg:inline'>
            Không gian nghiên cứu của bạn
          </span>
          <span className='bg-secondary/10 text-secondary flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black'>
            <BadgeDollarSign className='size-3.5' /> {walletQuery.data?.spendableBalance ?? '—'}{' '}
            Credits
          </span>
        </header>
        <nav
          aria-label='Điều hướng ứng dụng trên điện thoại'
          className='border-border/70 flex gap-1 overflow-x-auto border-b bg-white px-3 py-2 lg:hidden'
        >
          {allNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold',
                  isActive ? 'bg-primary text-white' : 'text-muted-foreground'
                )
              }
              key={to}
              to={to}
            >
              <Icon className='size-3.5' /> {label}
            </NavLink>
          ))}
          <button
            type='button'
            className='flex shrink-0 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors'
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className='size-3.5 text-destructive' /> {logoutMutation.isPending ? '...' : 'Đăng xuất'}
          </button>
        </nav>
        <main className='mx-auto max-w-7xl p-5 sm:p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
