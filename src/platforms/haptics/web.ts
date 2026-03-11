import type { HapticsAdapter, ImpactStyle } from './types'

const DURATION_MAP: Record<ImpactStyle, number> = {
  light: 10,
  medium: 20,
  heavy: 50,
}

export class WebHaptics implements HapticsAdapter {
  impact(style: ImpactStyle): void {
    navigator.vibrate?.(DURATION_MAP[style])
  }

  vibrate(): void {
    navigator.vibrate?.(50)
  }
}
