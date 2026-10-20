import { HomePage } from '@/pages/HomePage'

export function meta() {
  return [
    { title: 'SurveyFlow — Khảo sát tốt hơn, insight rõ hơn' },
    {
      name: 'description',
      content: 'Tạo khảo sát, kết nối cộng đồng và thu thập phản hồi chất lượng cùng SurveyFlow.'
    }
  ]
}

export default function Home() {
  return <HomePage />
}
