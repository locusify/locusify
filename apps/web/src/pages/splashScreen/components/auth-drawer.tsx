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
  return (
    <Drawer open={mode !== null} onOpenChange={onClose} shouldScaleBackground={false} modal dismissible>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto max-h-[80vh] pb-8">
          <DrawerHeader>
            <DrawerTitle>
              {mode === 'login' ? 'Login to your account' : 'Create an account'}
            </DrawerTitle>
            <DrawerDescription>
              {mode === 'login'
                ? 'Enter your email and password to login'
                : 'Enter your information to create a new account'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
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
