import { create } from 'zustand'
import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase'

interface Subscription {
  plan: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface SubscriptionState {
  subscription: Subscription
  loading: boolean
  isPro: boolean
  fetchSubscription: (userId: string) => Promise<void>
  clear: () => void
}

const defaultSubscription: Subscription = {
  plan: 'free',
  status: 'active',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
}

export const useSubscriptionStore = create<SubscriptionState>(set => ({
  subscription: defaultSubscription,
  loading: false,
  isPro: env.VITE_DEBUG_PRO,

  fetchSubscription: async (userId: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end, cancel_at_period_end')
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !data) {
        set({ subscription: defaultSubscription, isPro: env.VITE_DEBUG_PRO, loading: false })
        return
      }

      const subscription: Subscription = {
        plan: data.plan,
        status: data.status,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
      }

      set({
        subscription,
        isPro: env.VITE_DEBUG_PRO || (data.plan.startsWith('pro')
          && data.status === 'active'
          && (!data.current_period_end || new Date(data.current_period_end) > new Date())),
        loading: false,
      })
    }
    catch {
      set({ subscription: defaultSubscription, isPro: env.VITE_DEBUG_PRO, loading: false })
    }
  },

  clear: () => set({ subscription: defaultSubscription, isPro: env.VITE_DEBUG_PRO, loading: false }),
}))
