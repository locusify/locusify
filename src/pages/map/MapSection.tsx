import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre'
import type { PhotoMarker } from '@/types/map'
import type { Photo } from '@/types/photo'
import pkg from '@pkg'
import { AnimatePresence, m } from 'motion/react'
import { lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import locusifyLogo from '@/assets/locusify-fit.png'
import { LoginButton, LoginDrawer } from '@/components/auth'
import { SelectPhotosDrawer } from '@/components/upload'
import { useLongPress } from '@/hooks/useLongPress'
import { useVideoRecorder } from '@/hooks/useVideoRecorder'
import { extractExifData } from '@/lib/exif'
import { SettingsDrawer } from '@/pages/settings'
import { usePhotoStore } from '@/stores/photoStore'
import { useReplayStore } from '@/stores/replayStore'
import { GPSDirection } from '@/types/map'
import { AnnouncementDialog } from './components/AnnouncementDialog'
import { GalleryDrawer } from './components/GalleryDrawer'
import { MapContextMenu } from './components/MapContextMenu'
import { MapMenuButton } from './components/MapMenuButton'
import { SaveVideoDialog } from './components/SaveVideoDialog'
import { TrajectoryOverlay } from './components/TrajectoryOverlay'
import { getInitialViewStateForMarkers } from './utils'

const Maplibre = lazy(() =>
  import('./MapLibre').then(m => ({ default: m.Maplibre })),
)

const ANNOUNCEMENT_VERSION = pkg.version
const ANNOUNCEMENT_STORAGE_KEY = 'locusify:version'

function MapSectionContent() {
  const markers = usePhotoStore(s => s.markers)
  const selectedMarkerId = usePhotoStore(s => s.selectedMarkerId)
  const setSelectedMarkerId = usePhotoStore(s => s.setSelectedMarkerId)
  const mapRef = useRef<MapRef>(null)

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

  // Context menu state
  const pendingLngLat = useRef<{ lng: number, lat: number } | null>(null)
  const contextMenuFileInputRef = useRef<HTMLInputElement>(null)
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number, y: number } | null>(null)

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

  const handleMapContextMenu = useCallback((e: MapLayerMouseEvent) => {
    if (contextMenuPos)
      return // Already shown (e.g. from long-press)
    pendingLngLat.current = { lng: e.lngLat.lng, lat: e.lngLat.lat }
    setContextMenuPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
  }, [contextMenuPos])

  // Long-press on mobile → open the same context menu
  const longPressHandlers = useLongPress(
    useCallback(({ clientX, clientY }: { clientX: number, clientY: number }) => {
      const map = mapRef.current
      if (!map)
        return
      const rect = map.getContainer().getBoundingClientRect()
      const lngLat = map.unproject([clientX - rect.left, clientY - rect.top])
      pendingLngLat.current = { lng: lngLat.lng, lat: lngLat.lat }
      setContextMenuPos({ x: clientX, y: clientY })
    }, []),
  )

  const handleContextMenuAddPhotos = useCallback(() => {
    contextMenuFileInputRef.current?.click()
  }, [])

  const handleContextMenuClose = useCallback(() => {
    setContextMenuPos(null)
  }, [])

  const handleContextMenuFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0 || !pendingLngLat.current)
      return

    const { lng, lat } = pendingLngLat.current
    const photos: Photo[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (!file.type.startsWith('image/'))
        continue

      const preview = URL.createObjectURL(file)
      const exif = await extractExifData(file)

      let dateTaken: string | undefined
      let camera: { make?: string, model?: string } | undefined

      if (exif) {
        const dateTimeOriginal = exif.DateTimeOriginal
        const createDate = exif.CreateDate
        if (dateTimeOriginal) {
          dateTaken = dateTimeOriginal instanceof Date ? dateTimeOriginal.toISOString() : dateTimeOriginal
        }
        else if (createDate) {
          dateTaken = createDate instanceof Date ? createDate.toISOString() : createDate
        }
        if (exif.Make || exif.Model) {
          camera = { make: exif.Make, model: exif.Model }
        }
      }

      photos.push({
        id: `${file.name}-${file.lastModified}`,
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        gpsInfo: {
          latitude: lat,
          longitude: lng,
          latitudeRef: lat >= 0 ? GPSDirection.North : GPSDirection.South,
          longitudeRef: lng >= 0 ? GPSDirection.East : GPSDirection.West,
        },
        exif: exif ?? undefined,
        dateTaken,
        camera,
      })
    }

    if (photos.length > 0) {
      usePhotoStore.getState().addPhotos(photos)
    }

    e.target.value = ''
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

      {isReplayMode && (
        <TrajectoryOverlay
          onStartReplay={handleStartReplay}
          onUpgradeClick={() => setSettingsOpen(true)}
        />
      )}

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

      {!isReplayMode && (
        <MapContextMenu
          position={contextMenuPos}
          onAddPhotos={handleContextMenuAddPhotos}
          onClose={handleContextMenuClose}
        />
      )}

      <m.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="size-full isolate"
        {...(!isReplayMode ? longPressHandlers : {})}
      >
        <Maplibre
          markers={displayMarkers}
          initialViewState={initialViewState}
          autoFitBounds={displayMarkers.length > 0}
          selectedMarkerId={isReplayMode ? null : selectedMarkerId}
          onMarkerClick={handleMarkerClick}
          onContextMenu={isReplayMode ? undefined : handleMapContextMenu}
          className="size-full"
          mapRef={mapRef}
        />
      </m.div>

      <input
        ref={contextMenuFileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleContextMenuFileChange}
        className="hidden"
      />
    </div>
  )
}

export function MapSection() {
  return <MapSectionContent />
}
