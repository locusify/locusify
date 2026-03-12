import { useEffect } from 'react'
import { isWeb } from '@/platforms'
import { useFullscreenStore } from '@/stores/fullscreenStore'

export function useFullscreenSuggestion() {
  const bannerOpen = useFullscreenStore(s => s.bannerOpen)
  const dismissed = useFullscreenStore(s => s.dismissed)
  const openBanner = useFullscreenStore(s => s.openBanner)
  const closeBanner = useFullscreenStore(s => s.closeBanner)
  const dismissForever = useFullscreenStore(s => s.dismissForever)

  // Auto-open banner on mount if conditions are met
  useEffect(() => {
    if (isWeb() && document.fullscreenEnabled && !document.fullscreenElement && !dismissed) {
      openBanner()
    }
  }, [dismissed, openBanner])

  return {
    fullscreenSuggestionOpen: bannerOpen,
    dismiss: closeBanner,
    dismissForever,
  }
}
