import { LeaderboardPage } from '@/pages/LeaderboardPage'

export function meta() {
  return [
    { title: 'Bảng xếp hạng SurveyFlow — Top thành viên & Tác giả nổi bật' },
    {
      name: 'description',
      content: 'Vinh danh các thành viên tích cực nhất và tác giả nghiên cứu hàng đầu trên cộng đồng SurveyFlow.'
    }
  ]
}

export default function LeaderboardRoute() {
  return <LeaderboardPage />
}
