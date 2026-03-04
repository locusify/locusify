export type TransportMode = 'walking' | 'cycling' | 'driving' | 'train' | 'flying' | 'unknown'

export type AvatarSource
  = | { type: 'profile' }
    | { type: 'preset', presetId: string }
    | { type: 'none' }

export interface SegmentMeta {
  fromIndex: number
  toIndex: number
  distanceKm: number
  timeDeltaMs: number
  mode: TransportMode
}
