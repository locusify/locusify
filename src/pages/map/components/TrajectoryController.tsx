import { useEffect } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { useReplayStore } from '@/stores/replayStore'

/**
 * Pure logic component: tracks the interpolated replay position in real-time.
 *
 * On first frame, fits the map to show all waypoints so the full trajectory
 * is visible. Then tracks the interpolated position every frame via jumpTo().
 */
export function TrajectoryController() {
  const { current: map } = useMap()

  useEffect(() => {
    if (!map)
      return

    let initialised = false

    function fitToWaypoints(state: ReturnType<typeof useReplayStore.getState>) {
      const { waypoints } = state
      if (waypoints.length >= 2) {
        let minLng = Infinity
        let maxLng = -Infinity
        let minLat = Infinity
        let maxLat = -Infinity
        for (const wp of waypoints) {
          const [lng, lat] = wp.position
          if (lng < minLng) minLng = lng
          if (lng > maxLng) maxLng = lng
          if (lat < minLat) minLat = lat
          if (lat > maxLat) maxLat = lat
        }
        map!.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: 80, maxZoom: 15, duration: 800 },
        )
      }
      else if (state.currentPosition) {
        map!.flyTo({ center: state.currentPosition, zoom: 14, duration: 800 })
      }
    }

    return useReplayStore.subscribe((state, prevState) => {
      if (state.status === 'idle' || !state.currentPosition) {
        // Reset so the next replay gets a fresh fitBounds entrance.
        initialised = false
        return
      }

      // Skip camera movement during configuring phase —
      // let the user browse the map freely before playback starts.
      if (state.status === 'configuring') return

      if (!initialised) {
        initialised = true
        fitToWaypoints(state)
        return
      }

      // Every play click re-fits the map, same as the initial entrance.
      if (state.status === 'playing' && prevState.status !== 'playing') {
        fitToWaypoints(state)
        return
      }

      // Track interpolated position every frame — zero camera lag.
      map.jumpTo({ center: state.currentPosition })
    })
  }, [map])

  return null
}
