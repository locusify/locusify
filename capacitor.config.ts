import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.caterpi11ar.locusify',
  appName: 'Locusify',
  webDir: 'dist',
  plugins: {
    SplashScreen: { launchAutoHide: false },
  },
  ios: { scheme: 'locusify' },
  android: { path: 'android' },
}

export default config
