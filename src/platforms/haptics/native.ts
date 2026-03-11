import type { HapticsAdapter, ImpactStyle } from './types'
import { ImpactStyle as CapImpactStyle, Haptics } from '@capacitor/haptics'

const STYLE_MAP: Record<ImpactStyle, CapImpactStyle> = {
  light: CapImpactStyle.Light,
  medium: CapImpactStyle.Medium,
  heavy: CapImpactStyle.Heavy,
}

export class NativeHaptics implements HapticsAdapter {
  impact(style: ImpactStyle): void {
    Haptics.impact({ style: STYLE_MAP[style] })
  }

  vibrate(): void {
    Haptics.vibrate()
  }
}
