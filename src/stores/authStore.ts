import type { User } from '@supabase/supabase-js'
import type { AuthUser } from '@/lib/auth/types'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: AuthUser | null
  isLoggingIn: boolean
  setUser: (user: AuthUser) => void
  clearUser: () => void
  setLoggingIn: (v: boolean) => void
}

function mapSupabaseUser(user: User): AuthUser {
  const provider = (user.app_metadata.provider === 'github' ? 'github' : 'google') as AuthUser['provider']
  return {
    id: user.id,
    name: user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.user_name || 'User',
    avatarUrl: user.user_metadata.avatar_url || '',
    email: user.email,
    provider,
  }
}

export const useAuthStore = create<AuthState>()(
  set => ({
    user: null,
    isLoggingIn: false,
    setUser: user => set({ user, isLoggingIn: false }),
    clearUser: () => set({ user: null }),
    setLoggingIn: isLoggingIn => set({ isLoggingIn }),
  }),
)

export async function initializeAuth() {
  // Clean up legacy persisted auth data
  localStorage.removeItem('locusify-auth')

  // Hydrate from existing session
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    useAuthStore.getState().setUser(mapSupabaseUser(session.user))
  }

  // Listen for auth state changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      useAuthStore.getState().setUser(mapSupabaseUser(session.user))
    }
    else {
      useAuthStore.getState().clearUser()
    }
  })
}
