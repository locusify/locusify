import type { FC } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface UploadProgressBarProps {
  current: number
  total: number
  isUploading: boolean
}

export const UploadProgressBar: FC<UploadProgressBarProps> = ({
  current,
  total,
  isUploading,
}) => {
  const { t } = useTranslation()

  const progress = total > 0 ? (current / total) * 100 : 0

  if (!isUploading && current === 0) {
    return null
  }

  return (
    <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        {isUploading && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
        <p className="text-sm font-medium text-primary">
          {isUploading
            ? t('workspace.upload.progress', {
                defaultValue: 'Uploading {{current}} of {{total}} photos...',
                current,
                total,
              })
            : t('workspace.upload.completed', {
                defaultValue: 'All {{total}} photos uploaded successfully',
                total,
              })}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-1 text-right">
        <span className="text-xs font-medium text-primary">
          {progress.toFixed(0)}
          %
        </span>
      </div>
    </div>
  )
}
