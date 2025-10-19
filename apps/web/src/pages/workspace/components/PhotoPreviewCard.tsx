import type { FC } from 'react'
import type { UploadedPhoto } from '@/types/workspace'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PhotoPreviewCardProps {
  photo: UploadedPhoto
  onRemove: (photoId: string) => void
  showGpsStatus?: boolean
  hasValidGps?: boolean
}

export const PhotoPreviewCard: FC<PhotoPreviewCardProps> = ({
  photo,
  onRemove,
  showGpsStatus = false,
  hasValidGps = false,
}) => {
  const { t } = useTranslation()

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024)
      return `${bytes} B`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get status indicator
  const getStatusIndicator = () => {
    if (photo.uploadStatus === 'uploading') {
      return (
        <div className="flex items-center gap-1.5 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs font-medium">
            {photo.uploadProgress}
            %
          </span>
        </div>
      )
    }

    if (photo.uploadStatus === 'completed') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-medium">
            {t('workspace.upload.status.completed', {
              defaultValue: 'Uploaded',
            })}
          </span>
        </div>
      )
    }

    if (photo.uploadStatus === 'failed') {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-medium">
            {t('workspace.upload.status.failed', {
              defaultValue: 'Failed',
            })}
          </span>
        </div>
      )
    }

    return null
  }

  // Get GPS status indicator with loading state
  const getGpsStatusIndicator = () => {
    if (!showGpsStatus)
      return null

    // Show loading state if GPS status is unknown (not yet processed)
    if (hasValidGps === undefined || hasValidGps === null) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>
            {t('workspace.gps.status.checking', {
              defaultValue: 'Checking...',
            })}
          </span>
        </div>
      )
    }

    return (
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
          hasValidGps
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700',
        )}
      >
        {hasValidGps
          ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {t('workspace.gps.status.valid', {
                    defaultValue: 'GPS OK',
                  })}
                </span>
              </>
            )
          : (
              <>
                <AlertCircle className="h-3 w-3" />
                <span>
                  {t('workspace.gps.status.missing', {
                    defaultValue: 'No GPS',
                  })}
                </span>
              </>
            )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden',
        'border-2 transition-all duration-200',
        photo.uploadStatus === 'failed'
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md',
      )}
    >
      {/* Photo preview */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={photo.previewUrl}
          alt={photo.file.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Upload progress overlay */}
        {photo.uploadStatus === 'uploading' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-3/4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${photo.uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(photo.id)}
          className={cn(
            'absolute top-2 right-2',
            'bg-white/90 hover:bg-white',
            'shadow-sm rounded-full p-1.5',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-200',
          )}
          aria-label={t('workspace.upload.remove', {
            defaultValue: 'Remove photo',
          })}
        >
          <X className="h-4 w-4 text-gray-700" />
        </Button>
      </div>

      {/* Photo info */}
      <div className="p-3 space-y-2">
        {/* File name */}
        <p
          className="text-sm font-medium text-gray-900 truncate"
          title={photo.file.name}
        >
          {photo.file.name}
        </p>

        {/* File size */}
        <p className="text-xs text-gray-500">
          {formatFileSize(photo.size)}
        </p>

        {/* Status indicators */}
        <div className="flex items-center justify-between gap-2">
          {getStatusIndicator()}
          {getGpsStatusIndicator()}
        </div>

        {/* Error message */}
        {photo.uploadError && (
          <div className="p-2 bg-red-100 border border-red-200 rounded">
            <p className="text-xs text-red-700">{photo.uploadError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
