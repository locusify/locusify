import type { MapBounds, PhotoManifestItem, PhotoMarker } from '@/types/map'
import { m } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useSearchParams } from 'react-router'
import { GenericMap } from './components/GenericMap'
import { MapBackButton } from './components/MapBackButton'
import { MapInfoPanel } from './components/MapInfoPanel'
import { MapLoadingState } from './components/MapLoadingState'
import { MapProvider } from './MapProvider'
import {
  calculateMapBounds,
  convertExifGPSToDecimal,
  convertPhotosToMarkersFromEXIF,
  getInitialViewStateForMarkers,
} from './utils'

function MapSectionContent() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Photo markers state and loading logic
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [markers, setMarkers] = useState<PhotoMarker[]>([])

  // Track if this is the initial load to control auto fit bounds
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Handle marker click - update URL parameters
  const handleMarkerClick = useCallback(
    (marker: PhotoMarker) => {
      const newSearchParams = new URLSearchParams(searchParams)

      // Check if this marker is already selected
      const currentPhotoId = searchParams.get('photoId')

      if (currentPhotoId === marker.id) {
        // If already selected, deselect by removing the photoId parameter
        newSearchParams.delete('photoId')
      }
      else {
        // Select the new marker
        newSearchParams.set('photoId', marker.id)
      }

      setSearchParams(newSearchParams, { replace: true })

      // Mark that this is no longer the initial load
      setIsInitialLoad(false)
    },
    [searchParams, setSearchParams],
  )
  const bounds = useMemo<MapBounds | null>(() => {
    if (markers.length === 0)
      return null
    return calculateMapBounds(markers)
  }, [markers])

  // Load photo markers effect
  useEffect(() => {
    const loadPhotoMarkersData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const photos: PhotoManifestItem[] = []
        const photoMarkers = convertPhotosToMarkersFromEXIF(photos)

        setMarkers(photoMarkers)
        console.info(`Found ${photoMarkers.length} photos with GPS coordinates`)
      }
      catch (err) {
        const error
          = err instanceof Error ? err : new Error('Failed to load photo markers')
        setError(error)
        console.error('Failed to load photo markers:', error)
      }
      finally {
        setIsLoading(false)
      }
    }

    loadPhotoMarkersData()
  }, [setMarkers])

  // Parse URL parameters - only use photoId
  const { latitude, longitude, zoom, photoId } = useMemo(() => {
    const photoIdParam = searchParams.get('photoId')

    if (photoIdParam) {
      const photo: PhotoManifestItem = {
        id: photoIdParam,
        originalUrl: '',
        thumbnailUrl: '',
        thumbHash: null,
        width: 0,
        height: 0,
        aspectRatio: 0,
        s3Key: '',
        lastModified: '',
        size: 0,
        exif: null,
        toneAnalysis: null,
        isLivePhoto: false,
        isHDR: false,
        livePhotoVideoUrl: '',
        livePhotoVideoS3Key: '',
        title: '',
        dateTaken: '',
        tags: [],
        description: '',
      }
      const gpsData = convertExifGPSToDecimal(photo?.exif ?? null)

      if (gpsData) {
        return {
          latitude: gpsData.latitude,
          longitude: gpsData.longitude,
          zoom: 15, // Default zoom when coordinates derived from photo
          photoId: photoIdParam,
        }
      }
    }

    return {
      latitude: null,
      longitude: null,
      zoom: null,
      photoId: photoIdParam,
    }
  }, [searchParams])

  // Initial view state calculation - handle URL parameters
  const initialViewState = useMemo(() => {
    if (latitude !== null && longitude !== null) {
      // Use URL parameters if provided
      return {
        latitude,
        longitude,
        zoom: zoom ?? 15,
      }
    }

    // Fall back to markers-based view state
    return getInitialViewStateForMarkers(markers)
  }, [markers, latitude, longitude, zoom])

  // Show loading state
  if (isLoading) {
    return <MapLoadingState />
  }

  // Show error state
  if (error) {
    return (
      <div className="flex size-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">❌</div>
          <div className="text-lg font-medium text-red-900 dark:text-red-100">
            {t('explory.map.error.title')}
          </div>
          <p className="text-sm text-red-600 dark:text-red-400">
            {t('explory.map.error.description')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute size-full">
      {/* Back button */}
      <MapBackButton />

      {/* Map info panel */}
      <MapInfoPanel markersCount={markers.length} bounds={bounds} />

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
          autoFitBounds={
            isInitialLoad && latitude === null && longitude === null
          }
          selectedMarkerId={photoId}
          onMarkerClick={handleMarkerClick}
          className="h-full w-full"
        />
      </m.div>
    </div>
  )
}

export function MapSection() {
  return (
    <MapProvider>
      <MapSectionContent />
    </MapProvider>
  )
}
