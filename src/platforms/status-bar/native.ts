import type { StatusBarAdapter, StatusBarStyle } from './types'
import { StatusBar, Style } from '@capacitor/status-bar'

const STYLE_MAP: Record<StatusBarStyle, Style> = {
  dark: Style.Dark,
  light: Style.Light,
  default: Style.Default,
}

export class NativeStatusBar implements StatusBarAdapter {
  async setStyle(style: StatusBarStyle): Promise<void> {
    await StatusBar.setStyle({ style: STYLE_MAP[style] })
  }

  async setOverlaysWebView(overlay: boolean): Promise<void> {
    await StatusBar.setOverlaysWebView({ overlay })
  }

  async hide(): Promise<void> {
    await StatusBar.hide()
  }

  async show(): Promise<void> {
    await StatusBar.show()
  }
}
