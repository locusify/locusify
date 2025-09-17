# Share Service - 分享服务

分享服务是 Locusify 应用的核心组件之一，负责将生成的轨迹地图和 vlog 一键分享到主流社交媒体平台。

## 功能概述

- 一键分享到多个社交媒体平台
- 为不同平台优化内容格式
- 管理社交媒体账户授权
- 跟踪分享统计和互动数据

## 支持的平台

- Instagram
- Facebook
- Twitter/X
- TikTok
- YouTube Shorts

## 技术栈

- TypeScript
- Node.js
- 各平台 SDK/API

## 安装

```bash
pnpm install
```

## 使用方法

```typescript
// 待添加具体使用示例
```

## API 接口

### shareToPlatform(content: ShareContent, platform: SocialPlatform): Promise<ShareResult>

将内容分享到指定平台

### authenticateWithPlatform(platform: SocialPlatform, credentials: AuthCredentials): Promise<AuthResult>

与指定平台进行身份验证

### getShareStats(platform: SocialPlatform, shareId: string): Promise<ShareStats>

获取指定分享内容的统计数据

### scheduleShare(content: ShareContent, platform: SocialPlatform, time: Date): Promise<ScheduledShare>

定时分享内容

## 数据结构

### ShareContent
- title: string
- description: string
- media: string[] (图片/视频URL列表)
- location?: Coordinate
- hashtags: string[]

### SocialPlatform
- id: string
- name: string
- apiEndpoint: string
- authType: 'oauth' | 'apikey' | 'oauth2'

### ShareResult
- success: boolean
- shareId?: string
- url?: string
- error?: string

## 认证管理

- OAuth 1.0a 支持
- OAuth 2.0 支持
- API 密钥管理
- 刷新令牌处理

## 内容优化

根据不同平台特点优化内容：
- Instagram: 正方形图片，#标签优化
- Facebook: 长文本支持，位置标签
- Twitter/X: 文本长度限制，话题标签
- TikTok: 竖屏视频格式
- YouTube Shorts: 竖屏短视频优化

## 错误处理

- 平台 API 限制
- 网络连接问题
- 认证过期处理
- 内容审核拒绝
