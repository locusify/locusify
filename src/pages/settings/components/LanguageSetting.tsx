import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settingsStore'

const languageOptions = [
  { value: 'en', labelKey: 'settings.language.en' },
  { value: 'zh-CN', labelKey: 'settings.language.zh' },
]

export const LanguageSetting: FC = () => {
  const { t } = useTranslation()
  const { language, setLanguage } = useSettingsStore()

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="i-mingcute-translate-2-line size-4 text-text/50" />
        <span className="text-sm font-medium text-text">{t('settings.language.label')}</span>
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-fill-secondary p-1">
        {languageOptions.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLanguage(opt.value)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              language === opt.value
                ? 'bg-white/90 dark:bg-white/15 text-text shadow-sm'
                : 'text-text/50 hover:text-text',
            )}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}
