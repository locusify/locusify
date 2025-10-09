# Locusify Edge Functions Architecture

**Document Type:** Technical Architecture Design
**Created:** January 9, 2025
**Author:** @frontend-developer
**Status:** Design Phase

---

## 📋 Overview

本文档介绍 Locusify 项目中使用 Supabase Edge Functions 的架构设计，以及如何与 React + Vite 前端集成。

### Technology Stack
- **Frontend:** React 19 + Vite + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Edge Functions:** Deno Runtime (TypeScript)
- **Deployment:** Supabase Global Edge Network

---

## 🌐 什么是 Supabase Edge Functions?

### 核心概念

**Supabase Edge Functions** 是运行在全球边缘网络上的 **服务端 TypeScript 函数**，基于 Deno 运行时构建。

#### 关键特性

1. **全球分布式部署** 🌍
   - 函数部署到全球边缘节点
   - 自动路由到距离用户最近的节点
   - 极低延迟响应（通常 < 50ms）

2. **TypeScript-First** 📝
   - 使用 TypeScript/JavaScript 编写
   - Deno 原生支持 TypeScript（无需编译）
   - 完整的类型安全

3. **安全优先** 🔒
   - Deno 沙箱环境
   - 细粒度权限控制
   - 自动 HTTPS

4. **无服务器架构** ⚡
   - 按需执行，自动扩展
   - 无需管理服务器
   - 按使用量计费

5. **与 Supabase 深度集成** 🔗
   - 直接访问 Supabase Auth
   - 无缝连接 PostgreSQL 数据库
   - 访问 Storage API

---

## 🏗️ Edge Functions 架构流程

### 请求处理流程

```
用户请求
    ↓
Edge Gateway (身份验证/策略检查)
    ↓
Edge Runtime (Deno) - 执行函数
    ↓
    ├─→ Supabase Auth (用户认证)
    ├─→ PostgreSQL (数据库查询)
    ├─→ Storage (文件存储)
    └─→ Third-party APIs (外部服务)
    ↓
返回响应给用户
```

### 架构图

```
┌─────────────────┐
│  React + Vite   │
│   Frontend      │
└────────┬────────┘
         │ HTTP/Fetch
         ↓
┌─────────────────────────────────────┐
│     Supabase Edge Gateway           │
│  (Authentication & Authorization)   │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│    Edge Function (Deno Runtime)     │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  Your TypeScript Function    │  │
│  │                              │  │
│  │  - Business Logic            │  │
│  │  - Data Processing           │  │
│  │  - External API Calls        │  │
│  └─────────────────────────────┘  │
└────┬──────────┬──────────┬─────────┘
     │          │          │
     ↓          ↓          ↓
┌─────────┐ ┌──────┐ ┌──────────┐
│ Auth    │ │  DB  │ │ Storage  │
└─────────┘ └──────┘ └──────────┘
```

---

## 🎯 Edge Functions vs 其他方案对比

### 1. Edge Functions vs 客户端直接调用

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **客户端直接调用 Supabase** | - 简单快速<br>- 无需额外配置<br>- 实时更新 | - 暴露 API keys<br>- 有限的业务逻辑<br>- 无法调用第三方 API | 简单的 CRUD 操作 |
| **Edge Functions** | - 隐藏 API keys<br>- 复杂业务逻辑<br>- 调用第三方服务<br>- 服务端验证 | - 额外延迟（极小）<br>- 需要部署管理 | 复杂业务逻辑、第三方集成 |

### 2. Edge Functions vs 传统后端服务

| 特性 | Edge Functions | 传统 Node.js/Express |
|------|----------------|---------------------|
| **部署复杂度** | ⭐⭐⭐⭐⭐ 一键部署 | ⭐⭐ 需要服务器管理 |
| **全球分布** | ✅ 自动全球部署 | ❌ 需要 CDN 配置 |
| **冷启动** | ⚡ < 50ms | 🐌 1-5s |
| **成本** | 💰 按使用量 | 💰💰 固定服务器成本 |
| **扩展性** | ✅ 自动扩展 | 需要手动配置 |
| **开发体验** | TypeScript-first | 需要配置 |

