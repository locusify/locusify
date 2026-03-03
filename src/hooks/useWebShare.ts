import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface ShareLinkOptions {
  title: string
  text?: string
  url: string
}

export function useWebShare() {
  const { t } = useTranslation()

  const shareLink = useCallback(async (options: ShareLinkOptions) => {
    if (navigator.share) {
      try {
        await navigator.share(options)
      }
      catch (error) {
        if (error instanceof Error && error.name === 'AbortError')
          return
        toast.error(t('share.error', { defaultValue: 'Failed to share' }))
      }
    }
    else {
      try {
        await navigator.clipboard.writeText(options.url)
        toast.success(t('menu.linkCopied', { defaultValue: 'Link copied to clipboard' }))
      }
      catch {
        toast.error(t('share.error', { defaultValue: 'Failed to share' }))
      }
    }
  }, [t])

  return { shareLink }
}
