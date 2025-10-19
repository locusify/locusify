import type { FC } from 'react'
import { Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PhotoDropzoneProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
  accept?: string
  disabled?: boolean
}

const DEFAULT_MAX_FILES = 50
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_ACCEPT = 'image/*'

export const PhotoDropzone: FC<PhotoDropzoneProps> = ({
  onFilesSelected,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  accept = DEFAULT_ACCEPT,
  disabled = false,
}) => {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Validate selected files
  const validateFiles = useCallback(
    (files: File[]): { valid: File[], errors: string[] } => {
      const valid: File[] = []
      const errors: string[] = []

      if (files.length > maxFiles) {
        errors.push(
          t('workspace.upload.validation.maxPhotos', {
            defaultValue: 'Maximum {{count}} photos allowed',
            count: maxFiles,
          }),
        )
        return { valid: [], errors }
      }

      files.forEach((file) => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          errors.push(
            t('workspace.upload.validation.invalidType', {
              defaultValue: '{{name}} is not an image file',
              name: file.name,
            }),
          )
          return
        }

        // Check file size
        if (file.size > maxFileSize) {
          const sizeMB = (maxFileSize / (1024 * 1024)).toFixed(0)
          errors.push(
            t('workspace.upload.validation.fileSize', {
              defaultValue: '{{name}} exceeds {{size}}MB limit',
              name: file.name,
              size: sizeMB,
            }),
          )
          return
        }

        valid.push(file)
      })

      return { valid, errors }
    },
    [maxFiles, maxFileSize, t],
  )

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const { valid, errors } = validateFiles(files)

      if (errors.length > 0) {
        setValidationError(errors.join('; '))
        return
      }

      setValidationError(null)
      onFilesSelected(valid)

      // Reset input to allow selecting the same files again
      e.target.value = ''
    },
    [validateFiles, onFilesSelected],
  )

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled)
        return

      const files = Array.from(e.dataTransfer.files)
      const { valid, errors } = validateFiles(files)

      if (errors.length > 0) {
        setValidationError(errors.join('; '))
        return
      }

      setValidationError(null)
      onFilesSelected(valid)
    },
    [disabled, validateFiles, onFilesSelected],
  )

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'border-2 border-dashed rounded-lg',
          'transition-colors duration-200',
          'min-h-[240px] p-8',
          isDragging && !disabled
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-gray-400 hover:bg-gray-100 cursor-pointer',
        )}
      >
        {/* Upload icon */}
        <div
          className={cn(
            'rounded-full p-4 mb-4',
            isDragging && !disabled ? 'bg-blue-100' : 'bg-gray-200',
          )}
        >
          <Upload
            className={cn(
              'size-8',
              isDragging && !disabled ? 'text-blue-500' : 'text-gray-500',
            )}
          />
        </div>

        {/* Text */}
        <p className="text-base font-medium text-gray-900 mb-2">
          {isDragging && !disabled
            ? t('workspace.upload.dropzone.active', {
                defaultValue: 'Drop photos here',
              })
            : t('workspace.upload.dropzone.idle', {
                defaultValue: 'Drag & drop photos or click to browse',
              })}
        </p>

        <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
          {t('workspace.upload.dropzone.hint', {
            defaultValue:
              'Upload up to {{maxFiles}} photos. Each photo must be under {{maxSize}}MB.',
            maxFiles,
            maxSize: (maxFileSize / (1024 * 1024)).toFixed(0),
          })}
        </p>

        {/* Browse button */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={disabled}
          onClick={() => {
            document.getElementById('photo-file-input')?.click()
          }}
        >
          {t('workspace.upload.browse', { defaultValue: 'Browse Files' })}
        </Button>

        {/* Hidden file input */}
        <input
          id="photo-file-input"
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInputChange}
          disabled={disabled}
          className="absolute inset-0 size-full opacity-0 cursor-pointer"
          aria-label={t('workspace.upload.fileInput', {
            defaultValue: 'Select photos to upload',
          })}
        />
      </div>

      {/* Validation error */}
      {validationError && (
        <div
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <p className="text-sm text-red-800">{validationError}</p>
        </div>
      )}

      {/* Requirements notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 font-medium mb-1">
          {t('workspace.upload.requirements.title', {
            defaultValue: 'Photo Requirements:',
          })}
        </p>
        <ul className="text-xs text-blue-700 space-y-0.5 ml-4 list-disc">
          <li>
            {t('workspace.upload.requirements.gps', {
              defaultValue: 'Photos must contain GPS location data (EXIF)',
            })}
          </li>
          <li>
            {t('workspace.upload.requirements.format', {
              defaultValue: 'Supported formats: JPG, PNG, HEIC, WebP',
            })}
          </li>
          <li>
            {t('workspace.upload.requirements.count', {
              defaultValue: 'Minimum 2 photos required for trajectory',
            })}
          </li>
        </ul>
      </div>
    </div>
  )
}
