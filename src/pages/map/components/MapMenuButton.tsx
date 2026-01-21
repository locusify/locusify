import type { FC } from 'react'
import { m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface MenuItemProps {
  icon: string
  label: string
  onClick?: () => void
}

interface MapMenuButtonProps {
  onUploadClick?: () => void
}

/**
 * MapMenuButton component
 * @description A collapsible menu button in the bottom-right corner that expands upward
 */
export const MapMenuButton: FC<MapMenuButtonProps> = ({ onUploadClick }) => {
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
      onClick: () => console.log('Routes clicked'),
    },
    {
      icon: 'i-mingcute-share-3-line',
      label: t('menu.share', { defaultValue: 'Share' }),
      onClick: () => console.log('Share clicked'),
    },
  ]

  return (
    <m.div
      className="absolute bottom-4 right-4 z-40 flex flex-col-reverse gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Upload Button - Will appear above menu button due to flex-col-reverse */}
      <div className="border-red/30 bg-material-thick overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px]">
        <button
          type="button"
          onClick={onUploadClick}
          className="group hover:bg-red/10 active:bg-red/20 relative flex size-12 items-center justify-center transition-colors"
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
          className="group hover:bg-fill-secondary active:bg-fill-tertiary relative flex size-12 items-center justify-center transition-colors"
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
              <button
                type="button"
                onClick={() => {
                  item.onClick?.()
                  setIsExpanded(false)
                }}
                className="group hover:bg-fill-secondary active:bg-fill-tertiary flex items-center justify-center p-3 transition-colors size-full"
                title={item.label}
              >
                <i className={cn(item.icon, 'text-text size-5 transition-transform group-hover:scale-110 group-active:scale-95')} />
              </button>
            </div>
          ))}
        </div>
      </m.div>
    </m.div>
  )
}
