export interface BrowserAdapter {
  open: (url: string) => Promise<void>
  close: () => Promise<void>
}
