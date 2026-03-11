import { App } from '@capacitor/app'
import { isNative } from './platform'
import { getBrowser } from './registry'

type DeepLinkHandler = (url: URL) => void

const handlers: DeepLinkHandler[] = []

export function onDeepLink(handler: DeepLinkHandler): () => void {
  handlers.push(handler)
  return () => {
    const index = handlers.indexOf(handler)
    if (index !== -1)
      handlers.splice(index, 1)
  }
}

function dispatchDeepLink(urlString: string) {
  try {
    const url = new URL(urlString)
    for (const handler of handlers) {
      handler(url)
    }
  }
  catch {
    console.warn('Invalid deep link URL:', urlString)
  }
}

export function initDeepLinks() {
  if (!isNative())
    return

  App.addListener('appUrlOpen', ({ url }) => {
    // Close in-app browser if open (e.g., after OAuth)
    getBrowser().close().catch(() => {})
    dispatchDeepLink(url)
  })
}
