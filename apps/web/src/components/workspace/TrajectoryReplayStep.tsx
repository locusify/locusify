import type { FC } from 'react'
import { APILoader } from '@uiw/react-amap-api-loader'
import { Map } from '@uiw/react-amap-map'
import { Marker } from '@uiw/react-amap-marker'
import { Polyline } from '@uiw/react-amap-polyline'
import { AlertCircle, Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import logoUrl from '@/assets/locusify.png'
import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { StepNavigation } from './StepNavigation'

/** Speed options - duration multiplier for moveAlong API */
const SPEED_OPTIONS = [
  { labelKey: 'workspace.replay.speed.slow', value: 2.0 },
  { labelKey: 'workspace.replay.speed.normal', value: 1.0 },
  { labelKey: 'workspace.replay.speed.fast', value: 0.5 },
  { labelKey: 'workspace.replay.speed.veryFast', value: 0.25 },
]

export const TrajectoryReplayStep: FC = () => {
  const { t } = useTranslation()
  const { gpsData, goToPreviousStep } = useWorkspaceStore()

  const [speedMultiplier, setSpeedMultiplier] = useState(1.0) // Duration multiplier (1.0 = normal)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const markerRef = useRef<AMap.Marker | null>(null)
  const mapRef = useRef<AMap.Map | null>(null)

  // Generate trajectory from GPS data
  const trajectoryData = useMemo(() => {
    const validGpsData = gpsData
      .filter(d => d.hasValidGps && d.gps)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    const trajectory: [number, number][] = validGpsData.map(d => [
      d.gps!.longitude,
      d.gps!.latitude,
    ])

    const waypoints = validGpsData.map(d => ({
      position: [d.gps!.longitude, d.gps!.latitude] as [number, number],
      photoUrl: d.photo.previewUrl,
      timestamp: d.timestamp,
      locationName: d.locationName,
    }))

    return { trajectory, waypoints, validGpsData }
  }, [gpsData])

  const { trajectory, waypoints, validGpsData } = trajectoryData

  // Calculate map center and zoom
  const mapConfig = useMemo(() => {
    // Calculate zoom level based on bounding box
    const lats = trajectory.map(([_, lat]) => lat)
    const lngs = trajectory.map(([lng]) => lng)

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)

    // More granular zoom levels for better view
    let zoom = 18 // Default for very close points
    if (maxDiff > 0.001)
      zoom = 17
    if (maxDiff > 0.005)
      zoom = 16
    if (maxDiff > 0.01)
      zoom = 15
    if (maxDiff > 0.05)
      zoom = 14
    if (maxDiff > 0.1)
      zoom = 13
    if (maxDiff > 0.5)
      zoom = 11
    if (maxDiff > 1)
      zoom = 9
    if (maxDiff > 5)
      zoom = 7

    return {
      center: trajectory[0] as [number, number],
      zoom,
    }
  }, [trajectory])

  /** Get current photo URL */
  const currentPhotoUrl = useMemo(() => {
    return waypoints[currentPhotoIndex]?.photoUrl || logoUrl
  }, [waypoints, currentPhotoIndex])

  /** Start animation using moveAlong API */
  const startAnimation = useCallback(() => {
    const marker = markerRef.current
    if (!marker)
      return

    if (!isPlaying) {
      // Start from beginning
      setCurrentPhotoIndex(0)
      marker.setPosition(trajectory[0])
      setIsPlaying(true)

      // Use moveAlong for smooth animation
      const durationPerPhoto = 2000 // 2 seconds per photo
      const totalDuration = trajectory.length * durationPerPhoto * speedMultiplier

      marker.moveAlong(trajectory, {
        duration: totalDuration,
        autoRotation: false,
      })
    }
    else {
      // Resume from paused position
      marker.resumeMove()
    }
  }, [isPlaying, trajectory, speedMultiplier])

  /** Pause animation */
  const pauseAnimation = useCallback(() => {
    const marker = markerRef.current
    if (!marker)
      return

    marker.pauseMove()
    setIsPlaying(false)
  }, [])

  /** Reset animation */
  const resetAnimation = useCallback(() => {
    const marker = markerRef.current
    if (!marker || trajectory.length === 0)
      return

    marker.stopMove()
    setIsPlaying(false)
    marker.setPosition(trajectory[0])
    setCurrentPhotoIndex(0)
  }, [trajectory])

  /** Update speed when speedMultiplier changes during playback */
  useEffect(() => {
    if (isPlaying) {
      // Stop current animation and restart with new speed
      const marker = markerRef.current
      if (marker) {
        marker.stopMove()
        startAnimation()
      }
    }
  }, [isPlaying, speedMultiplier, startAnimation])

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      const marker = markerRef.current
      if (marker) {
        marker.stopMove()
      }
    }
  }, [])

  // No GPS data case
  if (trajectory.length < 2) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('workspace.replay.title', {
              defaultValue: 'Trajectory Replay',
            })}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('workspace.replay.description', {
              defaultValue: 'View and replay your journey on the map.',
            })}
          </p>
        </div>

        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <AlertCircle className="size-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-yellow-900 mb-1">
            {t('workspace.replay.noData', {
              defaultValue: 'No trajectory data available',
            })}
          </p>
          <p className="text-sm text-yellow-700">
            {t('workspace.replay.noDataMessage', {
              defaultValue:
                'At least 2 photos with valid GPS coordinates are required. Please go back and upload more photos.',
            })}
          </p>
        </div>

        <StepNavigation onBack={goToPreviousStep} showNext={false} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Map Container */}
      <div
        className="flex-1 relative rounded-lg overflow-hidden border border-gray-200 shadow-sm"
        style={{ minHeight: '400px' }}
      >
        <APILoader
          akey={env.AMAP_KEY}
          version="2.0"
          plugins={['AMap.MoveAnimation']}
        >
          <Map
            ref={(instance) => {
              // 从 react-amap 包装的实例中获取原生 AMap.Map
              if (instance?.map) {
                mapRef.current = instance.map
              }
            }}
            center={mapConfig.center}
            zoom={mapConfig.zoom}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {/* Polyline showing the full trajectory */}
            <Polyline
              path={trajectory}
              strokeColor="#1677ff"
              strokeWeight={4}
              strokeOpacity={0.6}
            />

            {/* Moving marker with photo - position is managed by moveAlong API */}
            {currentPhotoUrl && (
              <Marker
                key="current-position-marker"
                ref={(instance) => {
                  // 从 react-amap 包装的实例中获取原生 AMap.Marker
                  if (instance?.marker) {
                    markerRef.current = instance.marker
                  }
                }}
                position={trajectory[currentPhotoIndex]}
                anchor="center"
              >
                <div className="size-24 md:size-32 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-2 border-4 border-primary ring-4 ring-primary/20">
                  <img
                    src={currentPhotoUrl}
                    className="size-full object-cover rounded-xl"
                    alt="Current position"
                  />
                </div>
              </Marker>
            )}

            {/* End marker */}
            <Marker
              position={trajectory.at(-1)}
              anchor="center"
              icon="https://webapi.amap.com/theme/v1.3/markers/n/end.png"
            />
          </Map>
        </APILoader>

        {/* Progress indicator */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-2 py-2 md:px-4 md:py-3 text-sm max-w-[160px] md:max-w-xs">
          <div className="font-semibold text-gray-900 text-xs md:text-base">
            {t('workspace.replay.progress', {
              defaultValue: 'Progress: {{current}} / {{total}}',
              current: currentPhotoIndex + 1,
              total: trajectory.length,
            })}
          </div>
          <div className="mt-1.5 md:mt-2 bg-gray-200 rounded-full h-1.5 md:h-2 w-28 md:w-40">
            <div
              className="bg-primary h-1.5 md:h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (currentPhotoIndex / (trajectory.length - 1)) * 100
                }%`,
              }}
            />
          </div>
          {validGpsData[currentPhotoIndex]?.locationName && (
            <p className="text-[10px] md:text-xs text-gray-600 mt-1 md:mt-2 truncate">
              📍
              {validGpsData[currentPhotoIndex].locationName}
            </p>
          )}
        </div>

        {/* Photo count indicator */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-2 py-2 md:px-4 md:py-3">
          <div className="text-gray-700 font-medium text-xs md:text-sm">
            📸
            {t('workspace.replay.photoCount', {
              defaultValue: '{{count}} Photos',
              count: validGpsData.length,
            })}
          </div>
        </div>
      </div>

      {/* Control Panel and Navigation - Fixed at bottom */}
      <div className="mt-3 space-y-3">
        {/* Control Panel */}
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {/* Playback controls */}
            {isPlaying
              ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={pauseAnimation}
                    className="size-10"
                    title={t('workspace.controls.pause', { defaultValue: 'Pause' })}
                  >
                    <Pause className="size-5" />
                  </Button>
                )
              : (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={startAnimation}
                    className="size-10"
                    title={t('workspace.controls.play', { defaultValue: 'Play' })}
                  >
                    <Play className="size-5" />
                  </Button>
                )}

            <Button
              variant="outline"
              size="icon"
              onClick={resetAnimation}
              className="size-10"
              title={t('workspace.controls.reset', { defaultValue: 'Reset' })}
            >
              <RotateCcw className="size-5" />
            </Button>

            {/* Speed selector */}
            <div className="flex items-center gap-2 ml-2">
              <label
                htmlFor="speed-select"
                className="text-sm text-gray-600 whitespace-nowrap"
              >
                {t('workspace.controls.speed', { defaultValue: 'Speed' })}
              </label>
              <select
                id="speed-select"
                value={speedMultiplier}
                onChange={e => setSpeedMultiplier(Number(e.target.value))}
                className="h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {SPEED_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey, { defaultValue: option.labelKey })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <StepNavigation
          onBack={goToPreviousStep}
          showNext={false}
          backLabel={t('workspace.controls.backToGps', {
            defaultValue: 'Back to GPS Data',
          })}
        />
      </div>
    </div>
  )
}