---

## 📦 Locusify 中的 Edge Functions 使用场景

### 1. 用户认证增强 🔐

**场景**: 处理复杂的认证逻辑

```typescript
// supabase/functions/auth-handler/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { action, email, provider } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  switch (action) {
    case 'verify-email':
      // 自定义邮箱验证逻辑
      // 检查邮箱域名、黑名单等
      break;

    case 'oauth-callback':
      // 处理 OAuth 回调
      // 创建用户记录、绑定 OAuth 账号
      break;

    case 'send-verification':
      // 发送自定义验证邮件
      break;
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
});
```

### 2. 照片处理与路线生成 📸

**场景**: 处理用户上传的照片，提取 EXIF 数据，生成路线图

```typescript
// supabase/functions/process-photos/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PhotoMetadata {
  latitude: number;
  longitude: number;
  timestamp: string;
  filename: string;
}

serve(async (req) => {
  const { photoUrls, userId } = await req.json();

  // 1. 从 Storage 下载照片
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const photoMetadata: PhotoMetadata[] = [];

  for (const url of photoUrls) {
    // 2. 提取 EXIF 数据（GPS、时间戳）
    const exifData = await extractExifData(url);

    if (exifData.latitude && exifData.longitude) {
      photoMetadata.push({
        latitude: exifData.latitude,
        longitude: exifData.longitude,
        timestamp: exifData.timestamp,
        filename: url
      });
    }
  }

  // 3. 按时间排序
  photoMetadata.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 4. 生成路线数据
  const route = {
    userId,
    points: photoMetadata.map(p => ({
      lat: p.latitude,
      lng: p.longitude,
      timestamp: p.timestamp,
      photo: p.filename
    })),
    totalDistance: calculateTotalDistance(photoMetadata),
    createdAt: new Date().toISOString()
  };

  // 5. 保存到数据库
  const { data, error } = await supabase
    .from('routes')
    .insert(route);

  return new Response(JSON.stringify({ route, photoMetadata }), {
    headers: { "Content-Type": "application/json" }
  });
});

async function extractExifData(photoUrl: string) {
  // EXIF 提取逻辑
  // 使用 exif-js 或类似库
  return {
    latitude: 0,
    longitude: 0,
    timestamp: new Date().toISOString()
  };
}

function calculateTotalDistance(points: PhotoMetadata[]): number {
  // Haversine 公式计算总距离
  return 0;
}
```

### 3. Vlog 视频生成 🎥

**场景**: 调用第三方 AI 服务生成 vlog 视频

```typescript
// supabase/functions/generate-vlog/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { routeId, userId, photos, music } = await req.json();

  // 1. 调用 AI 视频生成服务（如 Runway ML, Stability AI）
  const videoGenerationResponse = await fetch('https://api.runwayml.com/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RUNWAY_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      photos,
      music,
      transitions: 'smooth',
      duration: 'auto'
    })
  });

  const { videoUrl, jobId } = await videoGenerationResponse.json();

  // 2. 保存生成任务到数据库
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  await supabase
    .from('vlog_jobs')
    .insert({
      user_id: userId,
      route_id: routeId,
      job_id: jobId,
      status: 'processing',
      video_url: videoUrl
    });

  return new Response(JSON.stringify({
    jobId,
    status: 'processing',
    estimatedTime: '2-5 minutes'
  }), {
    headers: { "Content-Type": "application/json" }
  });
});
```

### 4. Webhook 处理 🔔

**场景**: 接收第三方服务的 webhook（如视频生成完成通知）

