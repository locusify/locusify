import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import logoUrl from '@/assets/locusify.png'
import { Button } from '@/components/ui/button'
import { useAuthState } from '@/hooks/useAuthState'
import { AuthDrawer } from './components/auth-drawer'

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
  const { hasSession, isReady } = useAuthState()
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const [resourcesLoaded, setResourcesLoaded] = useState(false)

  // Load splash resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        await loadSplashResources()
      }
      catch (error) {
        console.error('Error loading splash resources:', error)
      }
      finally {
        setResourcesLoaded(true)
      }
    }

    loadResources()
  }, [])

  // Navigate when ready and has session
  useEffect(() => {
    if (isReady && resourcesLoaded && hasSession) {
      navigate('/explore', { replace: true })
    }
  }, [isReady, resourcesLoaded, hasSession, navigate])

  /** Handle close drawer */
  const handleCloseDrawer = () => {
    setAuthMode(null)
  }

  /** Handle auth success */
  const handleAuthSuccess = () => {
    // Close drawer, auth state change will trigger navigation
    setAuthMode(null)
  }

  /** Show content when resources are loaded and ready */
  const showContent = isReady && resourcesLoaded

  return (
    <div className="relative flex justify-between flex-col items-center h-dvh bg-white text-primary/80 px-6 py-30">
      {/* Logo and Loading Section - Top positioned */}
      <div className="flex flex-col items-center w-full">
        <div className="flex size-40 items-center justify-center mb-8">
          <img src={logoUrl} alt="Locusify Logo" className="size-full" />
        </div>

        {/* Loading Animation - Always show while not ready */}
        {!showContent && (
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

      {/* Auth Buttons - Fixed at bottom with fade-in animation */}
      {showContent && !hasSession && (
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
      <AuthDrawer
        mode={authMode}
        onClose={handleCloseDrawer}
        onAuthSuccess={handleAuthSuccess}
        onSwitchMode={setAuthMode}
      />
    </div>
  )
}

export default SplashScreen
