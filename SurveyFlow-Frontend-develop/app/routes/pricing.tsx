import { PricingPage } from '@/pages/PricingPage'

export function meta() {
  return [
    { title: 'Bảng giá SurveyFlow — SurveyFlow Plus và Credits' },
    {
      name: 'description',
      content: 'Xem giá và quyền lợi SurveyFlow Plus cùng các gói Credits đang có.'
    }
  ]
}

export default function PricingRoute() {
  return <PricingPage />
}
