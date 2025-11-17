import type { FC } from 'react'
import { Camera, Map as MapIcon, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      navigate('/map', { replace: true })
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
    <div className="relative flex flex-col items-center min-h-dvh bg-white dark:bg-gray-950">
      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-between w-full h-dvh px-6 py-12 md:py-20">
        {!showContent
          ? (
            /* Loading State */
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex size-32 md:size-40 items-center justify-center mb-8 animate-in fade-in duration-500">
                  <img src={logoUrl} alt="Locusify Logo" className="size-full" />
                </div>
                <div className="flex space-x-1.5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="size-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-600"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )
          : (
              <>
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center flex-1 justify-center max-w-2xl animate-in fade-in duration-500">
                  {/* Logo */}
                  <div className="flex size-28 md:size-36 items-center justify-center mb-8 md:mb-12">
                    <img src={logoUrl} alt="Locusify Logo" className="size-full" />
                  </div>

                  {/* Heading */}
                  <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                    {t('splash.brand.name')}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-12 md:mb-16 max-w-md">
                    {t('splash.hero.subtitle')}
                  </p>

                  {/* Simple Feature List */}
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-16 text-sm text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-2">
                      <Camera className="size-4" />
                      <span>{t('splash.features.photoUpload')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapIcon className="size-4" />
                      <span>{t('splash.features.routeMaps')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="size-4" />
                      <span>{t('splash.features.autoVlogs')}</span>
                    </div>
                  </div>
                </div>

                {/* Auth Buttons - Bottom */}
                {!hasSession && (
                  <div className="w-full max-w-sm space-y-3 animate-in fade-in duration-500 delay-150">
                    <Button
                      className="text-white w-full h-11 font-medium bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                      onClick={() => setAuthMode('login')}
                    >
                      {t('splash.cta.getStarted')}
                    </Button>
                    <Button
                      className="w-full h-11 font-medium"
                      variant="outline"
                      onClick={() => setAuthMode('signup')}
                    >
                      {t('splash.cta.createAccount')}
                    </Button>
                  </div>
                )}
              </>
            )}
      </div>

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
