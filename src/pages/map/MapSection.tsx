import type { PhotoMarker } from '@/types/map'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SelectPhotosDrawer } from '@/components/upload'
import { PhotoProvider, usePhotos } from '@/contexts'
import { useVideoRecorder } from '@/hooks/useVideoRecorder'
import { useReplayStore } from '@/stores/replayStore'
import { GenericMap } from './components/GenericMap'
import { MapMenuButton } from './components/MapMenuButton'
import { SaveVideoDialog } from './components/SaveVideoDialog'
import { TrajectoryOverlay } from './components/TrajectoryOverlay'
import { MapProvider } from './MapProvider'
import { getInitialViewStateForMarkers } from './utils'

function MapSectionContent() {
  const { markers, selectedMarkerId, setSelectedMarkerId } = usePhotos()

  const isReplayMode = useReplayStore(s => s.isReplayMode)
  const startReplay = useReplayStore(s => s.startReplay)
  const exitReplay = useReplayStore(s => s.exitReplay)

  const {
    startAutoRecord,
    pendingVideo,
    saveVideo,
    discardVideo,
    isRecording,
    isProcessing,
  } = useVideoRecorder()

  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)

  // Auto-show dialog 2 seconds after video becomes ready
  useEffect(() => {
    if (!pendingVideo) {
      setVideoDialogOpen(false)
      return
    }
    const t = setTimeout(() => setVideoDialogOpen(true), 2000)
    return () => clearTimeout(t)
  }, [pendingVideo])

  const handleMarkerClick = useCallback((marker: PhotoMarker) => {
    setSelectedMarkerId(selectedMarkerId === marker.id ? null : marker.id)
  }, [selectedMarkerId, setSelectedMarkerId])

  const initialViewState = useMemo(() => {
    return getInitialViewStateForMarkers(markers)
  }, [markers])

  const handleRoutesClick = useCallback(() => {
    // Always start paused — ReplayIntroOverlay handles the transition to playing
    startReplay(markers, true)
    // Start recording immediately (draws logo intro on canvas for the same duration)
    startAutoRecord()
  }, [startReplay, markers, startAutoRecord])

  const handleExitReplay = useCallback(() => {
    exitReplay()
    discardVideo()
    setVideoDialogOpen(false)
  }, [exitReplay, discardVideo])

  const handleSaveVideo = useCallback(() => {
    saveVideo()
  }, [saveVideo])

  const handleDiscardVideo = useCallback(() => {
    discardVideo()
  }, [discardVideo])

  const hasEnoughPhotos = markers.length >= 2
  const displayMarkers = isReplayMode ? [] : markers

  return (
    <div className="absolute size-full">
      <MapMenuButton
        onUploadClick={() => setUploadDrawerOpen(true)}
        onRoutesClick={handleRoutesClick}
        routesDisabled={!hasEnoughPhotos}
        isReplayMode={isReplayMode}
        onExitReplay={handleExitReplay}
        isRecording={isRecording}
        isProcessing={isProcessing}
      />

      <SelectPhotosDrawer
        open={uploadDrawerOpen}
        onOpenChange={setUploadDrawerOpen}
      />

      {isReplayMode && <TrajectoryOverlay />}

      {/* Save / Discard dialog — auto-shown 2 s after recording finishes */}
      <AnimatePresence>
        {videoDialogOpen && pendingVideo && (
          <SaveVideoDialog
            pendingVideo={pendingVideo}
            onSave={handleSaveVideo}
            onDiscard={handleDiscardVideo}
          />
        )}
      </AnimatePresence>

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
