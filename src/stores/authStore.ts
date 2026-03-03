import type { AuthUser } from '@/lib/auth/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: AuthUser | null
  isLoggingIn: boolean
  setUser: (user: AuthUser) => void
  clearUser: () => void
  setLoggingIn: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isLoggingIn: false,
      setUser: user => set({ user, isLoggingIn: false }),
      clearUser: () => set({ user: null }),
      setLoggingIn: isLoggingIn => set({ isLoggingIn }),
    }),
    {
      name: 'locusify-auth',
      partialize: state => ({ user: state.user }),
    },
  ),
)
