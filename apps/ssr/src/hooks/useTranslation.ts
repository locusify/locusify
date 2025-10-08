'use client'

import { useEffect, useState } from 'react'
import { ALL_LANGS, LANG_MAP, LANG_OPTIONS } from '@/locales'

// 客户端安全的 localStorage 操作
function getStoredLanguage(): string | null {
  if (typeof window === 'undefined')
    return null
  try {
    return localStorage.getItem('lang')
  }
  catch {
    return null
  }
}

function setStoredLanguage(lang: string) {
  if (typeof window === 'undefined')
    return
  try {
    localStorage.setItem('lang', lang)
  }
  catch {
    // ignore
  }
}

// 获取浏览器语言
function getBrowserLanguage(): string | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined')
    return null
  try {
    const browserLang = navigator.language.toLowerCase()

    // 精确匹配
    if (ALL_LANGS.includes(browserLang as keyof typeof LANG_OPTIONS)) {
      return browserLang
    }

    // 部分匹配（例如 zh-cn 匹配 zh-CN）
    const matchedLang = ALL_LANGS.find(lang =>
      lang.toLowerCase().startsWith(browserLang.split('-')[0]),
    )

    return matchedLang || null
  }
  catch {
    return null
  }
}

// 获取当前语言
function getCurrentLanguage(): keyof typeof LANG_OPTIONS {
  const stored = getStoredLanguage()
  if (stored && ALL_LANGS.includes(stored as keyof typeof LANG_OPTIONS)) {
    return stored as keyof typeof LANG_OPTIONS
  }

  const browser = getBrowserLanguage()
  if (browser && ALL_LANGS.includes(browser as keyof typeof LANG_OPTIONS)) {
    return browser as keyof typeof LANG_OPTIONS
  }

  return 'en' // 默认语言
}

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<keyof typeof LANG_OPTIONS>('en')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const lang = getCurrentLanguage()
    setCurrentLang(lang)
  }, [])

  const changeLanguage = (lang: keyof typeof LANG_OPTIONS) => {
    setStoredLanguage(lang)
    setCurrentLang(lang)
    // 刷新页面以确保所有组件都使用新语言
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // 获取当前语言的翻译
  const locale = LANG_MAP[currentLang] || LANG_MAP.en

  return {
    t: locale,
    lang: currentLang,
    changeLang: changeLanguage,
    langOptions: LANG_OPTIONS,
    allLangs: ALL_LANGS,
    isClient, // 用于条件渲染
  }
}

// 简化的翻译函数，用于获取嵌套的翻译值
export function getTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}
