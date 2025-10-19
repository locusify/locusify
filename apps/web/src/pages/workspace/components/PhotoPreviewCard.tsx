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

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024)
      return `${bytes} B`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /**
   * 获取 GPS 状态指示器（带加载状态）
   */
  const getGpsStatusIndicator = () => {
    if (!showGpsStatus)
      return null

    // 如果 GPS 状态未知（尚未处理），显示加载状态
    if (hasValidGps === undefined || hasValidGps === null) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Loader2 className="size-3 animate-spin" />
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
                <CheckCircle2 className="size-3" />
                <span>
                  {t('workspace.gps.status.valid', { defaultValue: 'GPS OK' })}
                </span>
              </>
            )
          : (
              <>
                <AlertCircle className="size-3" />
                <span>
                  {t('workspace.gps.status.missing', { defaultValue: 'No GPS' })}
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
        'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md',
      )}
    >
      {/* 照片预览 */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={photo.previewUrl}
          alt={photo.file.name}
          className="size-full object-cover"
          loading="lazy"
        />

        {/* 移除按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(photo.id)}
          className={cn(
            'absolute top-2 right-2',
            'bg-white/90 hover:bg-white',
            'shadow-sm rounded-full p-1',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-200',
          )}
          aria-label={t('workspace.upload.remove', { defaultValue: 'Remove photo' })}
        >
          <X className="size-4 text-gray-700" />
        </Button>
      </div>

      {/* 照片信息 */}
      <div className="p-3 space-y-2">
        {/* 文件名 */}
        <p
          className="text-sm font-medium text-gray-900 truncate"
          title={photo.file.name}
        >
          {photo.file.name}
        </p>

        <div className="flex items-center justify-between">
          {/* 文件大小 */}
          <div className="text-xs text-gray-500">
            {formatFileSize(photo.size)}
          </div>

          {/* GPS 状态指示器 */}
          <div className={cn('flex items-center justify-end', { hidden: !showGpsStatus })}>
            {getGpsStatusIndicator()}
          </div>
        </div>
      </div>
    </div>
  )
}
