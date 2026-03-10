import type { FC } from 'react'
import { Camera, Map, Video } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import locusifyLogo from '@/assets/locusify.png'

const SplashScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/map', { replace: true }), 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="relative flex flex-col items-center min-h-dvh bg-white dark:bg-gray-950">
      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-between w-full h-dvh px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center flex-1 justify-center max-w-2xl animate-in fade-in duration-500">
          {/* Logo */}
          <div className="flex size-28 md:size-36 items-center justify-center mb-8 md:mb-12">
            <img src={locusifyLogo} alt="Locusify Logo" className="size-full" />
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
              <Map className="size-4" />
              <span>{t('splash.features.routeMaps')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="size-4" />
              <span>{t('splash.features.autoVlogs')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
