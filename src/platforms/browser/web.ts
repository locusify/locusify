import type { BrowserAdapter } from './types'

export class WebBrowser implements BrowserAdapter {
  async open(url: string): Promise<void> {
    window.location.href = url
  }

  async close(): Promise<void> {
    // No-op on web
  }
}
