import type { FC } from 'react'
import { useEffect, useState } from 'react'
import logoUrl from '@/assets/locusify.png'
import { cn } from '@/lib/utils'

const SplashScreen: FC = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    /**
     * @description Dynamically import i18n to initialize the language
     */
    import('@/i18n')
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        'flex h-screen w-screen flex-col items-center justify-center',
        'bg-white text-primary/80',
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          'mb-8 transition-all duration-1000',
          isLoaded ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
        )}
      >
        {/* Locusify Logo */}
        <div className="flex h-24 w-24 items-center justify-center">
          <img
            src={logoUrl}
            alt="Locusify Logo"
            className="h-full w-full"
          />
        </div>
        {/* Animated pulse rings */}
        <div className="absolute inset-0 -z-10 animate-ping rounded-2xl bg-primary/10" />
        <div
          className="absolute inset-0 -z-20 animate-pulse rounded-2xl bg-primary/5"
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      {/* Brand Name */}
      <div
        className={cn(
          'mb-4 transition-all duration-1000 delay-300',
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <h1 className="text-6xl font-black">Locusify</h1>
      </div>

      {/* Tagline */}
      <div
        className={cn(
          'mb-12 transition-all duration-1000 delay-500',
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <p className="text-center text-lg font-light">
          Transform your photos into journeys
        </p>
      </div>

      {/* Loading Animation */}
      <div
        className={cn(
          'transition-all duration-1000 delay-700',
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-8 flex justify-center left-0 right-0">
        <div
          className={cn(
            'transition-all duration-1000 delay-1000',
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
        >
          <div className="flex items-center space-x-2 text-sm text-primary/70">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Intelligent Travel Companion</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