```typescript
// supabase/functions/webhooks/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const signature = req.headers.get('X-Webhook-Signature');
  const body = await req.json();

  // 1. 验证 webhook 签名
  if (!verifyWebhookSignature(signature, body)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // 2. 根据事件类型处理
  switch (body.event) {
    case 'video.completed':
      // 更新 vlog 任务状态
      await supabase
        .from('vlog_jobs')
        .update({
          status: 'completed',
          video_url: body.videoUrl,
          completed_at: new Date().toISOString()
        })
        .eq('job_id', body.jobId);

      // 发送通知给用户
      await sendNotification(body.userId, 'Your vlog is ready! 🎉');
      break;

    case 'video.failed':
      await supabase
        .from('vlog_jobs')
        .update({ status: 'failed', error: body.error })
        .eq('job_id', body.jobId);
      break;
  }

  return new Response('OK', { status: 200 });
});

function verifyWebhookSignature(signature: string | null, body: any): boolean {
  // 实现签名验证逻辑
  return true;
}

async function sendNotification(userId: string, message: string) {
  // 发送推送通知或邮件
}
```

### 5. 地图服务集成 🗺️

**场景**: 调用 Google Maps API 或其他地图服务

```typescript
// supabase/functions/geocoding/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { latitude, longitude } = await req.json();

  // 反向地理编码：经纬度 → 地址
  const geocodingResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Deno.env.get('GOOGLE_MAPS_API_KEY')}`
  );

  const data = await geocodingResponse.json();

  return new Response(JSON.stringify({
    address: data.results[0]?.formatted_address,
    city: extractCity(data.results[0]),
    country: extractCountry(data.results[0])
  }), {
    headers: { "Content-Type": "application/json" }
  });
});

function extractCity(result: any): string {
  // 从结果中提取城市名
  return result?.address_components.find(
    (c: any) => c.types.includes('locality')
  )?.long_name || '';
}

function extractCountry(result: any): string {
  return result?.address_components.find(
    (c: any) => c.types.includes('country')
  )?.long_name || '';
}
```

---

## 🛠️ 开发工作流

### 1. 本地开发

#### 安装 Supabase CLI

```bash
# 使用 npm
npm install -g supabase

# 或使用 homebrew (macOS)
brew install supabase/tap/supabase
```

#### 初始化项目

```bash
# 在项目根目录
supabase init

# 创建新的 Edge Function
supabase functions new my-function
```

#### 本地运行

```bash
# 启动本地 Supabase（包括 Edge Functions）
supabase start

# 单独运行某个函数
supabase functions serve my-function

# 使用 --env-file 加载环境变量
supabase functions serve --env-file .env.local
```

#### 测试函数

```bash
# 使用 curl 测试
curl -i --location --request POST 'http://localhost:54321/functions/v1/my-function' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

### 2. 部署流程

#### 部署到 Supabase

```bash
# 部署单个函数
supabase functions deploy my-function

# 部署所有函数
supabase functions deploy

# 设置环境变量（secrets）
supabase secrets set GOOGLE_MAPS_API_KEY=your_api_key
supabase secrets set RUNWAY_API_KEY=your_api_key
```

#### CI/CD 集成

```yaml
# .github/workflows/deploy-edge-functions.yml

name: Deploy Edge Functions

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Deploy functions
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### 3. 项目结构

```
locusify/
├── apps/
│   └── web/                      # React + Vite 前端
│       ├── src/
│       │   ├── services/
│       │   │   └── edge.service.ts    # Edge Functions 调用封装
│       │   └── stores/
│       └── package.json
│
├── supabase/
│   ├── functions/                # Edge Functions 目录
│   │   ├── auth-handler/
│   │   │   └── index.ts
│   │   ├── process-photos/
│   │   │   └── index.ts
│   │   ├── generate-vlog/
│   │   │   └── index.ts
│   │   ├── webhooks/
│   │   │   └── index.ts
│   │   └── geocoding/
│   │       └── index.ts
│   │
│   ├── migrations/               # 数据库迁移
│   └── config.toml              # Supabase 配置
│
└── database/                     # 数据库 schema
    ├── account.sql
    ├── account_oauth.sql
    └── account_localization.sql
```

---

## 🔗 React 前端集成

### Edge Function 调用服务

```typescript
// apps/web/src/services/edge.service.ts

import { supabase } from '@/lib/supabase';

