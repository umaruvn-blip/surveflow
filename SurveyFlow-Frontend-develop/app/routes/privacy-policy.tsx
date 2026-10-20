import type { Route } from './+types/privacy-policy'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage/PrivacyPolicyPage'

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Chính sách quyền riêng tư | SurveyFlow' },
    {
      name: 'description',
      content:
        'Chính sách bảo mật thông tin và quyền riêng tư người dùng trên nền tảng SurveyFlow.'
    }
  ]
}

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage />
}
