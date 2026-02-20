import type { FC } from 'react'
import { m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface MenuItemProps {
  icon: string
  label: string
  onClick?: () => void
  disabled?: boolean
  tooltip?: string
}

interface MapMenuButtonProps {
  onUploadClick?: () => void
  onRoutesClick?: () => void
  /** Whether the routes button is disabled (e.g. no photos uploaded) */
  routesDisabled?: boolean
  /** Tooltip text when routes is disabled */
  routesDisabledTooltip?: string
  /** Whether replay mode is active — shows exit button instead of menu */
  isReplayMode?: boolean
  /** Callback to exit replay mode */
  onExitReplay?: () => void
}

/**
 * MapMenuButton component
 * @description A collapsible menu button in the bottom-right corner that expands upward
 */
export const MapMenuButton: FC<MapMenuButtonProps> = ({
  onUploadClick,
  onRoutesClick,
  routesDisabled,
  routesDisabledTooltip,
  isReplayMode,
  onExitReplay,
}) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const menuItems: MenuItemProps[] = [
    {
      icon: 'i-mingcute-photo-album-line',
      label: t('menu.gallery', { defaultValue: 'Gallery' }),
      onClick: () => console.log('Gallery clicked'),
    },
    {
      icon: 'i-mingcute-route-line',
      label: t('menu.routes', { defaultValue: 'Routes' }),
      onClick: onRoutesClick,
      disabled: routesDisabled,
      tooltip: routesDisabled ? routesDisabledTooltip : undefined,
    },
    {
      icon: 'i-mingcute-share-3-line',
      label: t('menu.share', { defaultValue: 'Share' }),
      onClick: () => {
        navigator.clipboard.writeText('https://locusify.caterpillar-soft.com/')
        toast.success(t('menu.linkCopied', { defaultValue: 'Link copied to clipboard' }))
      },
    },
  ]

  // Replay mode: show only an exit button in the same position
  if (isReplayMode) {
    return (
      <m.div
        className="absolute top-3 left-2 z-40 sm:top-4 sm:left-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-material-thick border-fill-tertiary overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px]">
              <button
                type="button"
                onClick={onExitReplay}
                className="group hover:bg-fill-secondary active:bg-fill-tertiary relative flex size-10 items-center justify-center transition-colors sm:size-12"
                title={t('workspace.controls.exit', { defaultValue: 'Exit Replay' })}
              >
                <i className="i-mingcute-close-line text-text size-5 transition-transform group-hover:scale-110 group-active:scale-95" />
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            {t('workspace.controls.exit', { defaultValue: 'Exit Replay' })}
          </TooltipContent>
        </Tooltip>
      </m.div>
    )
  }

  return (
    <m.div
      className="absolute bottom-3 right-2 z-40 flex flex-col-reverse gap-2 sm:bottom-4 sm:right-4 sm:gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Upload Button - Will appear above menu button due to flex-col-reverse */}
      <div className="border-red/30 bg-material-thick overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px]">
        <button
          type="button"
          onClick={onUploadClick}
          className="group hover:bg-red/10 active:bg-red/20 relative flex size-10 items-center justify-center transition-colors sm:size-12"
          title={t('menu.upload', { defaultValue: 'Upload Photos' })}
        >
          <i className="i-mingcute-add-line text-red size-5 transition-transform group-hover:scale-110 group-active:scale-95" />
        </button>
      </div>

      {/* Menu Button - Will appear at bottom due to flex-col-reverse */}
      <div className="bg-material-thick border-fill-tertiary overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px]">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="group hover:bg-fill-secondary active:bg-fill-tertiary relative flex size-10 items-center justify-center transition-colors sm:size-12"
          title={t('menu.toggle', { defaultValue: 'Menu' })}
        >
          <i
            className={cn('text-text size-5 transition-all duration-300 group-hover:scale-110 group-active:scale-95', isExpanded ? 'i-mingcute-close-line rotate-180' : 'i-mingcute-grid-line')}
          />
        </button>
      </div>

      {/* Expanded Menu Items - Will appear above button due to flex-col-reverse */}
      <m.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="bg-material-thick border-fill-tertiary flex flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px]">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              {index > 0 && <div className="bg-fill-secondary h-px w-full" />}
              {item.tooltip
                ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          disabled={item.disabled}
                          onClick={() => {
                            if (!item.disabled) {
                              item.onClick?.()
                              setIsExpanded(false)
                            }
                          }}
                          className={cn(
                            'group flex size-10 items-center justify-center transition-colors sm:size-12',
                            item.disabled
                              ? 'cursor-not-allowed opacity-40'
                              : 'hover:bg-fill-secondary active:bg-fill-tertiary',
                          )}
                          title={item.label}
                        >
                          <i className={cn(item.icon, 'text-text size-5 transition-transform', !item.disabled && 'group-hover:scale-110 group-active:scale-95')} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  )
                : (
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        if (!item.disabled) {
                          item.onClick?.()
                          setIsExpanded(false)
                        }
                      }}
                      className={cn(
                        'group flex size-10 items-center justify-center transition-colors sm:size-12',
                        item.disabled
                          ? 'cursor-not-allowed opacity-40'
                          : 'hover:bg-fill-secondary active:bg-fill-tertiary',
                      )}
                      title={item.label}
                    >
                      <i className={cn(item.icon, 'text-text size-5 transition-transform', !item.disabled && 'group-hover:scale-110 group-active:scale-95')} />
                    </button>
                  )}
            </div>
          ))}
        </div>
      </m.div>
    </m.div>
  )
}
