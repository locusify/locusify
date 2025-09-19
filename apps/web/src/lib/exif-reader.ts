import { readFileSync } from 'node:fs'
import exifReader from 'exif-reader'

const buffer = readFileSync('./image.jpg')

// 从图像文件中提取 EXIF 数据
const exifData = exifReader(buffer)

// 访问特定的 EXIF 信息
if (exifData) {
  console.log('图像信息:', exifData.Image)
  console.log('照片信息:', exifData.Photo)
  console.log('GPS 信息:', exifData.GPSInfo)
  console.log('缩略图信息:', exifData.ThumbnailTags)
  console.log('大端字节序:', exifData.bigEndian)
  console.log('Iop信息:', exifData.Iop)
}
