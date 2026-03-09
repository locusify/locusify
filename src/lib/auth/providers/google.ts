import type { AuthProvider } from '../types'
import { GoogleIcon } from '@/components/ui/google-icon'
import { env } from '@/lib/env'

async function login(): Promise<void> {
  const url = new URL(`${env.VITE_API_BASE_URL}/api/v1/auth/oauth/google`)
  url.searchParams.set('redirect_uri', env.VITE_OAUTH_REDIRECT_URI)
  window.location.href = url.toString()
}

export const googleProvider: AuthProvider = {
  type: 'google',
  name: 'Google',
  icon: GoogleIcon,
  login,
}
