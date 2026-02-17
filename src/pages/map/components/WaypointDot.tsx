import { m } from 'motion/react'
import { Marker } from 'react-map-gl/maplibre'
import { useReplayStore } from '@/stores/replayStore'

/**
 * Pulsing dot marker at the current playback position.
 * Reads position directly from the replay store.
 */
export function WaypointDot() {
  const currentPosition = useReplayStore(s => s.currentPosition)

  if (!currentPosition)
    return null

  return (
    <Marker longitude={currentPosition[0]} latitude={currentPosition[1]} anchor="center">
      <m.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="absolute size-6 animate-ping rounded-full bg-sky-400 opacity-40" />
        <div className="relative size-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
      </m.div>
    </Marker>
  )
}
