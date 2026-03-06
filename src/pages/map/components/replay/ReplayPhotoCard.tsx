import { m } from 'motion/react'
import { useMemo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { LazyImage } from '@/components/ui/lazy-image'
import {
  CONNECTOR_COLOR,
  CONNECTOR_DASH,
  CONNECTOR_STROKE_WIDTH,
  PHOTO_CARD_OFFSET,
  PHOTO_CARD_OFFSET_SM,
} from '@/data/waypointStyle'
import { formatCoordinates, formatDate } from '@/lib/formatters'
import { getFilterStyle } from '@/lib/replay/filters'
import { getTransitionVariants } from '@/lib/replay/transitions'
import { useReplayStore } from '@/stores/replayStore'

// ─── Dashed connector SVG ────────────────────────────────────────────────────

function DashedConnector({ dx, dy }: { dx: number, dy: number }) {
  // SVG viewBox sized to cover from (0,0) to the offset point
  const minX = Math.min(0, dx)
  const minY = Math.min(0, dy)
  const w = Math.abs(dx) + CONNECTOR_STROKE_WIDTH * 2
  const h = Math.abs(dy) + CONNECTOR_STROKE_WIDTH * 2

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      style={{
        transform: `translate(${minX}px, ${minY}px)`,
        width: w,
        height: h,
        overflow: 'visible',
      }}
    >
      <line
        x1={-minX}
        y1={-minY}
        x2={dx - minX}
        y2={dy - minY}
        stroke={CONNECTOR_COLOR}
        strokeWidth={CONNECTOR_STROKE_WIDTH}
        strokeDasharray={CONNECTOR_DASH.join(' ')}
      />
    </svg>
  )
}

// ─── Offset calculation ──────────────────────────────────────────────────────

function useCardOffset(waypointIndex: number) {
  const waypoints = useReplayStore(s => s.waypoints)

  return useMemo(() => {
    const wp = waypoints[waypointIndex]
    const nextWp = waypoints[waypointIndex + 1]

    // Use responsive default
    const isSmall = typeof window !== 'undefined' && window.innerWidth < 640
    const base = isSmall ? PHOTO_CARD_OFFSET_SM : PHOTO_CARD_OFFSET

    if (!wp || !nextWp) {
      const fallbackSide = waypointIndex % 2 === 0 ? 1 : -1
      return { dx: base.dx * fallbackSide, dy: base.dy }
    }

    // Compute bearing from current to next waypoint
    const dLng = nextWp.position[0] - wp.position[0]
    const dLat = nextWp.position[1] - wp.position[1]
    const bearing = Math.atan2(dLng, dLat) // radians, 0 = north

    // Alternate sides: even indices → right, odd indices → left
    const side = waypointIndex % 2 === 0 ? 1 : -1
    const perpAngle = bearing + (Math.PI / 2) * side
    const dist = Math.sqrt(base.dx ** 2 + base.dy ** 2)

    // Minimum distance to prevent card from overlapping the avatar
    const minDist = isSmall ? 70 : 120
    const safeDist = Math.max(dist, minDist)

    // Convert angle to pixel offset (note: screen Y is inverted vs lat)
    const dx = Math.round(Math.sin(perpAngle) * safeDist)
    const dy = Math.round(-Math.cos(perpAngle) * safeDist)

    return { dx, dy }
  }, [waypoints, waypointIndex])
}

// ─── Single photo card ───────────────────────────────────────────────────────

function PhotoCard({ waypointIndex, zIndex }: { waypointIndex: number, zIndex: number }) {
  const waypoint = useReplayStore(s => s.waypoints[waypointIndex])
  const templateConfig = useReplayStore(s => s.templateConfig)
  const offset = useCardOffset(waypointIndex)

  if (!waypoint)
    return null

  const { marker } = waypoint
  const { photo } = marker
  const [lng, lat] = waypoint.position

  const filterStyle = getFilterStyle(templateConfig.filter.type, templateConfig.filter.intensity)
  const transition = getTransitionVariants(templateConfig.transitions.type, templateConfig.transitions.duration)

  return (
    <Marker longitude={lng} latitude={lat} anchor="center" style={{ zIndex }}>
      <div className="relative">
        {/* Dashed connector from waypoint center to card */}
        <DashedConnector dx={offset.dx} dy={offset.dy} />

        {/* Photo card with offset transform */}
        <div style={{ transform: `translate(${offset.dx}px, ${offset.dy}px)` }}>
          <m.div
            initial={transition.initial}
            animate={transition.animate}
            transition={transition.transition}
            className="w-48 overflow-hidden rounded-xl border border-white/20 bg-white/75 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-[80px] sm:w-56 dark:border-white/10 dark:bg-black/65"
          >
            {/* Photo */}
            <div
              className="relative aspect-[4/3] overflow-hidden bg-black/30 dark:bg-black/50"
              style={filterStyle ? { filter: filterStyle } : undefined}
            >
              {photo.thumbnailUrl && (
                <LazyImage
                  src={photo.thumbnailUrl}
                  alt={photo.title || marker.id}
                  className="size-full"
                  objectFit="contain"
                  rootMargin="200px"
                  threshold={0.1}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Date overlay */}
              {photo.dateTaken && (
                <div className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[9px] text-white/90 sm:text-[10px]">
                  <i className="i-mingcute-calendar-line" />
                  <span>
                    {formatDate(new Date(photo.dateTaken), {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Description + metadata */}
            <div className="space-y-1 px-2 py-1.5 sm:px-2.5 sm:py-2">
              {/* Description — diary feel */}
              {photo.description && (
                <p className="line-clamp-2 text-[10px] italic leading-tight text-text/70 sm:text-[11px]">
                  {photo.description}
                </p>
              )}

              {/* Coordinates & altitude — small auxiliary info */}
              <div className="space-y-0.5 text-[9px] text-text/40">
                <div className="flex items-center gap-1">
                  <i className="i-mingcute-location-line shrink-0" />
                  <span className="truncate font-mono">
                    {formatCoordinates(marker.latitude, marker.longitude, marker.latitudeRef, marker.longitudeRef)}
                  </span>
                </div>
                {marker.altitude !== undefined && (
                  <div className="flex items-center gap-1">
                    <i className="i-mingcute-mountain-2-line shrink-0" />
                    <span className="font-mono">
                      {marker.altitudeRef === 'Below Sea Level' ? '-' : ''}
                      {Math.abs(marker.altitude).toFixed(1)}
                      m
                    </span>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </Marker>
  )
}

// ─── Container component ─────────────────────────────────────────────────────

/**
 * Renders accumulated photo cards for visited waypoints.
 * Cards appear after the avatar passes each waypoint and remain permanently.
 */
export function ReplayPhotoCard() {
  const waypoints = useReplayStore(s => s.waypoints)
  const currentWaypointIndex = useReplayStore(s => s.currentWaypointIndex)
  const status = useReplayStore(s => s.status)

  const visitedIndices = useMemo(() => {
    const indices: number[] = []
    for (let i = 0; i < waypoints.length; i++) {
      if (i <= currentWaypointIndex || status === 'completed') {
        indices.push(i)
      }
    }
    return indices
  }, [waypoints.length, currentWaypointIndex, status])

  return (
    <>
      {visitedIndices.map((idx, order) => (
        <PhotoCard
          key={waypoints[idx].id}
          waypointIndex={idx}
          zIndex={order + 1}
        />
      ))}
    </>
  )
}
