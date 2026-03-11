export type StatusBarStyle = 'dark' | 'light' | 'default'

export interface StatusBarAdapter {
  setStyle: (style: StatusBarStyle) => Promise<void>
  setOverlaysWebView: (overlay: boolean) => Promise<void>
  hide: () => Promise<void>
  show: () => Promise<void>
}
