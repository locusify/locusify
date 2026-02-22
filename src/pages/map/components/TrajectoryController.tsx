import { useEffect } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { useReplayStore } from '@/stores/replayStore'

/**
 * Pure logic component: tracks the interpolated replay position in real-time.
 *
 * Previously subscribed to currentWaypointIndex and called flyTo() on each
 * waypoint transition, which caused a visible 1-beat lag — the camera only
 * started moving after the marker had already left the waypoint.
 *
 * Now subscribes directly to currentPosition (updated every RAF frame by the
 * replay store) and calls jumpTo() each frame, so the camera is always in
 * sync with the animated marker. The first frame uses flyTo() to smoothly
 * bring the viewport to the starting position.
 */
export function TrajectoryController() {
  const { current: map } = useMap()

  useEffect(() => {
    if (!map)
      return

    let initialised = false

    return useReplayStore.subscribe((state) => {
      if (state.status === 'idle' || !state.currentPosition) {
        // Reset so the next replay gets a fresh flyTo entrance.
        initialised = false
        return
      }

      if (!initialised) {
        initialised = true
        map.flyTo({ center: state.currentPosition, zoom: 12, duration: 800 })
        return
      }

      // Track interpolated position every frame — zero camera lag.
      // Only the center is updated; zoom is left to the user after the
      // initial flyTo so they can zoom in/out freely during playback.
      map.jumpTo({ center: state.currentPosition })
    })
  }, [map])

  return null
}
