import type { FC } from 'react'
import type { PhotoGpsData, UploadedPhoto } from '@/types/workspace'
import { useTranslation } from 'react-i18next'
import { PhotoPreviewCard } from './PhotoPreviewCard'

interface PhotoPreviewGridProps {
  photos: UploadedPhoto[]
  onRemove: (photoId: string) => void
  gpsData?: PhotoGpsData[]
  showGpsStatus?: boolean
}

export const PhotoPreviewGrid: FC<PhotoPreviewGridProps> = ({
  photos,
  onRemove,
  gpsData = [],
  showGpsStatus = false,
}) => {
  const { t } = useTranslation()

  // Get GPS status for a photo (returns undefined if not yet processed)
  const getGpsStatus = (photoId: string): boolean | undefined => {
    const data = gpsData.find(d => d.photoId === photoId)
    if (!data)
      return undefined // Still processing
    return data.hasValidGps
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">
          {t('workspace.upload.noPhotos', {
            defaultValue: 'No photos uploaded yet',
          })}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Grid header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          {t('workspace.upload.photoCount', {
            defaultValue: '{{count}} photo(s) uploaded',
            count: photos.length,
          })}
        </h3>

        {showGpsStatus && (
          <div className="text-xs text-gray-500">
            {t('workspace.upload.gpsStatusLegend', {
              defaultValue: 'Green = GPS available, Yellow = No GPS',
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {photos.map(photo => (
          <PhotoPreviewCard
            key={photo.id}
            photo={photo}
            onRemove={onRemove}
            showGpsStatus={showGpsStatus}
            hasValidGps={getGpsStatus(photo.id)}
          />
        ))}
      </div>
    </div>
  )
}
