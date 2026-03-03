import type { AuthProvider } from '@/lib/auth/types'
import type { FC } from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { getAuthProviders } from '@/lib/auth'
import { cn, glassPanel } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

interface LoginDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const LoginDrawer: FC<LoginDrawerProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const isLoggingIn = useAuthStore(s => s.isLoggingIn)
  const setUser = useAuthStore(s => s.setUser)
  const clearUser = useAuthStore(s => s.clearUser)
  const setLoggingIn = useAuthStore(s => s.setLoggingIn)

  const handleLogin = useCallback(async (provider: AuthProvider) => {
    if (isLoggingIn) return

    setLoggingIn(true)
    try {
      const authUser = await provider.login()
      setUser(authUser)
      onOpenChange(false)
    }
    catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message === 'NOT_CONFIGURED') {
        toast.error(t('auth.notConfigured'))
      }
      else if (message === 'Popup blocked') {
        toast.error(t('auth.popupBlocked'))
      }
      else if (message !== 'Popup closed by user') {
        toast.error(t('auth.error'))
      }
    }
    finally {
      setLoggingIn(false)
    }
  }, [isLoggingIn, setLoggingIn, setUser, onOpenChange, t])

  const handleLogout = useCallback(() => {
    clearUser()
    onOpenChange(false)
  }, [clearUser, onOpenChange])

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

                    <div className="flex flex-col gap-3">
                      {providers.map(provider => (
                        <button
                          key={provider.type}
                          type="button"
                          disabled={isLoggingIn}
                          onClick={() => handleLogin(provider)}
                          className={cn(
                            'bg-fill-secondary hover:bg-fill-tertiary flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                            'text-text disabled:opacity-50',
                          )}
                        >
                          <provider.icon />
                          <span>
                            {provider.type === 'google'
                              ? t('auth.login.oauth.google')
                              : t('auth.login.oauth.github')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
