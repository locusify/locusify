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
        'flex flex-col items-center h-screen w-screen pt-40 bg-white text-primary/80',
      )}
    >
      {/* Logo Section */}
      {/* Locusify Logo */}
      <div className="flex h-40 w-40 items-center justify-center">
        <img src={logoUrl} alt="Locusify Logo" className="h-full w-full" />
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
    </div>
  )
}

export default SplashScreen
