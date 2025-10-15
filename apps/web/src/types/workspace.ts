/**
 * Core type definitions for workspace photo upload and trajectory replay
 */

/** Uploaded photo with metadata */
export interface UploadedPhoto {
  id: string // UUID
  file: File // Original file object
  previewUrl: string // Object URL for preview
  uploadedUrl?: string // Supabase Storage URL
  size: number // File size in bytes
  mimeType: string // image/jpeg, image/heic, etc.
  uploadProgress: number // 0-100
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed'
  uploadError?: string
  createdAt: Date
}

/** GPS coordinates with metadata */
export interface GpsCoordinates {
  latitude: number // Decimal degrees
  longitude: number // Decimal degrees
  altitude?: number // Meters above sea level
  accuracy?: number // GPS accuracy in meters
}

/** Photo with extracted GPS data */
export interface PhotoGpsData {
  photoId: string
  photo: UploadedPhoto
  gps: GpsCoordinates | null
  timestamp: Date // EXIF DateTimeOriginal
  locationName?: string // Reverse geocoded location
  hasValidGps: boolean
  extractionError?: string
}

/** GPS extraction error */
export interface PhotoGpsError {
  photoId: string
  photoName: string
  errorType: 'no_exif' | 'no_gps' | 'invalid_format' | 'extraction_failed'
  errorMessage: string
}

/** Trajectory waypoint */
export interface TrajectoryWaypoint {
  id: string
  position: [number, number] // [lng, lat]
  photoId: string
  photo: UploadedPhoto
  timestamp: Date
  locationName?: string
  index: number // Order in trajectory
}

/** Playback state */
export interface PlaybackState {
  status: 'idle' | 'playing' | 'paused' | 'completed'
  currentWaypointIndex: number
  segmentProgress: number // 0-1 within current segment
  totalProgress: number // 0-1 for entire trajectory
  speedMultiplier: number
}

/** Workspace step type */
export type WorkspaceStep = 1 | 2 | 3

/** Upload validation result */
export interface UploadValidation {
  isValid: boolean
  errors: string[]
}
