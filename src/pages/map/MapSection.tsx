import type { PhotoMarker } from '@/types/map'
import pkg from '@pkg'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import locusifyLogo from '@/assets/locusify-fit.png'
import { LoginButton, LoginDrawer } from '@/components/auth'
import { SelectPhotosDrawer } from '@/components/upload'
import { PhotoProvider, usePhotos } from '@/contexts'
import { useVideoRecorder } from '@/hooks/useVideoRecorder'
import { SettingsDrawer } from '@/pages/settings'
import { useReplayStore } from '@/stores/replayStore'
import { AnnouncementDialog } from './components/AnnouncementDialog'
import { GalleryDrawer } from './components/GalleryDrawer'
import { GenericMap } from './components/GenericMap'
import { MapMenuButton } from './components/MapMenuButton'
import { SaveVideoDialog } from './components/SaveVideoDialog'
import { TrajectoryOverlay } from './components/TrajectoryOverlay'
import { MapProvider } from './MapProvider'
import { getInitialViewStateForMarkers } from './utils'

const ANNOUNCEMENT_VERSION = pkg.version
const ANNOUNCEMENT_STORAGE_KEY = 'locusify:version'

function MapSectionContent() {
  const { markers, selectedMarkerId, setSelectedMarkerId } = usePhotos()

  const isReplayMode = useReplayStore(s => s.isReplayMode)
  const replayStatus = useReplayStore(s => s.status)
  const prepareReplay = useReplayStore(s => s.prepareReplay)
  const confirmConfig = useReplayStore(s => s.confirmConfig)
  const exitReplay = useReplayStore(s => s.exitReplay)
  const recordingActive = useReplayStore(s => s.recordingActive)

  const {
    startRecording,
    pendingVideo,
    saveVideo,
    discardVideo,
    isRecording,
    isProcessing,
  } = useVideoRecorder()

  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false)
  const [announcementOpen, setAnnouncementOpen] = useState(
    () => localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) !== ANNOUNCEMENT_VERSION,
  )

  // Show dialog 2 seconds after replay completes (regardless of whether video is ready)
  useEffect(() => {
    if (replayStatus !== 'completed')
      return
    const t = setTimeout(() => setVideoDialogOpen(true), 2000)
    return () => clearTimeout(t)
  }, [replayStatus])

  const handleMarkerClick = useCallback((marker: PhotoMarker) => {
    setSelectedMarkerId(selectedMarkerId === marker.id ? null : marker.id)
  }, [selectedMarkerId, setSelectedMarkerId])

  const initialViewState = useMemo(() => {
    return getInitialViewStateForMarkers(markers)
  }, [markers])

  const handleRoutesClick = useCallback(() => {
    prepareReplay(markers)
  }, [prepareReplay, markers])

  const handleStartReplay = useCallback(async (): Promise<boolean> => {
    confirmConfig()
    const started = await startRecording()
    return started
  }, [confirmConfig, startRecording])

  const handleExitReplay = useCallback(() => {
    exitReplay()
    discardVideo()
    setVideoDialogOpen(false)
  }, [exitReplay, discardVideo])

  const handleSaveVideo = useCallback(() => {
    saveVideo()
    setVideoDialogOpen(false)
  }, [saveVideo])

  const handleDiscardVideo = useCallback(() => {
    discardVideo()
    setVideoDialogOpen(false)
  }, [discardVideo])

  const handleDismissAnnouncement = useCallback(() => {
    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, ANNOUNCEMENT_VERSION)
    setAnnouncementOpen(false)
  }, [])

  const hasEnoughPhotos = markers.length >= 2
  const displayMarkers = isReplayMode ? [] : markers

  return (
    <div className="absolute size-full">
      {/* Hide menu button during active recording (intro + playback) */}
      {!recordingActive && (
        <MapMenuButton
          onUploadClick={() => setUploadDrawerOpen(true)}
          onRoutesClick={handleRoutesClick}
          onSettingsClick={() => setSettingsOpen(true)}
          onGalleryClick={() => setGalleryOpen(true)}
          routesDisabled={!hasEnoughPhotos}
          isReplayMode={isReplayMode}
          onExitReplay={handleExitReplay}
          isRecording={isRecording}
          isProcessing={isProcessing}
        />
      )}

      <SelectPhotosDrawer
        open={uploadDrawerOpen}
        onOpenChange={setUploadDrawerOpen}
      />

      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
      <GalleryDrawer open={galleryOpen} onOpenChange={setGalleryOpen} />
      <LoginDrawer open={loginDrawerOpen} onOpenChange={setLoginDrawerOpen} />

      {!isReplayMode && (
        <LoginButton onClick={() => setLoginDrawerOpen(true)} />
      )}

      {isReplayMode && <TrajectoryOverlay onStartReplay={handleStartReplay} />}

      {/* DOM watermark — visible during recording, captured by screen capture */}
      {isRecording && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
          <img src={locusifyLogo} alt="" className="size-5 rounded" />
          <span className="text-xs text-white">Powered by Locusify</span>
        </div>
      )}

      {/* Announcement dialog — shown once per version */}
      <AnimatePresence>
        {announcementOpen && (
          <AnnouncementDialog
            open={announcementOpen}
            onClose={handleDismissAnnouncement}
          />
        )}
      </AnimatePresence>

      {/* Save / Discard dialog — shown 2 s after replay completes */}
      <AnimatePresence>
        {videoDialogOpen && (
          <SaveVideoDialog
            pendingVideo={pendingVideo}
            isProcessing={isProcessing}
            onSave={handleSaveVideo}
            onDiscard={handleDiscardVideo}
          />
        )}
      </AnimatePresence>

      <m.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="size-full isolate"
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
