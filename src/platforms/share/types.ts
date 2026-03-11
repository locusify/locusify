export interface ShareOptions {
  title?: string
  text?: string
  url?: string
}

export interface ShareAdapter {
  share: (options: ShareOptions) => Promise<void>
}
