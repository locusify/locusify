import type { GPSCoordinates } from '@/types/map'
import type { UploadFile } from '@/types/upload'
import { m } from 'motion/react'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { extractExifData } from '@/lib/exif'
import { cn } from '@/lib/utils'
import { GPSDirection } from '@/types/map'

interface PhotoSelectorProps {
  onFilesSelected: (files: UploadFile[]) => void
}

export function PhotoSelector({ onFilesSelected }: PhotoSelectorProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extract GPS coordinates from EXIF data
  const extractGPSCoordinates = useCallback((exif: NonNullable<Awaited<ReturnType<typeof extractExifData>>>): GPSCoordinates | undefined => {
    if (!exif)
      return undefined

    // Try to get coordinates from exifr's processed fields
    let latitude = exif.latitude
    let longitude = exif.longitude
    const altitude = exif.altitude

    // Fallback to raw GPS fields if processed fields not available
    if (typeof latitude !== 'number' && exif.GPSLatitude) {
      if (typeof exif.GPSLatitude === 'number') {
        latitude = exif.GPSLatitude
      }
      else if (Array.isArray(exif.GPSLatitude) && exif.GPSLatitude.length === 3) {
        // Convert from [degrees, minutes, seconds] to decimal
        const [degrees, minutes, seconds] = exif.GPSLatitude
        latitude = degrees + minutes / 60 + seconds / 3600
      }
    }

    if (typeof longitude !== 'number' && exif.GPSLongitude) {
      if (typeof exif.GPSLongitude === 'number') {
        longitude = exif.GPSLongitude
      }
      else if (Array.isArray(exif.GPSLongitude) && exif.GPSLongitude.length === 3) {
        // Convert from [degrees, minutes, seconds] to decimal
        const [degrees, minutes, seconds] = exif.GPSLongitude
        longitude = degrees + minutes / 60 + seconds / 3600
      }
    }

    // Validate coordinates
    if (
      typeof latitude !== 'number'
      || typeof longitude !== 'number'
      || latitude < -90 || latitude > 90
      || longitude < -180 || longitude > 180
    ) {
      return undefined
    }

    // Get GPS direction references
    const latitudeRef
      = exif.GPSLatitudeRef === 'S' || exif.GPSLatitudeRef === 'South'
        ? GPSDirection.South
        : GPSDirection.North

    const longitudeRef
      = exif.GPSLongitudeRef === 'W' || exif.GPSLongitudeRef === 'West'
        ? GPSDirection.West
        : GPSDirection.East

    // Apply reference direction (if coordinates are positive)
    if (latitudeRef === GPSDirection.South && latitude > 0) {
      latitude = -latitude
    }
    if (longitudeRef === GPSDirection.West && longitude > 0) {
      longitude = -longitude
    }

    const altitudeRef = typeof exif.GPSAltitudeRef === 'number' && exif.GPSAltitudeRef === 1
      ? 'Below Sea Level'
      : 'Above Sea Level'

    return {
      latitude,
      longitude,
      altitude,
      latitudeRef,
      longitudeRef,
      altitudeRef,
    }
  }, [])

  // Handle file processing
  const processFiles = useCallback(
    async (fileList: FileList) => {
      const files: UploadFile[] = []

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]

        // Only accept image files
        if (!file.type.startsWith('image/')) {
          continue
        }

        // Create preview URL
        const preview = URL.createObjectURL(file)

        // Extract EXIF data using the browser-compatible extractExifData function
        const exif = await extractExifData(file)
        let gpsInfo: GPSCoordinates | undefined
        let dateTaken: string | undefined
        let camera: { make?: string, model?: string } | undefined

        if (exif) {
          // Extract GPS coordinates
          gpsInfo = extractGPSCoordinates(exif)

          // Extract date taken (convert Date to string if needed)
          const dateTimeOriginal = exif.DateTimeOriginal
          const createDate = exif.CreateDate

          if (dateTimeOriginal) {
            dateTaken = dateTimeOriginal instanceof Date ? dateTimeOriginal.toISOString() : dateTimeOriginal
          }
          else if (createDate) {
            dateTaken = createDate instanceof Date ? createDate.toISOString() : createDate
          }

          // Extract camera info
          if (exif.Make || exif.Model) {
            camera = {
              make: exif.Make,
              model: exif.Model,
            }
          }
        }

        const uploadFile: UploadFile = {
          id: `${file.name}-${file.lastModified}`,
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          gpsInfo,
          exif: exif ?? undefined,
          dateTaken,
          camera,
        }

        files.push(uploadFile)
      }

      onFilesSelected(files)
    },
    [onFilesSelected, extractGPSCoordinates],
  )

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFiles(files)
      }
    },
    [processFiles],
  )

  // Handle click to open file picker
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <m.div
      className="flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Click to select area */}
      <m.div
        className={cn(
          'relative flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 transition-all duration-300 backdrop-blur-sm',
          'border-gray-300/50 bg-white/30 hover:border-gray-400/50 hover:bg-white/40 dark:border-gray-600/50 dark:bg-black/20 dark:hover:border-gray-500/50 dark:hover:bg-black/30',
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Icon */}
        <m.div className="mb-6 text-6xl bg-white size-14 border-fill-tertiary rounded-2xl flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0a0a0a"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"
            />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </m.div>

        {/* Title */}
        <m.h2
          className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {t('upload.select.photos')}
        </m.h2>

        {/* Description */}
        <m.p
          className="mb-8 text-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {t('upload.select.description')}
        </m.p>

        {/* Upload button */}
        <m.button
          type="button"
          className="cursor-pointer rounded-full bg-blue-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl dark:bg-blue-500 dark:hover:bg-blue-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('upload.choose.files')}
        </m.button>

        {/* Supported formats */}
        <m.p
          className="mt-8 text-xs text-gray-500 dark:text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t('upload.supported.formats')}
        </m.p>
      </m.div>
    </m.div>
  )
}
