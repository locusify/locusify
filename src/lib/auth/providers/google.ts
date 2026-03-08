import type { AuthProvider } from '../types'
import { GoogleIcon } from '@/components/ui/google-icon'
import { env } from '@/lib/env'

async function login(): Promise<void> {
  const redirectUri = `${window.location.origin}/auth/callback`
  window.location.href = `${env.VITE_API_BASE_URL}/api/v1/auth/oauth/google?redirect_uri=${encodeURIComponent(redirectUri)}`
}

export const googleProvider: AuthProvider = {
  type: 'google',
  name: 'Google',
  icon: GoogleIcon,
  login,
}
