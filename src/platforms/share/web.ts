import type { ShareAdapter, ShareOptions } from './types'

export class WebShare implements ShareAdapter {
  async share(options: ShareOptions): Promise<void> {
    if (navigator.share) {
      await navigator.share(options)
    }
    else if (options.url) {
      await navigator.clipboard.writeText(options.url)
    }
  }
}
