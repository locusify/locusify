import type { ShareAdapter, ShareOptions } from './types'
import { Share } from '@capacitor/share'

export class NativeShare implements ShareAdapter {
  async share(options: ShareOptions): Promise<void> {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
    })
  }
}
