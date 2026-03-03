import type { ComponentType } from 'react'

export type AuthProviderType = 'google' | 'github'

export interface AuthUser {
  id: string
  name: string
  avatarUrl: string
  email?: string
  provider: AuthProviderType
}

export interface AuthProvider {
  type: AuthProviderType
  name: string
  icon: ComponentType
  login: () => Promise<AuthUser>
}
