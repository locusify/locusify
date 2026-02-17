import { AnimatePresence, m } from 'motion/react'
import { useReplayStore } from '@/stores/replayStore'

/**
 * Shows the current waypoint's photo card.
 * Only re-renders on waypoint index change, not every frame.
 */
export function ReplayPhotoCard() {
  const waypoints = useReplayStore(s => s.waypoints)
  const currentWaypointIndex = useReplayStore(s => s.currentWaypointIndex)

  const waypoint = waypoints[currentWaypointIndex] ?? null

  return (
    <AnimatePresence mode="wait">
      {waypoint && (
        <m.div
          key={waypoint.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-material-thick border-fill-tertiary flex items-center gap-3 rounded-2xl border p-3 shadow-2xl backdrop-blur-[120px]"
        >
          <div className="size-16 flex-shrink-0 overflow-hidden rounded-xl">
            <img
              src={waypoint.photo.previewUrl}
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-text truncate text-sm font-medium">
              {waypoint.locationName || `Point ${waypoint.index + 1}`}
            </p>
            <p className="text-text-secondary mt-1 text-xs">
              {waypoint.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-text-tertiary mt-0.5 text-xs">
              {waypoint.position[1].toFixed(4)}
              ,
              {' '}
              {waypoint.position[0].toFixed(4)}
            </p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
