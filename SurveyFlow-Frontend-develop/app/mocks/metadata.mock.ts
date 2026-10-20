import type { Badge, Category, Interest, Level, Tag } from '@/types'

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Công nghệ', slug: 'cong-nghe', description: 'Khảo sát về công nghệ' },
  { id: 2, name: 'Giáo dục', slug: 'giao-duc', description: 'Khảo sát về giáo dục' }
]

export const MOCK_INTERESTS: Interest[] = [
  { id: 1, name: 'Công nghệ', slug: 'cong-nghe', description: 'Quan tâm đến công nghệ' },
  { id: 2, name: 'Học tập', slug: 'hoc-tap', description: 'Quan tâm đến học tập' }
]

export const MOCK_TAGS: Tag[] = [
  { id: 1, name: 'Đời sống', slug: 'doi-song' },
  { id: 2, name: 'Sinh viên', slug: 'sinh-vien' }
]

export const MOCK_BADGES: Badge[] = [
  {
    id: 1,
    code: 'FIRST_SURVEY',
    name: 'Khảo sát đầu tiên',
    description: 'Hoàn thành khảo sát đầu tiên',
    iconUrl: null
  }
]

export const MOCK_LEVELS: Level[] = [
  { id: 1, levelNumber: 1, name: 'Khởi đầu', minXp: 0 },
  { id: 2, levelNumber: 2, name: 'Khám phá', minXp: 100 }
]

export const mockMetadataApi = {
  async getCategories(): Promise<Category[]> {
    return MOCK_CATEGORIES
  },
  async getInterests(): Promise<Interest[]> {
    return MOCK_INTERESTS
  },
  async getTags(): Promise<Tag[]> {
    return MOCK_TAGS
  },
  async getBadges(): Promise<Badge[]> {
    return MOCK_BADGES
  },
  async getLevels(): Promise<Level[]> {
    return MOCK_LEVELS
  }
}
