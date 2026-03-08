import type { FC } from 'react'
import type { AuthProvider, AuthProviderType } from '@/lib/auth/types'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { EmailLoginForm } from '@/components/auth/EmailLoginForm'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { getAuthProviders } from '@/lib/auth'
import { cn, glassPanel } from '@/lib/utils'
import { logout, useAuthStore } from '@/stores/authStore'

interface LoginDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const LoginDrawer: FC<LoginDrawerProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const isLoggingIn = useAuthStore(s => s.isLoggingIn)
  const setLoggingIn = useAuthStore(s => s.setLoggingIn)
  const [activeProvider, setActiveProvider] = useState<AuthProviderType | null>(null)

  const handleLogin = useCallback(async (provider: AuthProvider) => {
    if (isLoggingIn)
      return

    setLoggingIn(true)
    setActiveProvider(provider.type)
    try {
      await provider.login()
      // Redirect flow — page will navigate away; no need to close drawer
    }
    catch {
      toast.error(t('auth.error'))
      setLoggingIn(false)
      setActiveProvider(null)
    }
  }, [isLoggingIn, setLoggingIn, t])

  const handleLogout = useCallback(async () => {
    await logout()
    onOpenChange(false)
  }, [onOpenChange])

  const providers = getAuthProviders()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh] border-none bg-transparent backdrop-blur-none">
        <DrawerHeader className="hidden">
          <DrawerTitle>{t('auth.drawer.login.title')}</DrawerTitle>
          <DrawerDescription>{t('auth.drawer.login.description')}</DrawerDescription>
        </DrawerHeader>
        <div className={cn(glassPanel, 'flex flex-col overflow-hidden rounded-t-2xl')}>
          <div className="flex-1 overflow-y-auto p-4 pb-safe">
            {user
              ? (
                  /* Logged-in state */
                  <div className="flex flex-col items-center gap-4 py-4">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="size-16 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-text text-sm">
                      {t('auth.loggedInAs', { name: user.name })}
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="bg-fill-secondary hover:bg-fill-tertiary text-text w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                    >
                      {t('auth.logout')}
                    </button>
                  </div>
                )
              : (
                  /* Login state */
                  <div className="flex flex-col gap-4 py-2">
                    <div className="text-center">
                      <h2 className="text-text text-lg font-semibold">{t('auth.drawer.login.title')}</h2>
                      <p className="text-text-secondary mt-1 text-sm">{t('auth.drawer.login.description')}</p>
                    </div>

                    <Separator className="bg-fill-secondary" />

                    <EmailLoginForm onSuccess={() => onOpenChange(false)} />

                    <div className="flex items-center gap-3">
                      <Separator className="bg-fill-secondary flex-1" />
                      <span className="text-text-secondary text-xs">{t('auth.email.separator')}</span>
                      <Separator className="bg-fill-secondary flex-1" />
                    </div>

                    <div className="flex flex-col gap-3">
                      {providers.map((provider) => {
                        const isActive = activeProvider === provider.type
                        return (
                          <button
                            key={provider.type}
                            type="button"
                            disabled={isLoggingIn}
                            onClick={() => handleLogin(provider)}
                            className={cn(
                              'bg-fill-secondary hover:bg-fill-tertiary flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                              'text-text disabled:opacity-50',
                              isActive && 'cursor-wait',
                              isLoggingIn && !isActive && 'cursor-not-allowed',
                            )}
                          >
                            {isActive ? <Spinner className="size-6" /> : <provider.icon />}
                            <span>
                              {provider.type === 'google'
                                ? t('auth.login.oauth.google')
                                : t('auth.login.oauth.github')}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