export class EdgeFunctionService {
  /**
   * 调用 Edge Function
   */
  private async invoke<T = any>(
    functionName: string,
    body?: Record<string, any>
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: body || {}
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 处理照片并生成路线
   */
  async processPhotos(photoUrls: string[], userId: string) {
    return this.invoke('process-photos', { photoUrls, userId });
  }

  /**
   * 生成 vlog 视频
   */
  async generateVlog(routeId: string, userId: string, photos: string[], music?: string) {
    return this.invoke('generate-vlog', { routeId, userId, photos, music });
  }

  /**
   * 反向地理编码
   */
  async reverseGeocode(latitude: number, longitude: number) {
    return this.invoke('geocoding', { latitude, longitude });
  }

  /**
   * 处理认证事件
   */
  async handleAuth(action: string, data: Record<string, any>) {
    return this.invoke('auth-handler', { action, ...data });
  }
}

export const edgeService = new EdgeFunctionService();
```

### React 组件中使用

```typescript
// apps/web/src/components/PhotoUploader.tsx

import { useState } from 'react';
import { edgeService } from '@/services/edge.service';

export function PhotoUploader() {
  const [processing, setProcessing] = useState(false);

  const handleUpload = async (files: File[]) => {
    setProcessing(true);

    // 1. 上传照片到 Supabase Storage
    const photoUrls = await uploadPhotosToStorage(files);

    // 2. 调用 Edge Function 处理照片
    const { data, error } = await edgeService.processPhotos(
      photoUrls,
      currentUser.id
    );

    if (error) {
      console.error('处理失败:', error);
    } else {
      console.log('路线生成成功:', data);
      // 更新 UI，显示路线
    }

    setProcessing(false);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleUpload(Array.from(e.target.files || []))}
        disabled={processing}
      />
      {processing && <p>正在处理照片...</p>}
    </div>
  );
}
```

---

## 🔐 环境变量与安全

### Secrets 管理

```bash
# 设置 secrets（生产环境）
supabase secrets set GOOGLE_MAPS_API_KEY=xxx
supabase secrets set RUNWAY_API_KEY=xxx
supabase secrets set OPENAI_API_KEY=xxx

# 查看已设置的 secrets
supabase secrets list

# 删除 secret
supabase secrets unset SECRET_NAME
```

### 本地开发环境变量

```bash
# .env.local (不要提交到 Git)

GOOGLE_MAPS_API_KEY=your_dev_key
RUNWAY_API_KEY=your_dev_key
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

### 在 Edge Function 中访问

```typescript
// 在 Edge Function 中访问环境变量
const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
```

---

## ⚡ 性能优化

### 1. 连接池优化

```typescript
// 使用连接池而非每次创建新连接
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ 好的做法：复用客户端
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false, // Edge Functions 不需要持久化
    }
  }
);
```

### 2. 响应缓存

```typescript
// 缓存常用数据
const CACHE_TTL = 60 * 60 * 1000; // 1小时
const cache = new Map<string, { data: any; timestamp: number }>();

serve(async (req) => {
  const cacheKey = req.url;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cached.data), {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT"
      }
    });
  }

  // 执行逻辑...
  const data = await fetchData();

  cache.set(cacheKey, { data, timestamp: Date.now() });

  return new Response(JSON.stringify(data));
});
```

### 3. 异步处理长时间任务

```typescript
// 对于耗时任务，立即返回 jobId，后台处理
serve(async (req) => {
  const { photos } = await req.json();

  // 立即返回 job ID
  const jobId = crypto.randomUUID();

  // 后台异步处理（不阻塞响应）
  processPhotosAsync(jobId, photos).catch(console.error);

  return new Response(JSON.stringify({
    jobId,
    status: 'queued',
    message: '任务已加入队列'
  }), {
    headers: { "Content-Type": "application/json" }
  });
});

async function processPhotosAsync(jobId: string, photos: string[]) {
  // 长时间处理逻辑
  // 完成后更新数据库或触发 webhook
}
```

---

