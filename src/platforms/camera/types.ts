export interface PhotoResult {
  file: File
  webPath: string
}

export interface CameraAdapter {
  pickPhotos: () => Promise<PhotoResult[]>
}
