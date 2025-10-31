import type { FC } from 'react'
import type { BaseMapProps, PhotoMarker } from '@/types/map'
import { useMemo } from 'react'
import { useMapAdapter } from '../MapProvider'
import { getInitialViewStateForMarkers } from '../utils'

interface GenericMapProps extends Omit<BaseMapProps, 'handlers'> {
  /** Photo markers to display */
  markers?: PhotoMarker[]
  /** ID of the marker to select */
  selectedMarkerId?: string | null
  /** Callback when marker is clicked */
  onMarkerClick?: (marker: PhotoMarker) => void
  /** Callback when GeoJSON feature is clicked */
  onGeoJsonClick?: (feature: GeoJSON.Feature) => void
  /** Callback for geolocation */
  onGeolocate?: (longitude: number, latitude: number) => void
}

// Default empty array to avoid inline array creation
const DEFAULT_MARKERS: PhotoMarker[] = []

/**
 * Generic map component that abstracts away the specific map provider
 * This component automatically selects the best available provider from context
 */
export const GenericMap: FC<GenericMapProps> = ({
  markers = DEFAULT_MARKERS,
  selectedMarkerId,
  onMarkerClick,
  onGeoJsonClick,
  onGeolocate,
  initialViewState,
  autoFitBounds = true,
  ...props
}) => {
  const adapter = useMapAdapter()
  // Calculate initial view state from markers (only if autoFitBounds is disabled)
  const calculatedInitialViewState = useMemo(() => {
    if (autoFitBounds) {
      // 如果开启自动适配，则使用传入的initialViewState或默认值
      return initialViewState || { longitude: 0, latitude: 0, zoom: 2 }
    }
    return initialViewState || getInitialViewStateForMarkers(markers)
  }, [initialViewState, markers, autoFitBounds])

  // Prepare handlers for the specific map adapter
  const handlers = useMemo(
    () => ({
      onMarkerClick,
      onGeoJsonClick,
      onGeolocate,
    }),
    [onMarkerClick, onGeoJsonClick, onGeolocate],
  )

  if (!adapter) {
    return <div>Map provider not available</div>
  }

  const { MapComponent } = adapter

  return (
    <MapComponent
      {...props}
      markers={markers}
      selectedMarkerId={selectedMarkerId}
      initialViewState={calculatedInitialViewState}
      autoFitBounds={autoFitBounds}
      handlers={handlers}
    />
  )
}
