import type { MapBounds, PhotoMarker } from '@/types/map'
import { m } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { SelectPhotosDrawer } from '@/components/upload'
import { PhotoProvider, usePhotos } from '@/contexts'
import { GenericMap } from './components/GenericMap'
import { MapBackButton } from './components/MapBackButton'
import { MapInfoPanel } from './components/MapInfoPanel'
import { MapMenuButton } from './components/MapMenuButton'
import { MapProvider } from './MapProvider'
import { calculateMapBounds, getInitialViewStateForMarkers } from './utils'

function MapSectionContent() {
  // Photo context - markers from selected photos
  const { markers, selectedMarkerId, setSelectedMarkerId } = usePhotos()

  // Upload drawer state
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false)

  // Handle marker click - toggle selection
  const handleMarkerClick = useCallback((marker: PhotoMarker) => {
    setSelectedMarkerId(selectedMarkerId === marker.id ? null : marker.id)
  }, [selectedMarkerId, setSelectedMarkerId])

  // Calculate bounds from markers
  const bounds = useMemo<MapBounds | null>(() => {
    if (markers.length === 0)
      return null
    return calculateMapBounds(markers)
  }, [markers])

  // Initial view state from markers
  const initialViewState = useMemo(() => {
    return getInitialViewStateForMarkers(markers)
  }, [markers])

  return (
    <div className="absolute size-full">
      {/* Back button */}
      <MapBackButton />

      {/* Map info panel */}
      <MapInfoPanel markersCount={markers.length} bounds={bounds} />

      {/* Map menu button */}
      <MapMenuButton onUploadClick={() => setUploadDrawerOpen(true)} />

      {/* Upload drawer */}
      <SelectPhotosDrawer
        open={uploadDrawerOpen}
        onOpenChange={setUploadDrawerOpen}
      />

      {/* Generic Map component */}
      <m.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="size-full"
      >
        <GenericMap
          markers={markers}
          initialViewState={initialViewState}
          autoFitBounds={markers.length > 0}
          selectedMarkerId={selectedMarkerId}
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
