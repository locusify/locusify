import en from './en'
import zhCN from './zh-CN'

export const LANG_OPTIONS = {
  'en': 'English',
  'zh-CN': '中文',
} as const

export const ALL_LANGS = Object.keys(LANG_OPTIONS) as Array<keyof typeof LANG_OPTIONS>

export const LANG_MAP = {
  en,
  'zh-CN': zhCN,
} as const
