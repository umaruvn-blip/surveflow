import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { profileApi } from '@/apis/profile.api'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'
import type { ProfileUpdateRequest, UserProfile } from '@/types/profile.type'
import { notify } from '@/utils/notify'

export function useProfileQuery() {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: QUERY_KEYS.users.profile(userId),
    queryFn: profileApi.getProfile,
    enabled: userId !== undefined
  })
}

export function useUpdateProfileMutation() {
  const client = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  return useMutation({
    mutationFn: (payload: ProfileUpdateRequest) => profileApi.updateProfile(payload),
    onSuccess: (profile) => {
      client.setQueryData(QUERY_KEYS.users.profile(userId), profile)
      void client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.exchange })
      notify.success('Đã lưu hồ sơ cá nhân.')
    }
  })
}

export function useReplaceInterestsMutation() {
  const client = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  return useMutation({
    mutationFn: profileApi.replaceInterests,
    onSuccess: ({ interests }) => {
      client.setQueryData<UserProfile>(QUERY_KEYS.users.profile(userId), (profile) =>
        profile ? { ...profile, interests } : profile
      )
      void client.invalidateQueries({ queryKey: QUERY_KEYS.surveys.exchange })
      notify.success('Đã lưu sở thích của bạn.')
    }
  })
}
