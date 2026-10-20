import { Plus, RefreshCw, SearchX, Sparkles } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import { SurveyDiscoveryCard } from '@/components/SurveyDiscoveryCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { path } from '@/config/path'
import { useCategoriesQuery } from '@/hooks/queries/metadata/use-categories-query'
import {
  useSurveyDiscoveryQuery,
  useSurveyRecommendationsQuery
} from '@/hooks/queries/survey/use-survey-discovery'
import type { SurveySort } from '@/types/survey-discovery.type'
import type { SurveySummary } from '@/types/survey-management.type'
import { getErrorMessage } from '@/utils/error'
import { discoveryOptions, discoverySearch, SURVEY_SORT_OPTIONS } from '@/utils/survey-discovery'

export function SurveyExchangePage() {
  const [params, setParams] = useSearchParams()
  const options = discoveryOptions(params)
  const query = useSurveyDiscoveryQuery(options)
  const recommendationsQuery = useSurveyRecommendationsQuery(3)
  const categories = useCategoriesQuery()
  const search = discoverySearch(options)
  return (
    <div className='space-y-6'>
      <header className='unisurvey-window flex flex-col justify-between gap-5 p-6 sm:p-8 lg:flex-row lg:items-center'>
        <div>
          <span className='eyebrow'>Khám phá khảo sát</span>
          <h1 className='mt-2 text-3xl font-black'>Khảo sát dành cho bạn</h1>
          <p className='text-muted-foreground mt-3 max-w-2xl'>
            Tìm hiểu mục đích nghiên cứu, phần thưởng và yêu cầu trước khi chọn khảo sát phù hợp.
          </p>
        </div>
        <Button asChild className='brand-gradient shrink-0 text-white'>
          <Link to={path.createSurvey}>
            <Plus aria-hidden /> Tạo khảo sát
          </Link>
        </Button>
      </header>

      {options.page === 1 && (
        <section className='unisurvey-card border-primary/20 bg-linear-to-br from-primary/5 via-sky-500/5 to-transparent space-y-4 p-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='bg-primary/10 text-primary grid size-8 place-items-center rounded-lg'>
                <Sparkles className='size-4' />
              </span>
              <div>
                <h2 className='text-lg font-black'>✨ Gợi ý khảo sát hôm nay dành riêng cho bạn</h2>
                <p className='text-muted-foreground text-xs'>
                  Phân tích bởi AI Matching dựa trên sở thích và hồ sơ cá nhân của bạn
                </p>
              </div>
            </div>
            <span className='bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full border border-emerald-500/20 px-3 py-1 text-xs font-black'>
              AI Powered
            </span>
          </div>

          {recommendationsQuery.isPending && (
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              {Array.from({ length: 3 }, (_, index) => (
                <div className='unisurvey-card space-y-4 p-5' key={index}>
                  <Skeleton className='h-5 w-20' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-12 w-full' />
                </div>
              ))}
            </div>
          )}

          {recommendationsQuery.data && recommendationsQuery.data.length > 0 && (
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              {recommendationsQuery.data.map((rec) => {
                const summaryItem: SurveySummary = {
                  id: rec.id,
                  creatorId: 0,
                  categoryId: null,
                  provider: 'GOOGLE_FORMS',
                  estimatedDurationSeconds: 180,
                  availableSlots: Math.max(0, rec.targetResponseCount - rec.currentResponseCount),
                  deadline: rec.deadline,
                  createdAt: '',
                  title: rec.title,
                  rewardCredit: rec.rewardCredit,
                  targetResponseCount: rec.targetResponseCount,
                  currentResponseCount: rec.currentResponseCount,
                  status: rec.status
                }
                return (
                  <SurveyDiscoveryCard
                    key={`rec-${rec.id}`}
                    survey={summaryItem}
                    detailUrl={`${path.exchange}/${rec.id}?${search}`}
                    category={rec.categoryName ?? 'Gợi ý AI'}
                    matchScore={rec.matchScore}
                  />
                )
              })}
            </div>
          )}
        </section>
      )}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <p className='text-muted-foreground text-sm' role='status'>
          {query.data
            ? `${query.data.totalElements} khảo sát phù hợp với hồ sơ của bạn`
            : 'Danh sách khảo sát phù hợp với hồ sơ của bạn'}
        </p>
        <div className='flex flex-wrap items-end gap-3'>
          <div>
            <label className='mb-1 block text-xs font-bold' htmlFor='survey-sort'>
              Sắp xếp
            </label>
            <select
              id='survey-sort'
              className='border-input bg-background focus-visible:ring-ring rounded-lg border px-3 py-2 text-sm focus-visible:ring-2'
              value={options.sort}
              onChange={(event) =>
                setParams(discoverySearch({ page: 1, sort: event.target.value as SurveySort }))
              }
            >
              {SURVEY_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant='outline'
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RefreshCw aria-hidden />
            {query.isFetching ? 'Đang tải…' : 'Làm mới'}
          </Button>
        </div>
      </div>
      {query.isPending && (
        <section
          className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'
          aria-label='Đang tải khảo sát'
          aria-busy='true'
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div className='unisurvey-card space-y-5 p-6' key={index}>
              <Skeleton className='h-6 w-24' />
              <Skeleton className='h-14 w-full' />
              <Skeleton className='h-20 w-full' />
            </div>
          ))}
        </section>
      )}
      {query.isError && (
        <section className='unisurvey-card space-y-3 p-6' role='alert'>
          <h2 className='font-bold'>Chưa tải được danh sách khảo sát</h2>
          <p className='text-muted-foreground'>{getErrorMessage(query.error)}</p>
          <Button
            variant='outline'
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Thử lại
          </Button>
        </section>
      )}
      {query.data?.items.length === 0 && !query.isError && (
        <section className='unisurvey-card space-y-4 p-8 text-center'>
          <SearchX className='text-primary mx-auto size-9' aria-hidden />
          <h2 className='text-xl font-black'>
            {query.data.totalElements ? 'Trang này không có khảo sát' : 'Chưa có khảo sát phù hợp'}
          </h2>
          <p className='text-muted-foreground'>
            Bạn có thể cập nhật hồ sơ để nhận các khảo sát phù hợp hơn hoặc quay lại kiểm tra sau.
          </p>
          {options.page > 1 ? (
            <Button
              variant='outline'
              onClick={() => setParams(discoverySearch({ ...options, page: 1 }))}
            >
              Về trang đầu
            </Button>
          ) : (
            <Button asChild variant='outline'>
              <Link to={path.profile}>Cập nhật hồ sơ</Link>
            </Button>
          )}
        </section>
      )}
      {query.data && query.data.items.length > 0 && (
        <>
          <section
            className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'
            aria-label='Danh sách khảo sát'
          >
            {query.data.items.map((survey) => (
              <SurveyDiscoveryCard
                key={survey.id}
                survey={survey}
                detailUrl={`${path.exchange}/${survey.id}?${search}`}
                category={
                  categories.data?.find((category) => category.id === survey.categoryId)?.name
                }
              />
            ))}
          </section>
          {query.data.totalPages > 1 && (
            <nav
              aria-label='Phân trang khảo sát'
              className='flex flex-wrap items-center justify-center gap-3'
            >
              <Button
                variant='outline'
                disabled={options.page <= 1 || query.isFetching}
                onClick={() => setParams(discoverySearch({ ...options, page: options.page - 1 }))}
              >
                Trang trước
              </Button>
              <span className='text-muted-foreground text-sm'>
                Trang {options.page}/{query.data.totalPages}
              </span>
              <Button
                variant='outline'
                disabled={options.page >= query.data.totalPages || query.isFetching}
                onClick={() => setParams(discoverySearch({ ...options, page: options.page + 1 }))}
              >
                Trang sau
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
