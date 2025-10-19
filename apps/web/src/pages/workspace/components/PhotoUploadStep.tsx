import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generateMockGpsData, generateMockPhotos, isDevelopmentMode } from '@/lib/dev/mockData'
import { extractGpsFromPhoto } from '@/lib/exif/parser'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { PhotoDropzone } from './PhotoDropzone'
import { PhotoPreviewGrid } from './PhotoPreviewGrid'
import { StepNavigation } from './StepNavigation'

export const PhotoUploadStep: FC = () => {
  const { t } = useTranslation()
  const [loadingMockData, setLoadingMockData] = useState(false)

  const {
    photos,
    gpsData,
    loading,
    addPhotos,
    addUploadedPhotos,
    removePhoto,
    setGpsData,
    setLoading,
    goToNextStep,
  } = useWorkspaceStore()

  // Handle file selection
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      addPhotos(files)
    },
    [addPhotos],
  )

  // Auto-extract GPS for newly added photos using Promise.all
  useEffect(() => {
    // Find photos that don't have GPS data yet
    const photosNeedingGps = photos.filter(
      photo => !gpsData.some(gps => gps.photoId === photo.id),
    )

    if (photosNeedingGps.length === 0) {
      return
    }

    // Extract GPS for all photos in parallel
    const extractAllGps = async () => {
      setLoading(true)

      try {
        // Process all photos in parallel
        const gpsResults = await Promise.all(
          photosNeedingGps.map(photo => extractGpsFromPhoto(photo)),
        )

        // Combine with existing GPS data
        const allGpsData = [
          ...gpsData,
          ...gpsResults,
        ]

        // Set all GPS data at once
        setGpsData(allGpsData)
      }
      catch (error) {
        console.error('Failed to extract GPS data:', error)
      }
      finally {
        setLoading(false)
      }
    }

    extractAllGps()
  }, [photos.length]) // Only trigger when photo count changes

  // Handle remove photo
  const handleRemovePhoto = useCallback(
    (photoId: string) => {
      removePhoto(photoId)
    },
    [removePhoto],
  )

  // Handle loading mock data (development mode only)
  const handleLoadMockData = useCallback(async () => {
    setLoadingMockData(true)
    try {
      // Generate mock photos
      const mockPhotos = await generateMockPhotos()
      addUploadedPhotos(mockPhotos)

      // Generate and set GPS data immediately
      const mockGpsData = generateMockGpsData(mockPhotos)
      setGpsData(mockGpsData)
    }
    catch (error) {
      console.error('Failed to load mock data:', error)
    }
    finally {
      setLoadingMockData(false)
    }
  }, [addUploadedPhotos, setGpsData])

  // Calculate total and processed counts
  const totalCount = photos.length

  // Calculate GPS statistics
  const validGpsCount = gpsData.filter(d => d.hasValidGps).length
  const processedCount = gpsData.length

  // Check if can proceed to next step (need at least 2 photos with valid GPS)
  const canProceed = validGpsCount >= 2 && !loading

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('workspace.upload.title', {
            defaultValue: 'Select Your Photos',
          })}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {t('workspace.upload.description', {
            defaultValue:
              'Drag & drop photos or click to browse. Photos must have GPS location data.',
          })}
        </p>
      </div>

      {/* Dropzone */}
      <PhotoDropzone
        onFilesSelected={handleFilesSelected}
        disabled={loading}
      />

      {/* Development Mode: Load Mock Data Button */}
      {isDevelopmentMode() && photos.length === 0 && (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleLoadMockData}
            disabled={loadingMockData}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMockData
              ? t('workspace.upload.loadingMockData', {
                  defaultValue: 'Loading test data...',
                })
              : t('workspace.upload.loadMockData', {
                  defaultValue: '🧪 Load Test Data (Dev)',
                })}
          </button>
        </div>
      )}

      {/* Photo grid with GPS status */}
      {totalCount > 0 && (
        <PhotoPreviewGrid
          photos={photos}
          onRemove={handleRemovePhoto}
          gpsData={gpsData}
          showGpsStatus={true}
        />
      )}

      {/* GPS Validation Summary - Only show when processing is complete */}
      {!loading && processedCount === totalCount && totalCount > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-800">
              {t('workspace.upload.gpsValidation', {
                defaultValue: '{{valid}} of {{total}} photos have valid GPS data',
                valid: validGpsCount,
                total: totalCount,
              })}
            </p>
            {validGpsCount < 2 && (
              <span className="text-xs text-yellow-700 font-medium">
                {t('workspace.upload.needMoreGps', {
                  defaultValue: 'Need {{count}} more with GPS',
                  count: 2 - validGpsCount,
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <StepNavigation
        onNext={goToNextStep}
        nextDisabled={!canProceed}
        showBack={false}
        loading={loading}
        nextLabel={t('workspace.controls.next', {
          defaultValue: 'Process GPS Data',
        })}
      />
    </div>
  )
}
