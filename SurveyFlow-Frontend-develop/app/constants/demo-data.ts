export type DemoSurvey = {
  category: string
  id: number
  quality: number
  responses: number
  reward: number
  status: 'Đang thu thập' | 'Bản nháp'
  time: string
  title: string
}

export const DEMO_CREDITS = 120
export const DEMO_XP = 340
export const SURVEY_REWARD_CREDITS = 10
export const SURVEY_REWARD_XP = 15

export const DEMO_SURVEYS: DemoSurvey[] = [
  {
    id: 1,
    title: 'Thói quen học tập của sinh viên',
    category: 'Nghiên cứu học thuật',
    time: '5 phút',
    reward: 10,
    responses: 23,
    quality: 94,
    status: 'Đang thu thập'
  },
  {
    id: 2,
    title: 'Hành vi mua sắm trực tuyến',
    category: 'Nghiên cứu thị trường',
    time: '4 phút',
    reward: 10,
    responses: 45,
    quality: 91,
    status: 'Đang thu thập'
  },
  {
    id: 3,
    title: 'Trải nghiệm học trực tuyến',
    category: 'Dự án môn học',
    time: '6 phút',
    reward: 10,
    responses: 0,
    quality: 0,
    status: 'Bản nháp'
  }
]
