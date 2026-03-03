import type { AuthProvider } from '../types'
import { GoogleIcon } from '@/components/ui/google-icon'
import { supabase } from '@/lib/supabase'

async function login(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/map` },
  })
  if (error)
    throw error
}

export const googleProvider: AuthProvider = {
  type: 'google',
  name: 'Google',
  icon: GoogleIcon,
  login,
}
