import type { PhotoGpsData, UploadedPhoto } from '@/types/workspace'
import { extractGpsFromPhoto } from './parser'

/**
 * Batch processor configuration
 */
interface BatchProcessorConfig {
  maxConcurrent?: number // Maximum concurrent extractions
  onProgress?: (current: number, total: number) => void // Progress callback
  onPhotoProcessed?: (data: PhotoGpsData) => void // Individual photo callback
}

/**
 * Batch process photos to extract GPS data
 * Processes multiple photos in parallel with concurrency limit
 */
export async function batchExtractGpsData(
  photos: UploadedPhoto[],
  config: BatchProcessorConfig = {},
): Promise<PhotoGpsData[]> {
  const {
    maxConcurrent = 5,
    onProgress,
    onPhotoProcessed,
  } = config

  const results: PhotoGpsData[] = []
  const queue = [...photos]
  let completed = 0
  const total = photos.length

  // Create a pool of concurrent workers
  const workers = Array.from({ length: Math.min(maxConcurrent, total) }, async () => {
    while (queue.length > 0) {
      const photo = queue.shift()
      if (!photo)
        break

      try {
        // Extract GPS data
        const gpsData = await extractGpsFromPhoto(photo)
        results.push(gpsData)

        // Notify individual completion
        if (onPhotoProcessed) {
          onPhotoProcessed(gpsData)
        }

        // Update progress
        completed++
        if (onProgress) {
          onProgress(completed, total)
        }
      }
      catch (error) {
        console.error(`Failed to process photo ${photo.file.name}:`, error)

        // Create error result
        const errorData: PhotoGpsData = {
          photoId: photo.id,
          photo,
          gps: null,
          timestamp: photo.createdAt,
          hasValidGps: false,
          extractionError: error instanceof Error ? error.message : 'Unknown error',
        }

        results.push(errorData)

        // Update progress even on error
        completed++
        if (onProgress) {
          onProgress(completed, total)
        }
      }
    }
  })

  // Wait for all workers to complete
  await Promise.all(workers)

  return results
}

/**
 * Extract GPS data from a single photo with timeout
 */
export async function extractGpsWithTimeout(
  photo: UploadedPhoto,
  timeoutMs: number = 10000,
): Promise<PhotoGpsData> {
  return Promise.race([
    extractGpsFromPhoto(photo),
    new Promise<PhotoGpsData>((_, reject) =>
      setTimeout(
        () => reject(new Error('GPS extraction timeout')),
        timeoutMs,
      ),
    ),
  ]).catch((error): PhotoGpsData => ({
    photoId: photo.id,
    photo,
    gps: null,
    timestamp: photo.createdAt,
    hasValidGps: false,
    extractionError: error instanceof Error ? error.message : 'Timeout',
  }))
}

/**
 * Get extraction statistics
 */
export function getExtractionStats(gpsData: PhotoGpsData[]) {
  const total = gpsData.length
  const successful = gpsData.filter(d => d.hasValidGps).length
  const failed = total - successful

  const errorTypes = gpsData
    .filter(d => !d.hasValidGps)
    .reduce((acc, d) => {
      const error = d.extractionError || 'Unknown'
      acc[error] = (acc[error] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    errorTypes,
  }
}
