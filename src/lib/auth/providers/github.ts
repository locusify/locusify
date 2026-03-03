import type { AuthProvider } from '../types'
import { GitHubIcon } from '@/components/ui/github-icon'
import { supabase } from '@/lib/supabase'

async function login(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${window.location.origin}/map` },
  })
  if (error)
    throw error
}

export const githubProvider: AuthProvider = {
  type: 'github',
  name: 'GitHub',
  icon: GitHubIcon,
  login,
}
