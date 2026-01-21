import type { ReactNode } from 'react'
import type { PhotoManifestItem, PhotoMarker } from '@/types/map'
import type { Photo } from '@/types/photo'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

interface PhotoContextValue {
  // Photos state
  photos: Photo[]
  markers: PhotoMarker[]

  // Actions
  addPhotos: (files: Photo[]) => void
  removePhoto: (fileId: string) => void
  clearPhotos: () => void

  // Selected marker
  selectedMarkerId: string | null
  setSelectedMarkerId: (id: string | null) => void
}

const PhotoContext = createContext<PhotoContextValue | null>(null)

// Convert local Photo to PhotoManifestItem for marker display
function photoToManifestItem(photo: Photo): PhotoManifestItem {
  const cameraInfo = photo.camera
    ? [photo.camera.make, photo.camera.model].filter(Boolean).join(' ')
    : undefined

  return {
    id: photo.id,
    title: photo.name,
    dateTaken: photo.dateTaken || new Date().toISOString(),
    tags: [],
    description: cameraInfo || '',
    originalUrl: photo.preview,
    thumbnailUrl: photo.preview,
    thumbHash: null,
    width: 0,
    height: 0,
    aspectRatio: 1,
    s3Key: '',
    lastModified: new Date(photo.lastModified).toISOString(),
    size: photo.size,
    exif: photo.exif || null,
    toneAnalysis: null,
  }
}

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)

  // Add photos (merge with existing, avoid duplicates by id)
  const addPhotos = useCallback((files: Photo[]) => {
    setPhotos((prev) => {
      const existingIds = new Set(prev.map(p => p.id))
      const newFiles = files.filter(f => !existingIds.has(f.id))
      return [...prev, ...newFiles]
    })
  }, [])

  // Remove a photo by id
  const removePhoto = useCallback((fileId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== fileId))
    // Clear selection if removed photo was selected
    setSelectedMarkerId(prev => prev === fileId ? null : prev)
  }, [])

  // Clear all photos
  const clearPhotos = useCallback(() => {
    setPhotos([])
    setSelectedMarkerId(null)
  }, [])

  // Convert photos with GPS to markers
  const markers = useMemo<PhotoMarker[]>(() => {
    return photos
      .filter(photo => photo.gpsInfo)
      .map((photo) => {
        const gps = photo.gpsInfo!
        return {
          id: photo.id,
          latitude: gps.latitude,
          longitude: gps.longitude,
          altitude: gps.altitude,
          latitudeRef: gps.latitudeRef,
          longitudeRef: gps.longitudeRef,
          altitudeRef: gps.altitudeRef,
          photo: photoToManifestItem(photo),
        }
      })
  }, [photos])

  const value = useMemo<PhotoContextValue>(
    () => ({
      photos,
      markers,
      addPhotos,
      removePhoto,
      clearPhotos,
      selectedMarkerId,
      setSelectedMarkerId,
    }),
    [photos, markers, addPhotos, removePhoto, clearPhotos, selectedMarkerId],
  )

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  )
}

export function usePhotos() {
  const context = useContext(PhotoContext)
  if (!context) {
    throw new Error('usePhotos must be used within a PhotoProvider')
  }
  return context
}
