import type { BrowserAdapter } from './browser/types'
import type { CameraAdapter } from './camera/types'
import type { GeolocationAdapter } from './geolocation/types'
import type { HapticsAdapter } from './haptics/types'
import type { ShareAdapter } from './share/types'
import type { StatusBarAdapter } from './status-bar/types'
import type { StorageAdapter } from './storage/types'

let storage: StorageAdapter | null = null
let camera: CameraAdapter | null = null
let geolocation: GeolocationAdapter | null = null
let share: ShareAdapter | null = null
let haptics: HapticsAdapter | null = null
let browser: BrowserAdapter | null = null
let statusBar: StatusBarAdapter | null = null

export function registerStorage(adapter: StorageAdapter) {
  storage = adapter
}
export function registerCamera(adapter: CameraAdapter) {
  camera = adapter
}
export function registerGeolocation(adapter: GeolocationAdapter) {
  geolocation = adapter
}
export function registerShare(adapter: ShareAdapter) {
  share = adapter
}
export function registerHaptics(adapter: HapticsAdapter) {
  haptics = adapter
}
export function registerBrowser(adapter: BrowserAdapter) {
  browser = adapter
}
export function registerStatusBar(adapter: StatusBarAdapter) {
  statusBar = adapter
}

export function getStorage(): StorageAdapter {
  if (!storage)
    throw new Error('Storage adapter not initialized. Call initPlatform() first.')
  return storage
}

export function getCamera(): CameraAdapter {
  if (!camera)
    throw new Error('Camera adapter not initialized. Call initPlatform() first.')
  return camera
}

export function getGeolocation(): GeolocationAdapter {
  if (!geolocation)
    throw new Error('Geolocation adapter not initialized. Call initPlatform() first.')
  return geolocation
}

export function getShare(): ShareAdapter {
  if (!share)
    throw new Error('Share adapter not initialized. Call initPlatform() first.')
  return share
}

export function getHaptics(): HapticsAdapter {
  if (!haptics)
    throw new Error('Haptics adapter not initialized. Call initPlatform() first.')
  return haptics
}

export function getBrowser(): BrowserAdapter {
  if (!browser)
    throw new Error('Browser adapter not initialized. Call initPlatform() first.')
  return browser
}

export function getStatusBar(): StatusBarAdapter {
  if (!statusBar)
    throw new Error('StatusBar adapter not initialized. Call initPlatform() first.')
  return statusBar
}
