import type { MapBounds, PhotoMarker } from '@/types/map'
import { m } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { SelectPhotosDrawer } from '@/components/upload'
import { PhotoProvider, usePhotos } from '@/contexts'
import { useReplayStore } from '@/stores/replayStore'
import { GenericMap } from './components/GenericMap'
import { MapBackButton } from './components/MapBackButton'
import { MapInfoPanel } from './components/MapInfoPanel'
import { MapMenuButton } from './components/MapMenuButton'
import { TrajectoryOverlay } from './components/TrajectoryOverlay'
import { MapProvider } from './MapProvider'
import { calculateMapBounds, getInitialViewStateForMarkers } from './utils'

function MapSectionContent() {
  const { photos, markers, selectedMarkerId, setSelectedMarkerId } = usePhotos()

  const isReplayMode = useReplayStore(s => s.isReplayMode)
  const startReplay = useReplayStore(s => s.startReplay)

  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false)

  const handleMarkerClick = useCallback((marker: PhotoMarker) => {
    setSelectedMarkerId(selectedMarkerId === marker.id ? null : marker.id)
  }, [selectedMarkerId, setSelectedMarkerId])

  const bounds = useMemo<MapBounds | null>(() => {
    if (markers.length === 0)
      return null
    return calculateMapBounds(markers)
  }, [markers])

  const initialViewState = useMemo(() => {
    return getInitialViewStateForMarkers(markers)
  }, [markers])

  const handleRoutesClick = useCallback(() => {
    startReplay(photos)
  }, [startReplay, photos])

  // Hide photo markers during replay
  const displayMarkers = isReplayMode ? [] : markers

  return (
    <div className="absolute size-full">
      <MapBackButton />

      {!isReplayMode && (
        <MapInfoPanel markersCount={markers.length} bounds={bounds} />
      )}

      {!isReplayMode && (
        <MapMenuButton
          onUploadClick={() => setUploadDrawerOpen(true)}
          onRoutesClick={handleRoutesClick}
        />
      )}

      <SelectPhotosDrawer
        open={uploadDrawerOpen}
        onOpenChange={setUploadDrawerOpen}
      />

      {isReplayMode && <TrajectoryOverlay />}

      <m.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="size-full"
      >
        <GenericMap
          markers={displayMarkers}
          initialViewState={initialViewState}
          autoFitBounds={displayMarkers.length > 0}
          selectedMarkerId={isReplayMode ? null : selectedMarkerId}
          onMarkerClick={handleMarkerClick}
          className="size-full"
        />
      </m.div>
    </div>
  )
}

export function MapSection() {
  return (
    <PhotoProvider>
      <MapProvider>
        <MapSectionContent />
      </MapProvider>
    </PhotoProvider>
  )
}
