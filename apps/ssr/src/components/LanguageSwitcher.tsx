'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function LanguageSwitcher() {
  const { lang, changeLang, langOptions } = useTranslation()

  const handleLanguageChange = (newLang: string) => {
    changeLang(newLang as keyof typeof langOptions)
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <select
        value={lang}
        onChange={e => handleLanguageChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {Object.entries(langOptions).map(([code, name]) => (
          <option key={code} value={code}>
            {code === 'en' ? '🇺🇸' : '🇨🇳'}
            {' '}
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
