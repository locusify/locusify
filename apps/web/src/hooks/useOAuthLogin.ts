import { useState } from 'react'
import supabase from '@/lib/supabase'

/** supported OAuth providers */
export type OAuthProvider = 'google' | 'github'

export function useOAuthLogin() {
  /** Loading state */
  const [loading, setLoading] = useState(false)

  /** Error state */
  const [error, setError] = useState<string | null>(null)

  /**
   * @description Sign in with a provider
   * @param provider - The provider to sign in with
   * @returns {Promise<void>}
   */
  const signInWithProvider = async (provider: OAuthProvider): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      })

      if (error)
        throw error
    }
    catch (err) {
      console.error(`${provider} login error:`, err)
      const errorMessage = err instanceof Error
        ? err.message
        : `${provider} login failed`
      setError(errorMessage)
    }
    finally {
      setLoading(false)
    }
  }

  return { signInWithProvider, loading, error }
}
