import { SplashScreen } from '@capacitor/splash-screen'
import { initDeepLinks } from './deep-link'
import { isNative } from './platform'
import {
  registerBrowser,
  registerCamera,
  registerGeolocation,
  registerHaptics,
  registerShare,
  registerStatusBar,
  registerStorage,
} from './registry'

export async function initPlatform() {
  if (isNative()) {
    // Native adapters
    const { NativeStorage } = await import('./storage/native')
    const { NativeCamera } = await import('./camera/native')
    const { NativeGeolocation } = await import('./geolocation/native')
    const { NativeShare } = await import('./share/native')
    const { NativeHaptics } = await import('./haptics/native')
    const { NativeBrowser } = await import('./browser/native')
    const { NativeStatusBar } = await import('./status-bar/native')

    registerStorage(new NativeStorage())
    registerCamera(new NativeCamera())
    registerGeolocation(new NativeGeolocation())
    registerShare(new NativeShare())
    registerHaptics(new NativeHaptics())
    registerBrowser(new NativeBrowser())
    registerStatusBar(new NativeStatusBar())

    // Configure status bar for dark theme overlay
    const statusBar = new NativeStatusBar()
    await statusBar.setStyle('light')
    await statusBar.setOverlaysWebView(true)

    // Initialize deep link handling
    initDeepLinks()

    // Hide splash screen (was kept visible via launchAutoHide: false)
    await SplashScreen.hide()
  }
  else {
    // Web adapters
    const { WebStorage } = await import('./storage/web')
    const { WebCamera } = await import('./camera/web')
    const { WebGeolocation } = await import('./geolocation/web')
    const { WebShare } = await import('./share/web')
    const { WebHaptics } = await import('./haptics/web')
    const { WebBrowser } = await import('./browser/web')
    const { WebStatusBar } = await import('./status-bar/web')

    registerStorage(new WebStorage())
    registerCamera(new WebCamera())
    registerGeolocation(new WebGeolocation())
    registerShare(new WebShare())
    registerHaptics(new WebHaptics())
    registerBrowser(new WebBrowser())
    registerStatusBar(new WebStatusBar())
  }
}
