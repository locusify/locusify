import type { PhotoAdjustment } from '@/lib/image-processing'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Layer, Marker, Source, useMap } from 'react-map-gl/maplibre'
import {
  computeRingsBBox,
  DEFAULT_ADJUSTMENT,
  extractAllRings,
  generateClippedPhoto,
} from '@/lib/image-processing'
import { useRegionStore } from '@/stores/regionStore'

interface RegionImage {
  url: string
  coordinates: [[number, number], [number, number], [number, number], [number, number]]
}

/**
 * Compute centroid of the largest polygon in a feature.
 */
function computeCentroid(feature: GeoJSON.Feature): { lng: number, lat: number } {
  const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
  let ring: number[][]

  if (geometry.type === 'Polygon') {
    ring = geometry.coordinates[0]
  }
  else if (geometry.type === 'MultiPolygon') {
    let maxArea = 0
    ring = geometry.coordinates[0][0]
    for (const polygon of geometry.coordinates) {
      const outerRing = polygon[0]
      let area = 0
      for (let i = 0; i < outerRing.length - 1; i++) {
        area += outerRing[i][0] * outerRing[i + 1][1] - outerRing[i + 1][0] * outerRing[i][1]
      }
      area = Math.abs(area) / 2
      if (area > maxArea) {
        maxArea = area
        ring = outerRing
      }
    }
  }
  else {
    return { lng: 0, lat: 0 }
  }

  let sumLng = 0
  let sumLat = 0
  for (const coord of ring) {
    sumLng += coord[0]
    sumLat += coord[1]
  }
  return { lng: sumLng / ring.length, lat: sumLat / ring.length }
}

/**
 * Generate a RegionImage for a single region.
 */
async function generateRegionImage(
  regionId: string,
  photoUrl: string,
  boundaryData: GeoJSON.FeatureCollection,
  adj: PhotoAdjustment,
): Promise<{ regionId: string, image: RegionImage } | null> {
  const feature = boundaryData.features.find(f => f.id === regionId)
  if (!feature)
    return null

  const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
  const rings = extractAllRings(geometry)
  const bbox = computeRingsBBox(rings)

  const { url, paddedBBox } = await generateClippedPhoto(photoUrl, rings, bbox, adj)
  return {
    regionId,
    image: {
      url,
      coordinates: [
        [paddedBBox.minLng, paddedBBox.maxLat],
        [paddedBBox.maxLng, paddedBBox.maxLat],
        [paddedBBox.maxLng, paddedBBox.minLat],
        [paddedBBox.minLng, paddedBBox.minLat],
      ],
    },
  }
}

/**
 * Fragment-mode layer: regions filled with polygon-clipped photos.
 *
 * Each lit region's photo is canvas-clipped to the exact polygon shape
 * (transparent outside), then rendered as an `image` source.
 *
 * Scale controls appear only when the user clicks a lit region.
 * In normal (non-fragment) mode, nothing is rendered.
 */
