import { useReplayStore } from '@/stores/replayStore'
import { PhotoMarkerPin } from '../PhotoMarkerPin'

/**
 * Shows the current waypoint's photo on the map during replay.
 * Reuses PhotoMarkerPin with isSelected={true} to show the expanded card.
 */
export function ReplayPhotoCard() {
  const waypoints = useReplayStore(s => s.waypoints)
  const currentWaypointIndex = useReplayStore(s => s.currentWaypointIndex)

  const waypoint = waypoints[currentWaypointIndex] ?? null

  if (!waypoint)
    return null

  return (
    <PhotoMarkerPin
      marker={waypoint.marker}
      isSelected
    />
  )
}
