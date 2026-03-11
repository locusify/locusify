import type { StatusBarAdapter, StatusBarStyle } from './types'

export class WebStatusBar implements StatusBarAdapter {
  async setStyle(_style: StatusBarStyle): Promise<void> { /* no-op */ }
  async setOverlaysWebView(_overlay: boolean): Promise<void> { /* no-op */ }
  async hide(): Promise<void> { /* no-op */ }
  async show(): Promise<void> { /* no-op */ }
}
