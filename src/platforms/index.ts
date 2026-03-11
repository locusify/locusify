// Types
export type { BrowserAdapter } from './browser/types'

export type { CameraAdapter, PhotoResult } from './camera/types'

// Deep links
export { onDeepLink } from './deep-link'

export type { GeolocationAdapter, GeolocationOptions, Position } from './geolocation/types'

export type { HapticsAdapter, ImpactStyle } from './haptics/types'
// Initialization
export { initPlatform } from './init'
// Platform detection
export { getPlatform, isAndroid, isIOS, isNative, isWeb } from './platform'
// Adapter accessors
export {
  getBrowser,
  getCamera,
  getGeolocation,
  getHaptics,
  getShare,
  getStatusBar,
  getStorage,
} from './registry'
export type { ShareAdapter, ShareOptions } from './share/types'
export type { StatusBarAdapter, StatusBarStyle } from './status-bar/types'
export type { StorageAdapter } from './storage/types'
