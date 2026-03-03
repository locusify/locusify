import type { AuthProvider, AuthUser } from '../types'
import { GoogleIcon } from '@/components/ui/google-icon'
import { env } from '@/lib/env'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          prompt: (notification?: (n: { isNotDisplayed: () => boolean }) => void) => void
          renderButton: (el: HTMLElement, config: { theme: string, size: string }) => void
          revoke: (hint: string, callback?: () => void) => void
        }
      }
    }
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

let sdkLoaded = false

function loadGoogleSdk(): Promise<void> {
  if (sdkLoaded && window.google?.accounts)
    return Promise.resolve()

  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      // Script already in DOM, wait for it
      const check = setInterval(() => {
        if (window.google?.accounts) {
          sdkLoaded = true
          clearInterval(check)
          resolve()
        }
      }, 50)
      setTimeout(() => { clearInterval(check); reject(new Error('Google SDK timeout')) }, 5000)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => { sdkLoaded = true; resolve() }
    script.onerror = () => reject(new Error('Failed to load Google SDK'))
    document.head.appendChild(script)
  })
}

async function login(): Promise<AuthUser> {
  const clientId = env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('NOT_CONFIGURED')
  }

  await loadGoogleSdk()

  return new Promise<AuthUser>((resolve, reject) => {
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        try {
          const payload = decodeJwtPayload(response.credential)
          resolve({
            id: payload.sub as string,
            name: (payload.name as string) || 'Google User',
            avatarUrl: payload.picture as string || '',
            email: payload.email as string | undefined,
            provider: 'google',
          })
        }
        catch {
          reject(new Error('Failed to decode Google credential'))
        }
      },
    })

    window.google!.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        // Fallback: render a hidden button and click it
        let container = document.getElementById('g-signin-fallback')
        if (!container) {
          container = document.createElement('div')
          container.id = 'g-signin-fallback'
          container.style.position = 'fixed'
          container.style.top = '-9999px'
          document.body.appendChild(container)
        }
        window.google!.accounts.id.renderButton(container, { theme: 'outline', size: 'large' })
        const btn = container.querySelector<HTMLElement>('[role="button"]')
        if (btn) {
          btn.click()
        }
        else {
          reject(new Error('Google sign-in prompt was not displayed'))
        }
      }
    })
  })
}

export const googleProvider: AuthProvider = {
  type: 'google',
  name: 'Google',
  icon: GoogleIcon,
  login,
}
