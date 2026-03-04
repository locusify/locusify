import type { AvatarSource } from '@/types/replay'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useI18nStore } from '@/i18n'

type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: Theme
  language: string
  avatarSource: AvatarSource
  setTheme: (theme: Theme) => void
  setLanguage: (lang: string) => void
  setAvatarSource: (source: AvatarSource) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      theme: 'dark',
      language: 'en',
      avatarSource: { type: 'profile' } as AvatarSource,
      setTheme: theme => set({ theme }),
      setLanguage: (lang) => {
        set({ language: lang })
        useI18nStore.getState().changeLanguage(lang)
      },
      setAvatarSource: avatarSource => set({ avatarSource }),
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
