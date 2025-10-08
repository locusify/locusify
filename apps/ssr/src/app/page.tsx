'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

export default function SplashScreen() {
  const { t } = useTranslation()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center h-screen w-screen pt-40 bg-white text-primary/80 relative">
      <LanguageSwitcher />
      {/* Logo Section */}
      <div className="flex h-40 w-40 items-center justify-center">
        <Image
          src="/locusify.png"
          alt="Locusify Logo"
          width={160}
          height={160}
          className="h-full w-full"
        />
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

      {/* Navigation Link */}
      <div className="mt-8">

        <Link href="/explore">
          {t.explore.title}
        </Link>

      </div>
    </div>
  )
}
