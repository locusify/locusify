import type { FeatureCollection } from 'geojson'

let cachedData: FeatureCollection | null = null

/**
 * Load and normalize the Natural Earth 110m country boundaries GeoJSON.
 * Each feature's `id` is set to ISO_A3 (with ADM0_A3 fallback),
 * and a `pattern` property is added (empty string = unlit).
 * Result is cached after first load.
 */
export async function loadBoundaryData(): Promise<FeatureCollection> {
  if (cachedData)
    return cachedData

  const resp = await fetch('/geo/ne_110m_admin_0_countries.geojson')
  if (!resp.ok)
    throw new Error(`Failed to load boundary data: ${resp.status}`)

  const data: FeatureCollection = await resp.json()

  for (const feature of data.features) {
    const props = feature.properties ?? {}
    const regionId = props.ISO_A3 && props.ISO_A3 !== '-99'
      ? props.ISO_A3
      : props.ADM0_A3 ?? 'UNKNOWN'
    feature.id = regionId
    feature.properties = { ...props, pattern: '' }
  }

  cachedData = data
  return data
}
