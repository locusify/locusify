import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { useMap } from 'react-map-gl/maplibre'

interface MapControlsProps {
  onGeolocate?: (longitude: number, latitude: number) => void
}

export function MapControls({ onGeolocate }: MapControlsProps) {
  const { current: map } = useMap()
  const { t } = useTranslation()

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom()
      map.easeTo({ zoom: currentZoom + 1, duration: 300 })
    }
  }

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom()
      map.easeTo({ zoom: currentZoom - 1, duration: 300 })
    }
  }

  const handleCompass = () => {
    if (map) {
      map.easeTo({ bearing: 0, pitch: 0, duration: 500 })
    }
  }

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords
          if (map) {
            map.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 1000,
            })
          }
          onGeolocate?.(longitude, latitude)
        },
        (error) => {
          console.warn('Geolocation error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    }
  }

  return (
    <m.div
      className="absolute bottom-4 left-4 z-40 flex flex-col gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Control Group Container */}
      <div className="bg-material-thick border-fill-tertiary flex flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px]">
        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="group hover:bg-fill-secondary active:bg-fill-tertiary flex h-12 w-12 items-center justify-center transition-colors"
          title={t('explory.controls.zoom.in')}
        >
          <i className="i-mingcute-add-line text-text size-5 transition-transform group-hover:scale-110 group-active:scale-95" />
        </button>

        {/* Divider */}
        <div className="bg-fill-secondary h-px w-full" />

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="group hover:bg-fill-secondary active:bg-fill-tertiary flex h-12 w-12 items-center justify-center transition-colors"
          title={t('explory.controls.zoom.out')}
        >
          <i className="i-mingcute-minimize-line text-text size-5 transition-transform group-hover:scale-110 group-active:scale-95" />
        </button>
      </div>

      {/* Compass Button */}
      <div className="bg-material-thick border-fill-tertiary overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px]">
        <button
          type="button"
          onClick={handleCompass}
          className="group hover:bg-fill-secondary active:bg-fill-tertiary flex h-12 w-12 items-center justify-center transition-colors"
          title={t('explory.controls.compass')}
        >
          <i className="i-mingcute-navigation-line text-text size-5 transition-transform group-hover:scale-110 group-active:scale-95" />
        </button>
      </div>

      {/* Geolocate Button */}
      <div className="bg-material-thick border-fill-tertiary overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[120px]">
        <button
          type="button"
          onClick={handleGeolocate}
          className="group hover:bg-fill-secondary active:bg-fill-tertiary flex h-12 w-12 items-center justify-center transition-colors"
          title={t('explory.controls.locate')}
        >
          <i className="i-mingcute-location-fill text-text size-5 transition-transform group-hover:scale-110 group-active:scale-95" />
        </button>
      </div>
    </m.div>
  )
}
