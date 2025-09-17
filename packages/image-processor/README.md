# Image Processor - 图片处理器

图片处理器是 Locusify 应用的核心组件之一，专门负责处理提取和补充图片的元信息。

## 功能概述

- 从图片中提取元数据（GPS 坐标、时间戳、相机信息等）
- 补充或修正图片元信息
- 标准化不同来源图片的元数据格式
- 为其他服务提供统一的图片信息接口

## 技术栈

- TypeScript
- Node.js
- EXIF 解析库（如 exifreader 或 piexifjs）

## 支持的图片格式

- JPEG/JPG
- PNG
- HEIC

## 安装

```bash
pnpm install
```

## 使用方法

```typescript
// 待添加具体使用示例
```

## API 接口

### extractMetadata(imagePath: string): Promise<ImageMetadata>

从指定图片路径中提取所有可用的元数据

### extractMetadataFromBuffer(buffer: Buffer): Promise<ImageMetadata>

从图片 Buffer 中提取元数据

### augmentMetadata(metadata: ImageMetadata, additionalData: Partial<ImageMetadata>): Promise<ImageMetadata>

补充或更新元数据信息

### validateMetadata(metadata: ImageMetadata): Promise<boolean>

验证元数据的完整性和有效性

## 数据结构

### ImageMetadata
- gps: { latitude, longitude }
- timestamp: Date
- cameraInfo: { make, model, software }
- dimensions: { width, height }
- orientation: number
- fileSize: number

## 错误处理

- 图片格式不支持
- 元数据不存在或损坏
- 文件读取错误
