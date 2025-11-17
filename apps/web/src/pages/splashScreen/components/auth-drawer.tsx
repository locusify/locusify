import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { LoginForm } from './login-form'
import { SignupForm } from './signup-form'

type AuthMode = 'login' | 'signup' | null

interface AuthDrawerProps {
  mode: AuthMode
  onClose: () => void
  onAuthSuccess: () => void
  onSwitchMode: (mode: AuthMode) => void
}

export function AuthDrawer({
  mode,
  onClose,
  onAuthSuccess,
  onSwitchMode,
}: AuthDrawerProps) {
  const { t } = useTranslation()

  return (
    <Drawer open={mode !== null} onOpenChange={onClose} shouldScaleBackground={false} modal dismissible>
      <DrawerContent className="border-t-0">
        <div className="mx-auto w-full max-w-md overflow-y-auto max-h-[85vh] pb-8">
          <DrawerHeader className="text-center space-y-2 pb-6">
            <DrawerTitle className="text-2xl font-bold">
              {mode === 'login' ? t('auth.drawer.login.title') : t('auth.drawer.signup.title')}
            </DrawerTitle>
            <DrawerDescription className="text-base">
              {mode === 'login'
                ? t('auth.drawer.login.description')
                : t('auth.drawer.signup.description')}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 md:px-6">
            {mode === 'login'
              ? (
                  <LoginForm
                    showTitle={false}
                    onSuccess={onAuthSuccess}
                    onSwitchToSignup={() => onSwitchMode('signup')}
                  />
                )
              : (
                  <SignupForm
                    showTitle={false}
                    onSuccess={onAuthSuccess}
                    onSwitchToLogin={() => onSwitchMode('login')}
                  />
                )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
