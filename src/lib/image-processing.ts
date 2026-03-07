export interface PhotoAdjustment {
  offsetX: number // -2..2 relative to canvas
  offsetY: number
  scale: number // >0, default 1
}

export const DEFAULT_ADJUSTMENT: PhotoAdjustment = { offsetX: 0, offsetY: 0, scale: 1 }

interface BBox {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}

/**
 * Load an image from a URL (blob or http).
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.crossOrigin = 'anonymous'
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    el.src = url
  })
}

/**
 * Generate a polygon-clipped photo as a blob URL.
 *
 * The photo is drawn onto a canvas whose dimensions match the polygon's bbox,
 * clipped to the exact polygon shape (including holes via evenodd rule).
 * Areas outside the polygon are fully transparent.
 */
export async function generateClippedPhoto(
  photoUrl: string,
  rings: number[][][],
  bbox: BBox,
  adj: PhotoAdjustment = DEFAULT_ADJUSTMENT,
): Promise<{ url: string, paddedBBox: BBox }> {
  // Pad the bbox slightly so the polygon clip is fully inside the canvas
  // and sub-pixel rounding at edges doesn't leave gaps
  const PAD_LNG = (bbox.maxLng - bbox.minLng) * 0.005
  const PAD_LAT = (bbox.maxLat - bbox.minLat) * 0.005
  const padded: BBox = {
    minLng: bbox.minLng - PAD_LNG,
    maxLng: bbox.maxLng + PAD_LNG,
    minLat: bbox.minLat - PAD_LAT,
    maxLat: bbox.maxLat + PAD_LAT,
  }

  const lngSpan = padded.maxLng - padded.minLng

  // Use Mercator projection for Y axis so canvas content aligns with
  // MapLibre's image source rendering (which interpolates in Mercator space)
  const latToMercY = (lat: number) =>
    Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))

  const mercYMax = latToMercY(padded.maxLat)
  const mercYMin = latToMercY(padded.minLat)
  const mercYSpan = mercYMax - mercYMin

  const MAX_DIM = 1024
  const lngSpanRad = lngSpan * Math.PI / 180
  const aspect = lngSpanRad / mercYSpan
  const canvasW = aspect > 1 ? MAX_DIM : Math.round(MAX_DIM * aspect)
  const canvasH = aspect > 1 ? Math.round(MAX_DIM / aspect) : MAX_DIM

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')
  if (!ctx)
    throw new Error('Failed to get canvas 2d context')

  const toX = (lng: number) => ((lng - padded.minLng) / lngSpan) * canvasW
  const toY = (lat: number) => ((mercYMax - latToMercY(lat)) / mercYSpan) * canvasH

  // Build polygon clip path (evenodd handles holes correctly)
  ctx.beginPath()
  for (const ring of rings) {
    ctx.moveTo(toX(ring[0][0]), toY(ring[0][1]))
    for (let i = 1; i < ring.length; i++) {
      ctx.lineTo(toX(ring[i][0]), toY(ring[i][1]))
    }
    ctx.closePath()
  }
  ctx.clip('evenodd')

  // Load photo
  const img = await loadImage(photoUrl)

  // Center-cover: scale photo to fill canvas, then apply user offset/scale
  const imgAspect = img.width / img.height
  const canvasAspect = canvasW / canvasH
  let drawW: number
  let drawH: number
  if (imgAspect > canvasAspect) {
    drawH = canvasH * adj.scale
    drawW = drawH * imgAspect
  }
  else {
    drawW = canvasW * adj.scale
    drawH = drawW / imgAspect
  }

  const drawX = (canvasW - drawW) / 2 + adj.offsetX * canvasW * 0.3
  const drawY = (canvasH - drawH) / 2 + adj.offsetY * canvasH * 0.3

  ctx.drawImage(img, drawX, drawY, drawW, drawH)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))),
      'image/png',
    )
  })

  return { url: URL.createObjectURL(blob), paddedBBox: padded }
}

/**
 * Extract all coordinate rings from a Polygon or MultiPolygon geometry.
 */
export function extractAllRings(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): number[][][] {
  if (geometry.type === 'Polygon')
    return geometry.coordinates
  return geometry.coordinates.flatMap(p => p)
}

/**
 * Compute the bounding box of a set of coordinate rings.
 */
export function computeRingsBBox(rings: number[][][]): BBox {
  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    }
  }
  return { minLng, maxLng, minLat, maxLat }
}
