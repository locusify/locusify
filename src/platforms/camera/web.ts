import type { CameraAdapter, PhotoResult } from './types'

export class WebCamera implements CameraAdapter {
  pickPhotos(): Promise<PhotoResult[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = true
      input.onchange = () => {
        const files = input.files
        if (!files || files.length === 0) {
          resolve([])
          return
        }
        const results: PhotoResult[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          results.push({ file, webPath: URL.createObjectURL(file) })
        }
        resolve(results)
      }
      input.click()
    })
  }
}
