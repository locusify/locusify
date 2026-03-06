import { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import { useReplayStore } from '@/stores/replayStore'

/**
 * Renders a progressively-drawn trajectory line (no full-route preview).
 * Two layers on the same source:
 * 1. Glow layer (wide, blurred, low opacity) - conditional on template config
 * 2. Main progress line (narrow, opaque)
 */
export function TrajectoryLineLayer() {
  const waypoints = useReplayStore(s => s.waypoints)
  const currentWaypointIndex = useReplayStore(s => s.currentWaypointIndex)
  const segmentProgress = useReplayStore(s => s.segmentProgress)
  const currentPosition = useReplayStore(s => s.currentPosition)
  const lineStyle = useReplayStore(s => s.templateConfig.lineStyle)

  // Progress route GeoJSON — only the traveled portion
  const progressGeoJson = useMemo<GeoJSON.FeatureCollection>(() => {
    if (waypoints.length < 2 || !currentPosition) {
      return { type: 'FeatureCollection', features: [] }
    }

    const coordinates: [number, number][] = []
    for (let i = 0; i <= currentWaypointIndex && i < waypoints.length; i++) {
      coordinates.push(waypoints[i].position)
    }

    // Append interpolated current position if mid-segment
    if (currentWaypointIndex < waypoints.length - 1 && segmentProgress > 0) {
      coordinates.push(currentPosition)
    }

    if (coordinates.length < 2) {
      return { type: 'FeatureCollection', features: [] }
    }

    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      }],
    }
  }, [waypoints, currentWaypointIndex, segmentProgress, currentPosition])

  if (waypoints.length < 2)
    return null

  return (
    <Source id="trajectory-progress" type="geojson" data={progressGeoJson}>
      {lineStyle.glow && (
        <Layer
          id="trajectory-glow-line"
          type="line"
          paint={{
            'line-color': lineStyle.color,
            'line-width': lineStyle.width * 3.3,
            'line-opacity': 0.15,
            'line-blur': 6,
          }}
          layout={{
            'line-join': 'round',
            'line-cap': 'round',
          }}
        />
      )}
      <Layer
        id="trajectory-progress-line"
        type="line"
        paint={{
          'line-color': lineStyle.color,
          'line-width': lineStyle.width,
          'line-opacity': 0.9,
        }}
        layout={{
          'line-join': 'round',
          'line-cap': 'round',
        }}
      />
    </Source>
  )
}
