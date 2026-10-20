import { describe, expect, it } from 'vitest'

import {
  MOCK_BADGES,
  MOCK_CATEGORIES,
  MOCK_INTERESTS,
  MOCK_LEVELS,
  MOCK_TAGS,
  mockMetadataApi
} from '@/mocks/metadata.mock'

describe('mockMetadataApi', () => {
  it('returns typed metadata lists for demo mode', async () => {
    await expect(mockMetadataApi.getCategories()).resolves.toEqual(MOCK_CATEGORIES)
    await expect(mockMetadataApi.getInterests()).resolves.toEqual(MOCK_INTERESTS)
    await expect(mockMetadataApi.getTags()).resolves.toEqual(MOCK_TAGS)
    await expect(mockMetadataApi.getBadges()).resolves.toEqual(MOCK_BADGES)
    await expect(mockMetadataApi.getLevels()).resolves.toEqual(MOCK_LEVELS)
  })
})
