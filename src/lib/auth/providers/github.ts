import type { AuthProvider } from '../types'
import { GitHubIcon } from '@/components/ui/github-icon'
import { env } from '@/lib/env'

async function login(): Promise<void> {
  const url = new URL(`${env.VITE_API_BASE_URL}/api/v1/auth/oauth/github`)
  url.searchParams.set('redirect_uri', env.VITE_OAUTH_REDIRECT_URI)
  window.location.href = url.toString()
}

export const githubProvider: AuthProvider = {
  type: 'github',
  name: 'GitHub',
  icon: GitHubIcon,
  login,
}
