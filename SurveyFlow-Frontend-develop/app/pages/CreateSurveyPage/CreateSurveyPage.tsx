import { Link, useNavigate } from 'react-router'
import { SurveyDraftForm } from '@/components/SurveyDraftForm'
import { Button } from '@/components/ui/button'
import { useCreatorMutations } from '@/hooks/queries/survey/use-survey-creator'
import { getErrorMessage } from '@/utils/error'
import { notify } from '@/utils/notify'

export function CreateSurveyPage() {
  const navigate = useNavigate()
  const { save } = useCreatorMutations()
  return (
    <div className='space-y-6'>
      <header>
        <span className='eyebrow'>Google Forms</span>
        <h1 className='mt-2 text-3xl font-black'>Tạo bản nháp khảo sát</h1>
        <p className='text-muted-foreground mt-3'>
          Lưu thông tin, kết nối Google Form, sau đó xuất bản khảo sát.
        </p>
      </header>
      <SurveyDraftForm
        pending={save.isPending}
        onSubmit={async (payload) => {
          try {
            const survey = await save.mutateAsync({ payload })
            notify.success('Đã lưu bản nháp.')
            navigate(`/my-surveys/${survey.id}`)
          } catch (error) {
            notify.error(getErrorMessage(error))
            return false
          }
        }}
      />
      {save.isError && (
        <p role='alert' className='text-destructive'>
          {getErrorMessage(save.error)}
        </p>
      )}
      <Button asChild variant='outline'>
        <Link to='/my-surveys'>Về khảo sát của tôi</Link>
      </Button>
    </div>
  )
}
