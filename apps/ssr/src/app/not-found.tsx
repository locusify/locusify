'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold text-gray-300">
          {t.error[404].title}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mt-4">
          {t.error[404].message}
        </p>
        <p className="text-sm sm:text-base text-gray-500 mt-2 px-4">
          {t.error[404].description}
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          {t.error[404].backHome}
        </Link>
      </div>
    </div>
  )
}
