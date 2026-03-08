import type { AuthProvider } from '../types'
import { GitHubIcon } from '@/components/ui/github-icon'
import { env } from '@/lib/env'

async function login(): Promise<void> {
  window.location.href = `${env.VITE_API_BASE_URL}/api/v1/auth/oauth/github`
}

export const githubProvider: AuthProvider = {
  type: 'github',
  name: 'GitHub',
  icon: GitHubIcon,
  login,
}
