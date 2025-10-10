import { useCallback, useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

export function useAuthState() {
  /** Whether the user has a session */
  const [hasSession, setHasSession] = useState(false)

  /** Whether the auth state is ready */
  const [isReady, setIsReady] = useState(false)

  /**
   * @description Initialize the auth state
   */
  const initialize = useCallback(async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setHasSession(!!session)
    }
    catch (error) {
      console.error('Error checking auth session:', error)
    }
    finally {
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    initialize()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setHasSession(!!session)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { hasSession, isReady }
}
