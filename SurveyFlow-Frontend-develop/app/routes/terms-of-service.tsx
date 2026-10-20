import type { Route } from './+types/terms-of-service'
import { TermsOfServicePage } from '@/pages/TermsOfServicePage/TermsOfServicePage'

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Điều khoản dịch vụ | SurveyFlow' },
    {
      name: 'description',
      content:
        'Điều khoản và quy định sử dụng dịch vụ trên nền tảng trao đổi khảo sát SurveyFlow.'
    }
  ]
}

export default function TermsOfServiceRoute() {
  return <TermsOfServicePage />
}
