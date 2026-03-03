import type { AuthProvider, AuthUser } from '../types'
import { GitHubIcon } from '@/components/ui/github-icon'
import { env } from '@/lib/env'

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_API_USER_URL = 'https://api.github.com/user'

function openPopup(url: string): Window | null {
  const w = 500
  const h = 600
  const left = window.screenX + (window.innerWidth - w) / 2
  const top = window.screenY + (window.innerHeight - h) / 2
  return window.open(url, 'github-oauth', `width=${w},height=${h},left=${left},top=${top}`)
}

function waitForCode(popup: Window): Promise<string> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval)
          reject(new Error('Popup closed by user'))
          return
        }
        const url = popup.location.href
        if (url.includes('code=')) {
          clearInterval(interval)
          const code = new URL(url).searchParams.get('code')
          popup.close()
          if (code) resolve(code)
          else reject(new Error('No code in callback URL'))
        }
      }
      catch {
        // Cross-origin — popup still on GitHub's domain, keep polling
      }
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      if (!popup.closed) popup.close()
      reject(new Error('GitHub OAuth timeout'))
    }, 120_000)
  })
}

async function exchangeCodeForToken(code: string): Promise<string> {
  const proxyUrl = env.VITE_GITHUB_PROXY_URL
  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error('Token exchange failed')
  const data = await res.json()
  return data.access_token
}

async function fetchGitHubUser(token: string): Promise<AuthUser> {
  const res = await fetch(GITHUB_API_USER_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch GitHub user')
  const data = await res.json()
  return {
    id: String(data.id),
    name: data.name || data.login,
    avatarUrl: data.avatar_url,
    email: data.email ?? undefined,
    provider: 'github',
  }
}

async function login(): Promise<AuthUser> {
  const clientId = env.VITE_GITHUB_CLIENT_ID
  const proxyUrl = env.VITE_GITHUB_PROXY_URL
  if (!clientId || !proxyUrl) {
    throw new Error('NOT_CONFIGURED')
  }

  const authorizeUrl = `${GITHUB_AUTHORIZE_URL}?client_id=${clientId}&scope=read:user,user:email`
  const popup = openPopup(authorizeUrl)
  if (!popup) throw new Error('Popup blocked')

  const code = await waitForCode(popup)
  const token = await exchangeCodeForToken(code)
  return fetchGitHubUser(token)
}

export const githubProvider: AuthProvider = {
  type: 'github',
  name: 'GitHub',
  icon: GitHubIcon,
  login,
}
