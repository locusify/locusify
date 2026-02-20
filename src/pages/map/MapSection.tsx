import type { PhotoMarker } from '@/types/map'
import { m } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { SelectPhotosDrawer } from '@/components/upload'
import { PhotoProvider, usePhotos } from '@/contexts'
import { useReplayStore } from '@/stores/replayStore'
import { GenericMap } from './components/GenericMap'
import { MapMenuButton } from './components/MapMenuButton'
import { TrajectoryOverlay } from './components/TrajectoryOverlay'
import { MapProvider } from './MapProvider'
import { getInitialViewStateForMarkers } from './utils'

function MapSectionContent() {
  const { markers, selectedMarkerId, setSelectedMarkerId } = usePhotos()

  const isReplayMode = useReplayStore(s => s.isReplayMode)
  const startReplay = useReplayStore(s => s.startReplay)
  const exitReplay = useReplayStore(s => s.exitReplay)

  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false)

  const handleMarkerClick = useCallback((marker: PhotoMarker) => {
    setSelectedMarkerId(selectedMarkerId === marker.id ? null : marker.id)
  }, [selectedMarkerId, setSelectedMarkerId])

  const initialViewState = useMemo(() => {
    return getInitialViewStateForMarkers(markers)
  }, [markers])

  const handleRoutesClick = useCallback(() => {
    startReplay(markers)
  }, [startReplay, markers])

  // Need at least 2 photos with GPS to replay
  const hasEnoughPhotos = markers.length >= 2

  // Hide photo markers during replay
  const displayMarkers = isReplayMode ? [] : markers

  return (
    <div className="absolute size-full">
      <MapMenuButton
        onUploadClick={() => setUploadDrawerOpen(true)}
        onRoutesClick={handleRoutesClick}
        routesDisabled={!hasEnoughPhotos}
        isReplayMode={isReplayMode}
        onExitReplay={exitReplay}
      />

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
