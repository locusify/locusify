import type { CameraAdapter, PhotoResult } from './types'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export class NativeCamera implements CameraAdapter {
  async pickPhotos(): Promise<PhotoResult[]> {
    const result = await Camera.pickImages({
      quality: 100,
      presentationStyle: 'fullscreen',
    })

    const results: PhotoResult[] = []
    for (const photo of result.photos) {
      if (!photo.webPath)
        continue

      // Fetch the file from the webPath to get a File object
      const response = await fetch(photo.webPath)
      const blob = await response.blob()
      const fileName = `photo-${Date.now()}-${results.length}.${photo.format || 'jpeg'}`
      const file = new File([blob], fileName, {
        type: `image/${photo.format || 'jpeg'}`,
      })

      results.push({ file, webPath: photo.webPath })
    }

    return results
  }

  async takePhoto(): Promise<PhotoResult | null> {
    const photo = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    })

    if (!photo.webPath)
      return null

    const response = await fetch(photo.webPath)
    const blob = await response.blob()
    const fileName = `photo-${Date.now()}.${photo.format || 'jpeg'}`
    const file = new File([blob], fileName, {
      type: `image/${photo.format || 'jpeg'}`,
    })

    return { file, webPath: photo.webPath }
  }
}
