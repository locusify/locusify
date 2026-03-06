import type { User } from '@supabase/supabase-js'
import type { AuthUser } from '@/lib/auth/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

export interface UserProfile {
  id: string
  displayName: string
  avatarUrl: string
  provider: string
}

interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  isLoggingIn: boolean
  setUser: (user: AuthUser) => void
  setProfile: (profile: UserProfile | null) => void
  clearUser: () => void
  setLoggingIn: (v: boolean) => void
}

function mapSupabaseUser(user: User): AuthUser {
  const rawProvider = user.app_metadata.provider
  const provider: AuthUser['provider'] = rawProvider === 'github' ? 'github' : 'google'
  return {
    id: user.id,
    name: user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.user_name || 'User',
    avatarUrl: user.user_metadata.avatar_url || '',
    email: user.email,
    provider,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      profile: null,
      isLoggingIn: false,
      setUser: user => set({ user, isLoggingIn: false }),
      setProfile: profile => set({ profile }),
      clearUser: () => {
        set({ user: null, profile: null })
        useSubscriptionStore.getState().clear()
      },
      setLoggingIn: isLoggingIn => set({ isLoggingIn }),
    }),
    {
      name: 'locusify-auth',
      partialize: state => ({ user: state.user }),
    },
  ),
)

async function fetchProfileAndSubscription(userId: string) {
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, provider')
    .eq('id', userId)
    .single()

  if (profile) {
    useAuthStore.getState().setProfile({
      id: profile.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      provider: profile.provider,
    })
  }

  // Fetch subscription
  await useSubscriptionStore.getState().fetchSubscription(userId)
}

export async function initializeAuth() {
  // Hydrate from existing session
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    useAuthStore.getState().setUser(mapSupabaseUser(session.user))
    fetchProfileAndSubscription(session.user.id).catch(console.error)
  }
  else {
    useAuthStore.getState().clearUser()
  }

  // Listen for auth state changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      useAuthStore.getState().setUser(mapSupabaseUser(session.user))
      fetchProfileAndSubscription(session.user.id).catch(console.error)
    }
    else {
      useAuthStore.getState().clearUser()
    }
  })
}