## 🧪 测试策略

### 单元测试

```typescript
// supabase/functions/process-photos/index.test.ts

import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("calculateTotalDistance should work correctly", () => {
  const points = [
    { latitude: 0, longitude: 0 },
    { latitude: 1, longitude: 1 }
  ];

  const distance = calculateTotalDistance(points);
  assertEquals(typeof distance, 'number');
});
```

### 集成测试

```typescript
// 测试 Edge Function 端到端
Deno.test("process-photos function", async () => {
  const response = await fetch('http://localhost:54321/functions/v1/process-photos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      photoUrls: ['https://example.com/photo1.jpg'],
      userId: 'test-user-id'
    })
  });

  const data = await response.json();
  assertEquals(response.status, 200);
  assertEquals(data.success, true);
});
```

---

## 📊 监控与日志

### 日志记录

```typescript
// 使用 console.log 记录日志（自动收集到 Supabase Dashboard）
serve(async (req) => {
  console.log('Function invoked:', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers)
  });

  try {
    // 业务逻辑
    const result = await processRequest(req);

    console.log('Request processed successfully:', { result });

    return new Response(JSON.stringify(result));
  } catch (error) {
    console.error('Error processing request:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
});
```

### 在 Dashboard 查看日志

1. 登录 Supabase Dashboard
2. 进入 Edge Functions 页面
3. 选择函数 → Logs 标签
4. 实时查看日志、错误、性能指标

---

## 🚀 部署建议

### 架构决策树

```
是否需要调用第三方 API？
├─ 是 → 使用 Edge Function（隐藏 API keys）
└─ 否
    │
    是否需要复杂业务逻辑？
    ├─ 是 → 使用 Edge Function
    └─ 否
        │
        是否是简单 CRUD？
        ├─ 是 → 直接使用 Supabase Client
        └─ 否 → 评估具体需求
```

### Locusify 推荐架构

```typescript
/**
 * 推荐使用 Edge Functions 的场景
 */
const USE_EDGE_FUNCTIONS_FOR = [
  '照片 EXIF 数据提取',          // ✅ 需要后端处理
  '路线生成算法',                // ✅ 复杂计算逻辑
  'Vlog 视频生成 API 调用',      // ✅ 第三方 API
  '地理编码服务',                // ✅ Google Maps API
  'Webhook 接收',                // ✅ 需要验证签名
  '邮件发送',                    // ✅ SMTP 配置隐藏
];

/**
 * 直接使用 Supabase Client 的场景
 */
const USE_DIRECT_CLIENT_FOR = [
  '用户认证（登录/注册）',       // ✅ Supabase Auth 已优化
  '简单数据查询',                // ✅ Row Level Security
  '实时订阅',                    // ✅ Realtime 功能
  '文件上传',                    // ✅ Storage API
];
```

---

## 📚 下一步行动

### Phase 1: 环境搭建（本周）
- [ ] 安装 Supabase CLI
- [ ] 初始化 Edge Functions 项目结构
- [ ] 配置本地开发环境
- [ ] 创建第一个示例 Edge Function

### Phase 2: 核心功能实现（第 2 周）
- [ ] 实现照片处理 Edge Function
- [ ] 实现地理编码 Edge Function
- [ ] 集成 React 前端调用

### Phase 3: 高级功能（第 3 周）
- [ ] Vlog 生成 Edge Function
- [ ] Webhook 处理
- [ ] 性能优化与缓存

### Phase 4: 测试与部署（第 4 周）
- [ ] 编写单元测试和集成测试
- [ ] CI/CD 配置
- [ ] 生产环境部署
- [ ] 监控与日志配置

---

## 🔗 参考资源

- [Supabase Edge Functions 官方文档](https://supabase.com/docs/guides/functions)
- [Deno 官方文档](https://deno.land/manual)
- [Edge Functions Examples](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Supabase CLI 文档](https://supabase.com/docs/guides/cli)

---

**Status:** Ready for implementation
**Next Step:** Setup Supabase CLI and create first Edge Function
