import type { FC } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { batchExtractGpsData, getExtractionStats } from '@/lib/exif/batch-processor'
import { categorizeGpsError, generateTrajectoryPath, sortGpsDataByTime } from '@/lib/exif/parser'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { GpsDataTable } from './GpsDataTable'
import { StepNavigation } from './StepNavigation'

export const GpsExtractionStep: FC = () => {
  const { t } = useTranslation()

  const {
    photos,
    gpsData,
    isExtractingGps,
    setGpsData,
    setIsExtractingGps,
    addGpsError,
    clearGpsErrors,
    setTrajectoryPath,
    goToNextStep,
    goToPreviousStep,
  } = useWorkspaceStore()

  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 })

  // Extract GPS data from all photos
  const handleExtractGps = useCallback(async () => {
    setIsExtractingGps(true)
    clearGpsErrors()
    setExtractionProgress({ current: 0, total: photos.length })

    try {
      const results = await batchExtractGpsData(photos, {
        maxConcurrent: 5,
        onProgress: (current, total) => {
          setExtractionProgress({ current, total })
        },
      })

      // Sort by timestamp
      const sortedResults = sortGpsDataByTime(results)
      setGpsData(sortedResults)

      // Categorize errors
      sortedResults.forEach((data) => {
        const error = categorizeGpsError(data)
        if (error) {
          addGpsError(error)
        }
      })

      // Generate trajectory path
      const trajectoryPath = generateTrajectoryPath(sortedResults)
      setTrajectoryPath(trajectoryPath)
    }
    catch (error) {
      console.error('Failed to extract GPS data:', error)
    }
    finally {
      setIsExtractingGps(false)
    }
  }, [photos, setGpsData, setIsExtractingGps, addGpsError, clearGpsErrors, setTrajectoryPath])

  // Auto-extract GPS data when component mounts
  useEffect(() => {
    if (photos.length > 0 && gpsData.length === 0 && !isExtractingGps) {
      handleExtractGps()
    }
  }, []) // Only run on mount

  // Get extraction statistics
  const stats = getExtractionStats(gpsData)

  // Check if can proceed
  const canProceed = stats.successful >= 2 && !isExtractingGps

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('workspace.gps.title', {
            defaultValue: 'GPS Data Extraction',
          })}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {t('workspace.gps.description', {
            defaultValue:
              'Extracting GPS coordinates from photo EXIF data to generate your trajectory.',
          })}
        </p>
      </div>

      {/* Processing status */}
      {isExtractingGps && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-blue-900">
              {t('workspace.gps.processing', {
                defaultValue: 'Processing {{current}} of {{total}} photos...',
                current: extractionProgress.current,
                total: extractionProgress.total,
              })}
            </p>
          </div>
          <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${extractionProgress.total > 0
                  ? (extractionProgress.current / extractionProgress.total) * 100
                  : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results summary */}
      {!isExtractingGps && gpsData.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {/* Total */}
          <div className="p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs md:text-sm text-gray-600 mb-1">
              {t('workspace.gps.stats.total', {
                defaultValue: 'Total Photos',
              })}
            </p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          {/* Successful */}
          <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
              <p className="text-xs md:text-sm text-green-700">
                {t('workspace.gps.stats.success', {
                  defaultValue: 'GPS Found',
                })}
              </p>
            </div>
            <p className="text-lg md:text-2xl font-bold text-green-900">
              {stats.successful}
              <span className="text-xs md:text-sm font-normal text-green-600 ml-1 md:ml-2">
                (
                {stats.successRate.toFixed(0)}
                %)
              </span>
            </p>
          </div>

          {/* Failed */}
          <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
              <p className="text-xs md:text-sm text-red-700">
                {t('workspace.gps.stats.failed', {
                  defaultValue: 'Missing GPS',
                })}
              </p>
            </div>
            <p className="text-lg md:text-2xl font-bold text-red-900">{stats.failed}</p>
          </div>
        </div>
      )}

      {/* Data table */}
      {!isExtractingGps && gpsData.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            {t('workspace.gps.table.title', {
              defaultValue: 'GPS Data Details',
            })}
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <GpsDataTable gpsData={gpsData} />
          </div>
        </div>
      )}

      {/* Error message for insufficient GPS data */}
      {!isExtractingGps && stats.successful < 2 && gpsData.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">
                {t('workspace.gps.insufficientData', {
                  defaultValue: 'Insufficient GPS Data',
                })}
              </p>
              <p className="text-sm text-yellow-700">
                {t('workspace.gps.insufficientDataMessage', {
                  defaultValue:
                    'At least 2 photos with valid GPS coordinates are required to create a trajectory. Please upload more photos with location data.',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <StepNavigation
        onNext={goToNextStep}
        onBack={goToPreviousStep}
        nextDisabled={!canProceed}
        nextLabel={t('workspace.controls.viewReplay', {
          defaultValue: 'View Replay',
        })}
      />
    </div>
  )
}
