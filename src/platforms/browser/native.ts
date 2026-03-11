import type { BrowserAdapter } from './types'
import { Browser } from '@capacitor/browser'

export class NativeBrowser implements BrowserAdapter {
  async open(url: string): Promise<void> {
    await Browser.open({ url, presentationStyle: 'popover' })
  }

  async close(): Promise<void> {
    await Browser.close()
  }
}