export function RegionFillLayer() {
  const { current: map } = useMap()
  const regionPhotos = useRegionStore(s => s.regionPhotos)
  const boundaryData = useRegionStore(s => s.boundaryData)
  const isFragmentMode = useRegionStore(s => s.isFragmentMode)

  const [regionImages, setRegionImages] = useState<Map<string, RegionImage>>(new Map())
  const [adjustments, setAdjustments] = useState<Map<string, PhotoAdjustment>>(new Map())
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const prevUrlsRef = useRef<Map<string, string>>(new Map())

  // Centroids for control marker placement
  const centroids = useMemo(() => {
    if (!boundaryData)
      return new Map<string, { lng: number, lat: number }>()
    const result = new Map<string, { lng: number, lat: number }>()
    for (const [regionId] of regionPhotos) {
      const feature = boundaryData.features.find(f => f.id === regionId)
      if (feature)
        result.set(regionId, computeCentroid(feature))
    }
    return result
  }, [boundaryData, regionPhotos])

  // Generate polygon-clipped photo images (parallel)
  useEffect(() => {
    if (!boundaryData || regionPhotos.size === 0) {
      for (const url of prevUrlsRef.current.values()) {
        URL.revokeObjectURL(url)
      }
      prevUrlsRef.current = new Map()
      setRegionImages(new Map())
      return
    }

    let cancelled = false

    const generate = async () => {
      const tasks = Array.from(regionPhotos.entries()).map(
        ([regionId, entry]) => {
          const adj = adjustments.get(regionId) ?? DEFAULT_ADJUSTMENT
          return generateRegionImage(regionId, entry.photoUrl, boundaryData, adj)
            .catch((error) => {
              console.warn(`Failed to generate clipped photo for ${regionId}:`, error)
              return null
            })
        },
      )

      const results = await Promise.all(tasks)

      if (cancelled) {
        for (const r of results) {
          if (r)
            URL.revokeObjectURL(r.image.url)
        }
        return
      }

      const newImages = new Map<string, RegionImage>()
      const newUrls = new Map<string, string>()
      for (const r of results) {
        if (r) {
          newImages.set(r.regionId, r.image)
          newUrls.set(r.regionId, r.image.url)
        }
      }

      // Revoke old URLs
      for (const url of prevUrlsRef.current.values()) {
        URL.revokeObjectURL(url)
      }
      prevUrlsRef.current = newUrls
      setRegionImages(newImages)
    }

    generate()

    return () => {
      cancelled = true
    }
  }, [boundaryData, regionPhotos, adjustments])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of prevUrlsRef.current.values()) {
        URL.revokeObjectURL(url)
      }
    }
  }, [])

  // Click handler: select/deselect a lit region to show scale controls
  useEffect(() => {
    if (!map || !isFragmentMode)
      return
    const mapInstance = map.getMap()

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      let foundRegion: string | null = null
      try {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['region-fill-clickable'],
        })
        if (features.length > 0) {
          foundRegion = features[0].id as string
        }
      }
      catch {
        // Layer might not exist yet
      }

      setSelectedRegion(prev => (foundRegion && prev !== foundRegion ? foundRegion : null))
    }

    mapInstance.on('click', handleClick)
    return () => {
      mapInstance.off('click', handleClick)
    }
  }, [map, isFragmentMode])

  // Clear selection when leaving fragment mode
  useEffect(() => {
    if (!isFragmentMode)
      setSelectedRegion(null)
  }, [isFragmentMode])

  const handleScale = useCallback((regionId: string, factor: number) => {
    setAdjustments((prev) => {
      const current = prev.get(regionId) ?? DEFAULT_ADJUSTMENT
      const next = new Map(prev)
      next.set(regionId, {
        ...current,
        scale: Math.max(0.5, Math.min(4, current.scale * factor)),
      })
      return next
    })
  }, [])

  // Boundary data with lit/unlit flag
  const litBoundaryData = useMemo(() => {
    if (!boundaryData)
      return null
    return {
      ...boundaryData,
      features: boundaryData.features.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          lit: regionPhotos.has(feature.id as string) ? 'yes' : 'no',
        },
      })),
    }
  }, [boundaryData, regionPhotos])

  if (!isFragmentMode || !litBoundaryData)
    return null

  return (
    <>
      {/* Clipped photo rasters (below boundary layers) */}
      {Array.from(regionImages.entries()).map(([regionId, img]) => (
        <Source
          key={regionId}
          id={`photo-${regionId}`}
          type="image"
          url={img.url}
          coordinates={img.coordinates}
        >
          <Layer
            id={`photo-layer-${regionId}`}
            type="raster"
            paint={{ 'raster-opacity': 0.92 }}
          />
        </Source>
      ))}

      {/* Region boundaries (above photos) */}
      <Source id="region-boundaries" type="geojson" data={litBoundaryData}>
        {/* Invisible clickable fill for lit regions */}
        <Layer
          id="region-fill-clickable"
          type="fill"
          filter={['==', ['get', 'lit'], 'yes']}
          paint={{ 'fill-color': '#000000', 'fill-opacity': 0.01 }}
        />
        {/* Fog-of-war for unlit regions */}
        <Layer
          id="region-fill-unlit"
          type="fill"
          filter={['==', ['get', 'lit'], 'no']}
          paint={{
            'fill-color': '#000000',
            'fill-opacity': 0.25,
          }}
        />
        {/* Outlines only on unlit regions (lit regions use photo edge as boundary) */}
        <Layer
          id="region-outline"
          type="line"
          filter={['==', ['get', 'lit'], 'no']}
          paint={{
            'line-color': '#888888',
            'line-width': 0.5,
            'line-opacity': 0.15,
          }}
        />
      </Source>

      {/* Scale controls — only for the selected region */}
      {selectedRegion && centroids.get(selectedRegion) && (
        <Marker
          longitude={centroids.get(selectedRegion)!.lng}
          latitude={centroids.get(selectedRegion)!.lat}
          anchor="center"
        >
          <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 shadow-lg backdrop-blur-sm">
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/20 active:scale-90"
              onClick={() => handleScale(selectedRegion, 0.8)}
            >
              <i className="i-mingcute-minimize-line size-3.5" />
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/20 active:scale-90"
              onClick={() => handleScale(selectedRegion, 1.25)}
            >
              <i className="i-mingcute-add-line size-3.5" />
            </button>
          </div>
        </Marker>
      )}
    </>
  )
}
