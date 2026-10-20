import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { useCreatorSurveysQuery } from '@/hooks/queries/survey/use-survey-creator'
import { getErrorMessage } from '@/utils/error'

const STATUS = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đang mở',
  CLOSED: 'Đã đóng',
  ARCHIVED: 'Đã lưu trữ'
}
export function MySurveysPage() {
  const [page, setPage] = useState(1)
  const query = useCreatorSurveysQuery(page)
  return (
    <div>
      <section className='flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
        <div>
          <span className='eyebrow'>Khảo sát của tôi</span>
          <h1 className='mt-2 text-3xl font-black'>Quản lý khảo sát</h1>
          <p className='text-muted-foreground mt-2'>
            Tạo bản nháp, kết nối Google Forms và xuất bản khảo sát.
          </p>
        </div>
        <Button asChild className='brand-gradient text-white'>
          <Link to='/create-survey'>
            <Plus /> Tạo bản nháp
          </Link>
        </Button>
      </section>
      {query.isPending && (
        <p role='status' className='mt-6'>
          Đang tải khảo sát…
        </p>
      )}
      {query.isError && (
        <div role='alert' className='mt-6'>
          <p>{getErrorMessage(query.error)}</p>
          <Button variant='outline' onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </div>
      )}
      {query.data?.items.length === 0 && (
        <p className='unisurvey-card mt-6 p-6'>Chưa có khảo sát. Tạo bản nháp để bắt đầu.</p>
      )}
      <section className='mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {query.data?.items.map((survey) => (
          <article className='unisurvey-card flex flex-col p-6' key={survey.id}>
            <span className='text-primary text-sm font-bold'>{STATUS[survey.status]}</span>
            <h2 className='mt-4 text-lg font-black'>{survey.title}</h2>
            <p className='text-muted-foreground mt-2 text-sm'>
              {survey.currentResponseCount}/{survey.targetResponseCount} phản hồi ·{' '}
              {survey.rewardCredit} Credits / phản hồi
            </p>
            <Button asChild className='mt-6 self-start' size='sm' variant='outline'>
              <Link to={`/my-surveys/${survey.id}`}>
                {survey.status === 'DRAFT' ? 'Sửa và cấu hình' : 'Quản lý khảo sát'}
              </Link>
            </Button>
          </article>
        ))}
      </section>
      {query.data && query.data.totalPages > 1 && (
        <nav
          aria-label='Phân trang khảo sát'
          className='mt-6 flex items-center justify-center gap-4'
        >
          <Button
            variant='outline'
            disabled={page <= 1 || query.isFetching}
            onClick={() => setPage((value) => value - 1)}
          >
            Trang trước
          </Button>
          <span>
            Trang {page}/{query.data.totalPages}
          </span>
          <Button
            variant='outline'
            disabled={page >= query.data.totalPages || query.isFetching}
            onClick={() => setPage((value) => value + 1)}
          >
            Trang sau
          </Button>
        </nav>
      )}
    </div>
  )
}
