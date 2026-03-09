import type { AuthProvider } from '../types'
import { GoogleIcon } from '@/components/ui/google-icon'
import { env } from '@/lib/env'

async function login(options?: { redirectUri?: string }): Promise<void> {
  const url = new URL(`${env.VITE_API_BASE_URL}/api/v1/auth/oauth/google`)
  if (options?.redirectUri)
    url.searchParams.set('redirect_uri', options.redirectUri)
  window.location.href = url.toString()
}

export const googleProvider: AuthProvider = {
  type: 'google',
  name: 'Google',
  icon: GoogleIcon,
  login,
}
