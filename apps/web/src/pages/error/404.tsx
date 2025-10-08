import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

const NotFound: FC = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold text-gray-300">
          {t('error.404.title')}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mt-4">
          {t('error.404.message')}
        </p>
        <p className="text-sm sm:text-base text-gray-500 mt-2 px-4">
          {t('error.404.description')}
        </p>
        <Button className="mt-6">
          <Link to="/">{t('error.404.backHome')}</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
