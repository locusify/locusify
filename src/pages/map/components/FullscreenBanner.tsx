import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { cn, glassPanel } from '@/lib/utils'

interface FullscreenBannerProps {
  onDismiss: () => void
  onDismissForever: () => void
  onEnterFullscreen: () => void
}

export function FullscreenBanner({ onDismiss, onDismissForever, onEnterFullscreen }: FullscreenBannerProps) {
  const { t } = useTranslation()

  return (
    <m.div
      className="absolute top-3 inset-x-0 z-50 flex justify-center"
      style={{ paddingTop: 'var(--safe-area-top)' }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div className={cn(glassPanel, 'flex items-center gap-3 px-4 py-2.5')}>
        {/* Clickable area — icon + text → enters fullscreen */}
        <button
          type="button"
          onClick={onEnterFullscreen}
          className="flex items-center gap-2 transition-opacity hover:opacity-80 active:opacity-60"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-400/15">
            <i className="i-mingcute-fullscreen-line text-base text-teal-400" />
          </div>
          <span className="text-text text-sm font-medium">
            {t('map.fullscreen.tapToEnter')}
          </span>
        </button>

        {/* Separator */}
        <div className="bg-fill-tertiary h-5 w-px shrink-0" />

        {/* Don't show again */}
        <button
          type="button"
          onClick={onDismissForever}
          className="text-text-secondary shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-xs transition-colors hover:bg-white/10 active:bg-white/15"
        >
          {t('map.fullscreen.dontShowAgain')}
        </button>

        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          className="text-text-secondary shrink-0 flex size-7 items-center justify-center rounded-lg border border-white/10 transition-colors hover:bg-white/10 active:bg-white/15"
        >
          <i className="i-mingcute-close-line text-sm" />
        </button>
      </div>
    </m.div>
  )
}
