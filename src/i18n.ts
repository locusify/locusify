/**
 * @fileoverview Internationalization configuration for Locusify using Zustand store
 * @description This module configures i18next with Zustand for state management,
 * providing language detection and switching functionality for the application.
 */

import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { create } from 'zustand'

import en from '@/locales/en.json'
import zh from '@/locales/zh-CN.json'

/**
 * Supported languages in the application
 * @description Array of language codes that the application supports
 */
export const langs = ['en', 'zh-CN'] as const

/**
 * Available namespaces for translations
 * @description Array of namespace identifiers used for organizing translations
 */
export const ns = ['app'] as const

/**
 * Default namespace for translations
 * @description The primary namespace used when no specific namespace is provided
 */
export const defaultNS = 'app' as const

/**
 * Translation resources organized by language and namespace
 * @description Object containing all translation strings organized by language code and namespace
 */
const resources = {
  'en': {
    app: en,
  },
  'zh-CN': {
    app: zh,
  },
} satisfies Record<
  (typeof langs)[number],
  Record<(typeof ns)[number], Record<string, string>>
>

/**
 * i18next instance for the application
 * @description Configured i18next instance with language detection and React integration
 */
const i18n = i18next.createInstance()

// Configure i18next with plugins and settings
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: {
      default: ['en'],
    },
    defaultNS: 'app',
    resources,
    keySeparator: false, // 禁用key分隔符，支持扁平化key
    nsSeparator: false, // 禁用命名空间分隔符
  })

/**
 * Interface for the i18n Zustand store
 * @description Defines the shape of the internationalization store state and actions
 */
interface I18nStore {
  /** The i18next instance */
  i18n: typeof i18n
  /** Current active language code */
  language: string
  /**
   * Function to change the application language
   * @param lng - The language code to switch to
   */
  changeLanguage: (lng: string) => void
}

/**
 * Zustand store for managing i18n state
 * @description Global store that manages the current language and provides language switching functionality
 */
export const useI18nStore = create<I18nStore>((set, get) => ({
  i18n,
  language: i18n.language || 'en',
  changeLanguage: (lng: string) => {
    const { i18n } = get()
    i18n.changeLanguage(lng)
    set({ language: lng })
  },
}))

/**
 * Utility function to get the i18n instance
 * @description Helper function to access the i18n instance outside of React components
 */
export const getI18n = () => useI18nStore.getState().i18n
