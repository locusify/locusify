import { useEffect, useRef } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { useReplayStore } from '@/stores/replayStore'

/**
 * Pure logic component: flies the map camera to each new waypoint.
 * Only re-renders when currentWaypointIndex changes (not every frame).
 */
export function TrajectoryController() {
  const { current: map } = useMap()
  const waypoints = useReplayStore(s => s.waypoints)
  const currentWaypointIndex = useReplayStore(s => s.currentWaypointIndex)
  const status = useReplayStore(s => s.status)
  const prevIndexRef = useRef(-1)

  useEffect(() => {
    if (!map || status === 'idle')
      return
    if (prevIndexRef.current === currentWaypointIndex)
      return
    if (currentWaypointIndex >= waypoints.length)
      return

    prevIndexRef.current = currentWaypointIndex

    const waypoint = waypoints[currentWaypointIndex]
    map.flyTo({
      center: waypoint.position,
      zoom: 12,
      duration: 1200,
    })
  }, [map, currentWaypointIndex, waypoints, status])

  return null
}
