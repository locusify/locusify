import type { TransportMode } from '@/types/replay'

/** Mingcute icon class for each transport mode. */
export const transportModeIcons: Record<TransportMode, string> = {
  walking: 'i-mingcute-walk-line',
  cycling: 'i-mingcute-bike-line',
  driving: 'i-mingcute-car-line',
  train: 'i-mingcute-train-line',
  flying: 'i-mingcute-airplane-line',
  unknown: 'i-mingcute-location-line',
}
