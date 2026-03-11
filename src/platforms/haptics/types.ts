export type ImpactStyle = 'light' | 'medium' | 'heavy'

export interface HapticsAdapter {
  impact: (style: ImpactStyle) => void
  vibrate: () => void
}
