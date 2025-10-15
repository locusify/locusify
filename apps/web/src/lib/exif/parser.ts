import type { GpsCoordinates, PhotoGpsData, PhotoGpsError, UploadedPhoto } from '@/types/workspace'
import exifr from 'exifr'

/**
 * Convert GPS coordinates from degrees/minutes/seconds to decimal
 * Handles both array format [degrees, minutes, seconds] and numeric values
 */
function convertGPSToDecimal(
  coordinate: number | number[] | undefined,
  ref: string | undefined,
): number | undefined {
  if (typeof coordinate === 'number') {
    // Already in decimal format
    return ref === 'S' || ref === 'W' ? -coordinate : coordinate
  }

  if (Array.isArray(coordinate) && coordinate.length === 3) {
    // Convert from [degrees, minutes, seconds] to decimal
    const [degrees, minutes, seconds] = coordinate
    let decimal = degrees + minutes / 60 + seconds / 3600

    // Apply direction reference
    if (ref === 'S' || ref === 'W') {
      decimal = -decimal
    }

    return decimal
  }

  return undefined
}

/**
 * Extract GPS data from a photo file using EXIF metadata
 */
export async function extractGpsFromPhoto(
  photo: UploadedPhoto,
): Promise<PhotoGpsData> {
  try {
    // Parse EXIF data with comprehensive GPS fields
    // For Live Photos and different photo formats
    const exif = await exifr.parse(photo.file, {
      // Enable all GPS-related tags
      gps: true,
      // Don't restrict fields - read everything for debugging
      // pick: undefined,
      translateKeys: true, // Translate to standard lowercase keys
      translateValues: true,
      reviveValues: true,
      // Merge output from multiple segments (important for HEIC/Live Photos)
      mergeOutput: true,
      // Enable additional parsers for different formats
      tiff: true,
      xmp: true,
      icc: false,
      iptc: false,
      jfif: false,
    })

    console.log(`[GPS Debug] Processing ${photo.file.name}:`, {
      fileType: photo.file.type,
      fileSize: photo.file.size,
      exifKeys: exif ? Object.keys(exif) : 'null',
      exifData: exif,
    })

    // Check if GPS data exists - try multiple field name variations
    let latitude: number | undefined
    let longitude: number | undefined
    let altitude: number | undefined

    if (exif) {
      // Try standard lowercase fields (exifr translated)
      latitude = exif.latitude
      longitude = exif.longitude
      altitude = exif.altitude

      // Fallback to uppercase GPS fields
      if (typeof latitude !== 'number' && exif.GPSLatitude) {
        latitude = convertGPSToDecimal(exif.GPSLatitude, exif.GPSLatitudeRef)
      }
      if (typeof longitude !== 'number' && exif.GPSLongitude) {
        longitude = convertGPSToDecimal(exif.GPSLongitude, exif.GPSLongitudeRef)
      }
      if (typeof altitude !== 'number' && exif.GPSAltitude) {
        altitude = Number(exif.GPSAltitude)
      }
    }

    console.log(`[GPS Debug] Extracted coordinates:`, {
      latitude,
      longitude,
      altitude,
    })

    // Check if GPS data is valid
    if (!exif || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return {
        photoId: photo.id,
        photo,
        gps: null,
        timestamp: photo.createdAt,
        hasValidGps: false,
        extractionError: `No GPS coordinates found. Available EXIF keys: ${exif ? Object.keys(exif).join(', ') : 'none'}`,
      }
    }

    // Validate coordinates
    if (
      latitude < -90 || latitude > 90
      || longitude < -180 || longitude > 180
    ) {
      return {
        photoId: photo.id,
        photo,
        gps: null,
        timestamp: photo.createdAt,
        hasValidGps: false,
        extractionError: `Invalid GPS coordinates (out of range): lat=${latitude}, lng=${longitude}`,
      }
    }

    // Extract GPS coordinates
    const gps: GpsCoordinates = {
      latitude,
      longitude,
      altitude,
    }

    // Extract timestamp (prefer DateTimeOriginal over CreateDate)
    const timestamp = exif.DateTimeOriginal || exif.CreateDate || photo.createdAt

    return {
      photoId: photo.id,
      photo,
      gps,
      timestamp: timestamp instanceof Date ? timestamp : new Date(timestamp),
      hasValidGps: true,
    }
  }
  catch (error) {
    // Handle parsing errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return {
      photoId: photo.id,
      photo,
      gps: null,
      timestamp: photo.createdAt,
      hasValidGps: false,
      extractionError: `Failed to parse EXIF: ${errorMessage}`,
    }
  }
}

/**
 * Categorize GPS extraction errors
 */
export function categorizeGpsError(
  gpsData: PhotoGpsData,
): PhotoGpsError | null {
  if (gpsData.hasValidGps || !gpsData.extractionError) {
    return null
  }

  let errorType: PhotoGpsError['errorType'] = 'extraction_failed'

  if (gpsData.extractionError.includes('No GPS')) {
    errorType = 'no_gps'
  }
  else if (gpsData.extractionError.includes('Invalid')) {
    errorType = 'invalid_format'
  }
  else if (gpsData.extractionError.includes('Failed to parse')) {
    errorType = 'no_exif'
  }

  return {
    photoId: gpsData.photoId,
    photoName: gpsData.photo.file.name,
    errorType,
    errorMessage: gpsData.extractionError,
  }
}

/**
 * Validate if a photo has valid GPS data
 */
export function hasValidGpsData(gpsData: PhotoGpsData): boolean {
  return gpsData.hasValidGps && gpsData.gps !== null
}

/**
 * Sort GPS data by timestamp (chronologically)
 */
export function sortGpsDataByTime(gpsData: PhotoGpsData[]): PhotoGpsData[] {
  return [...gpsData].sort((a, b) => {
    // Handle both Date objects and serialized timestamps (from Zustand persist)
    const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime()
    const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime()
    return timeA - timeB
  })
}

/**
 * Generate trajectory path from GPS data
 */
export function generateTrajectoryPath(
  gpsData: PhotoGpsData[],
): [number, number][] {
  return gpsData
    .filter(hasValidGpsData)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map(data => [data.gps!.longitude, data.gps!.latitude])
}
