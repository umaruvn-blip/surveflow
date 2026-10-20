import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthUser, AuthResponse } from '@/types'

export const AUTH_STORAGE_KEY = 'auth-storage'

type AuthState = {
  /* Mốc phiên để nhận biết request thuộc lần đăng nhập cũ. */
  sessionRevision: number
  setSession: (session: AuthResponse) => void
  establishSession: (session: AuthResponse) => void
  accessToken: string | null
  isHydrated: boolean
  user: AuthUser | null
  setAccessToken: (token: string | null) => void
  setHydrated: (value: boolean) => void
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionRevision: 0,
      /* Login tạo phiên mới; refresh chỉ cập nhật phiên hiện tại. */
      establishSession: (session) =>
        set((state) => ({
          accessToken: session.accessToken,
          user: session.user,
          sessionRevision: state.sessionRevision + 1
        })),
      setSession: (session) => set({ accessToken: session.accessToken, user: session.user }),
      accessToken: null,
      isHydrated: false,
      user: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setHydrated: (value) => set({ isHydrated: value }),
      setUser: (user) => set({ user }),
      logout: () => {
        set((state) => ({
          accessToken: null,
          user: null,
          sessionRevision: state.sessionRevision + 1
        }))
      }
    }),
    {
      name: AUTH_STORAGE_KEY,
      /* Provider chủ động đọc storage ở trình duyệt sau khi render. */
      skipHydration: true,
      storage: createJSONStorage(() => sessionStorage),
      /* Chỉ lưu AT và user; các cờ nội bộ không được persist. */
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user
      }),
      /* Đọc xong storage mới cho route guard kiểm tra đăng nhập. */
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      }
    }
  )
)
