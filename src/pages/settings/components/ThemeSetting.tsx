import type { FC } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settingsStore'

type ThemeOption = 'light' | 'dark' | 'system'

const themeOptions: { value: ThemeOption, icon: string, labelKey: string }[] = [
  { value: 'light', icon: 'i-mingcute-sun-line', labelKey: 'settings.theme.light' },
  { value: 'dark', icon: 'i-mingcute-moon-line', labelKey: 'settings.theme.dark' },
  { value: 'system', icon: 'i-mingcute-computer-line', labelKey: 'settings.theme.system' },
]

export const ThemeSetting: FC = () => {
  const { t } = useTranslation()
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme()
  const { theme, setTheme } = useSettingsStore()

  const currentTheme = nextTheme as ThemeOption ?? theme

  const handleChange = (value: ThemeOption) => {
    setNextTheme(value)
    setTheme(value)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="i-mingcute-paint-brush-line size-4 text-text/50" />
        <span className="text-sm font-medium text-text">{t('settings.theme.label')}</span>
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-fill-secondary p-1">
        {themeOptions.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleChange(opt.value)}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
              currentTheme === opt.value
                ? 'bg-white/90 dark:bg-white/15 text-text shadow-sm'
                : 'text-text/50 hover:text-text',
            )}
            title={t(opt.labelKey)}
          >
            <span className={cn(opt.icon, 'size-3.5')} />
          </button>
        ))}
      </div>
    </div>
  )
}
