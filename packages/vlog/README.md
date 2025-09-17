# Vlog Generator - Vlog 生成器

Vlog 生成器是 Locusify 应用的核心组件之一，负责将用户的照片和轨迹数据自动转换为高质量的旅行视频博客。

## 功能概述

- 按时间顺序自动排列照片
- 根据地理位置信息添加过渡效果
- 生成包含轨迹动画的视频
- 添加背景音乐和文字说明
- 导出多种格式和分辨率的视频

## 技术栈

- TypeScript
- Node.js
- 视频处理库（如 FFmpeg）
- 动画库（如 GSAP）

## 安装

```bash
pnpm install
```

## 使用方法

```typescript
// 待添加具体使用示例
```

## API 接口

### createVlog(photos: Photo[], track: Track, options: VlogOptions): Promise<Vlog>

根据照片和轨迹数据创建 vlog

### addTransitions(vlog: Vlog, transitionType: TransitionType): Promise<Vlog>

为 vlog 添加过渡效果

### addBackgroundMusic(vlog: Vlog, musicTrack: MusicTrack): Promise<Vlog>

为 vlog 添加背景音乐

### addTextOverlay(vlog: Vlog, textOptions: TextOverlayOptions): Promise<Vlog>

为 vlog 添加文字覆盖

### exportVlog(vlog: Vlog, format: VideoFormat): Promise<string>

导出 vlog 为指定格式

## 数据结构

### Vlog
- id: string
- title: string
- duration: number
- resolution: { width, height }
- photos: Photo[]
- transitions: Transition[]
- backgroundMusic?: MusicTrack
- textOverlays: TextOverlay[]

### VlogOptions
- duration: number
- style: 'fast' | 'slow' | 'cinematic'
- includeMap: boolean
- quality: 'sd' | 'hd' | 'fullhd' | '4k'

## 输出格式

支持导出以下视频格式：
- MP4
- MOV
- AVI
- GIF（动画格式）

## 性能优化

- 多线程视频处理
- 进度回调和取消支持
- 内存使用优化
