import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useI18nStore } from '@/i18n'

type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: Theme
  language: string
  setTheme: (theme: Theme) => void
  setLanguage: (lang: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      theme: 'dark',
      language: 'en',
      setTheme: theme => set({ theme }),
      setLanguage: (lang) => {
        set({ language: lang })
        useI18nStore.getState().changeLanguage(lang)
      },
    }),
    {
      name: 'locusify-settings',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          useI18nStore.getState().changeLanguage(state.language)
        }
      },
    },
  ),
)
