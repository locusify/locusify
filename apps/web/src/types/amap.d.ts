/**
 * AMap (高德地图) TypeScript type definitions
 * These types provide basic support for AMap v2.0 APIs
 */

declare namespace AMap {
  /** Map instance */
  interface Map {
    /** Set map center */
    setCenter: (position: [number, number]) => void
    /** Get map center */
    getCenter: () => [number, number]
    /** Set map zoom level */
    setZoom: (zoom: number) => void
    /** Get map zoom level */
    getZoom: () => number
    /** Add overlay to map */
    add: (overlay: any) => void
    /** Remove overlay from map */
    remove: (overlay: any) => void
    /** Clear all overlays */
    clearMap: () => void
    /** Fit view to show all overlays */
    setFitView: (overlays?: any[]) => void
  }

  /** Marker icon configuration */
  interface IconConfig {
    type: 'image'
    image: string
    size: [number, number]
    imageSize: [number, number]
  }

  /** Marker options */
  interface MarkerOptions {
    position: [number, number]
    icon?: IconConfig
    anchor?: string
    offset?: [number, number]
    title?: string
    label?: any
  }

  /** Marker instance */
  interface Marker {
    setPosition: (position: [number, number]) => void
    getPosition: () => [number, number]
    setIcon: (icon: IconConfig) => void
    moveTo: (position: [number, number], speed?: number) => void
    moveAlong: (path: [number, number][], speed?: number) => void
  }

  /** Polyline options */
  interface PolylineOptions {
    path: [number, number][]
    strokeColor?: string
    strokeWeight?: number
    strokeOpacity?: number
    strokeStyle?: string
  }

  /** Polyline instance */
  interface Polyline {
    setPath: (path: [number, number][]) => void
    getPath: () => [number, number][]
  }
}

export {}
