const STORAGE_KEY = 'locusify-tokens'

interface Tokens {
  accessToken: string
  refreshToken: string
}

export function getTokens(): { accessToken: string | null, refreshToken: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return { accessToken: null, refreshToken: null }
    const parsed: Tokens = JSON.parse(raw)
    return { accessToken: parsed.accessToken ?? null, refreshToken: parsed.refreshToken ?? null }
  }
  catch {
    return { accessToken: null, refreshToken: null }
  }
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }))
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken(): string | null {
  return getTokens().accessToken
}
