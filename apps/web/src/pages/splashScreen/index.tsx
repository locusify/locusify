import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import logoUrl from '@/assets/locusify.png'
import { LoginForm } from '@/components/login-form'
import { SignupForm } from '@/components/signup-form'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import supabase from '@/lib/supabase'

type AuthMode = 'login' | 'signup' | null

/**
 * Load splash screen resources (ads, config, etc.)
 * You can add your advertisement loading logic here
 */
async function loadSplashResources() {
  // TODO: Implement advertisement loading
  // Example:
  // const ads = await fetchSplashAd()
  // return ads

  // Placeholder: simulate 2 seconds resource loading
  return new Promise(resolve => setTimeout(resolve, 2000))
}

const SplashScreen: FC = () => {
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>(null)

  // Initialize: Check authentication and load resources
  useEffect(() => {
    const initialize = async () => {
      try {
        // Run authentication check and resource loading in parallel
        const [sessionResult] = await Promise.all([
          supabase.auth.getSession(),
          loadSplashResources(), // Load ads, config, etc.
        ])

        const { data: { session } } = sessionResult

        setHasSession(!!session)
        setIsReady(true)
      }
      catch (error) {
        console.error('Initialization error:', error)
        setIsReady(true) // Still mark as ready to show auth buttons
      }
    }

    initialize()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && isReady) {
        navigate('/explore', { replace: true })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, isReady])

  // Navigate when ready and has session
  useEffect(() => {
    if (isReady && hasSession) {
      navigate('/explore', { replace: true })
    }
  }, [isReady, hasSession, navigate])

  const handleCloseDrawer = () => {
    setAuthMode(null)
  }

  const handleAuthSuccess = () => {
    // Close drawer, auth state change will trigger navigation
    setAuthMode(null)
  }

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white text-primary/80 px-6">
      {/* Logo and Loading Section - Top positioned */}
      <div className="flex flex-col items-center w-full pt-32">
        <div className="flex size-40 items-center justify-center mb-8">
          <img src={logoUrl} alt="Locusify Logo" className="size-full" />
        </div>

        {/* Loading Animation - Always show while not ready */}
        {!isReady && (
          <div className="transition-all duration-1000">
            <div className="flex space-x-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="size-2 animate-bounce rounded-full bg-primary/60"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1" />

      {/* Auth Buttons - Fixed at bottom with fade-in animation */}
      {isReady && !hasSession && (
        <div className="w-full max-w-md pb-safe mb-8 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Button
            className="text-white w-full"
            size="sm"
            onClick={() => setAuthMode('login')}
          >
            Login
          </Button>
          <Button
            className="w-full hover:bg-transparent"
            variant="outline"
            size="sm"
            onClick={() => setAuthMode('signup')}
          >
            Sign up
          </Button>
        </div>
      )}

      {/* Login/Signup Drawer */}
      <Drawer
        open={authMode !== null}
        onOpenChange={handleCloseDrawer}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-md overflow-y-auto max-h-[80vh] pb-8">
            <DrawerHeader>
              <DrawerTitle>
                {authMode === 'login' ? 'Login to your account' : 'Create an account'}
              </DrawerTitle>
              <DrawerDescription>
                {authMode === 'login'
                  ? 'Enter your email and password to login'
                  : 'Enter your information to create a new account'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              {authMode === 'login'
                ? (
                    <LoginForm
                      showTitle={false}
                      onSuccess={handleAuthSuccess}
                      onSwitchToSignup={() => setAuthMode('signup')}
                    />
                  )
                : (
                    <SignupForm
                      showTitle={false}
                      onSuccess={handleAuthSuccess}
                      onSwitchToLogin={() => setAuthMode('login')}
                    />
                  )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default SplashScreen
