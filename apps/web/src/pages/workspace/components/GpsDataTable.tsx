import type { FC } from 'react'
import type { PhotoGpsData } from '@/types/workspace'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface GpsDataTableProps {
  gpsData: PhotoGpsData[]
}

export const GpsDataTable: FC<GpsDataTableProps> = ({ gpsData }) => {
  const { t } = useTranslation()

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Sort by timestamp
  const sortedData = [...gpsData].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )

  if (gpsData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">
          {t('workspace.gps.noData', {
            defaultValue: 'No GPS data available',
          })}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
              #
            </th>
            <th className="text-left px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {t('workspace.gps.table.photo', {
                defaultValue: 'Photo',
              })}
            </th>
            <th className="text-left px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {t('workspace.gps.table.time', {
                defaultValue: 'Time',
              })}
            </th>
            <th className="text-center px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
              {t('workspace.gps.table.status', {
                defaultValue: 'Status',
              })}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((data, index) => (
            <tr
              key={data.photoId}
              className={cn(
                'hover:bg-gray-50 transition-colors',
                !data.hasValidGps && 'bg-red-50',
              )}
            >
              {/* Index */}
              <td className="px-3 md:px-4 py-3 text-sm text-gray-900 font-medium">
                {index + 1}
              </td>

              {/* Photo thumbnail and name */}
              <td className="px-3 md:px-4 py-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <img
                    src={data.photo.previewUrl}
                    alt={data.photo.file.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                      {data.photo.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(data.photo.size / (1024 * 1024)).toFixed(2)}
                      {' '}
                      MB
                    </p>
                  </div>
                </div>
              </td>

              {/* Timestamp */}
              <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-700">
                {formatTimestamp(data.timestamp)}
              </td>

              {/* Status - Icon only */}
              <td className="px-3 md:px-4 py-3">
                <div className="flex justify-center" title={data.hasValidGps ? t('workspace.gps.status.valid', { defaultValue: 'GPS OK' }) : t('workspace.gps.status.missing', { defaultValue: 'No GPS' })}>
                  {data.hasValidGps
                    ? (
                        <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                      )
                    : (
                        <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                      )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
