import type { GPSCoordinates, PickedExif } from './map'

export interface Photo {
  id: string
  file: File
  preview: string
  name: string
  size: number
  type: string
  lastModified: number

  // GPS coordinates in standard format
  gpsInfo?: GPSCoordinates

  // Raw EXIF data from exifr
  exif?: PickedExif

  // Convenience fields extracted from EXIF
  dateTaken?: string
  camera?: {
    make?: string
    model?: string
  }
}

export interface PhotoProgress {
  id: string
  name: string
  progress: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}
