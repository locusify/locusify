import type { ReplayTemplateConfig } from '@/types/template'
import { AnimatePresence, m } from 'motion/react'
import { formatCoordinates, formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { useReplayStore } from '@/stores/replayStore'

interface ReplayTextOverlayProps {
  config: ReplayTemplateConfig['textOverlay']
  caption?: string
}

const fontFamilyMap: Record<string, string> = {
  handwritten: 'Georgia, cursive',
  minimal: 'system-ui, sans-serif',
  bold: 'system-ui, sans-serif',
  typewriter: '"Courier New", monospace',
  neon: 'system-ui, sans-serif',
}

const styleClasses: Record<string, string> = {
  handwritten: 'italic text-sm sm:text-base',
  minimal: 'text-xs sm:text-sm font-light tracking-wide',
  bold: 'text-base sm:text-lg font-bold tracking-tight uppercase',
  typewriter: 'text-xs sm:text-sm font-mono',
  neon: 'text-sm sm:text-base font-medium',
}

const positionClasses: Record<string, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4 text-right',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4 text-right',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center',
}

export function ReplayTextOverlay({ config, caption }: ReplayTextOverlayProps) {
  const currentWaypointIndex = useReplayStore(s => s.currentWaypointIndex)
  const waypoints = useReplayStore(s => s.waypoints)
  const status = useReplayStore(s => s.status)

  if (!config.enabled || status === 'idle' || status === 'configuring')
    return null

  const waypoint = waypoints[currentWaypointIndex]
  if (!waypoint)
    return null

  const isNeon = config.style === 'neon'

  return (
    <div className={cn('pointer-events-none absolute z-30', positionClasses[config.position])}>
      <AnimatePresence mode="wait">
        <m.div
          key={currentWaypointIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[280px] space-y-0.5 sm:max-w-[360px]"
          style={{
            fontFamily: fontFamilyMap[config.style] || 'system-ui',
            color: config.color,
            ...(isNeon ? { textShadow: `0 0 8px ${config.color}, 0 0 16px ${config.color}40` } : {}),
          }}
        >
          {/* AI caption or description */}
          {caption && (
            <p className={cn(styleClasses[config.style], 'drop-shadow-lg')}>
              {caption}
            </p>
          )}

          {/* Date */}
          {config.showDate && waypoint.timestamp && (
            <p className="text-[10px] opacity-70 drop-shadow sm:text-xs">
              {formatDate(waypoint.timestamp, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}

          {/* Location coordinates */}
          {config.showLocation && (
            <p className="font-mono text-[9px] opacity-50 drop-shadow sm:text-[10px]">
              {formatCoordinates(
                waypoint.marker.latitude,
                waypoint.marker.longitude,
                waypoint.marker.latitudeRef,
                waypoint.marker.longitudeRef,
              )}
            </p>
          )}
        </m.div>
      </AnimatePresence>
    </div>
  )
}
