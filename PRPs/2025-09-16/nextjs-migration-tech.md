# Next.js 技术迁移计划

**项目:** Locusify MVP - Next.js 技术栈迁移
**创建日期:** 2025-10-08
**迁移原因:** 便于个人开发，更好的 SSR/SSG 支持，生态系统成熟

---

## 🎯 迁移目标

### 核心目标
- 从 React 18 + Vite 迁移到 Next.js 15 (App Router)
- 保持现有功能和设计系统
- 提升开发体验和部署便利性
- 优化 SEO 和页面加载性能

### 技术收益
- **更好的 SSR/SSG 支持** - 提升 SEO 和首屏加载
- **内置优化功能** - 图片优化、代码分割、字体优化
- **便于部署** - Vercel 一键部署
- **更好的开发体验** - 零配置、热重载
- **服务端能力** - API Routes 处理后端逻辑

---

## 📊 现状分析

### 当前技术栈
```
React 18 + Vite + TypeScript
├── Tailwind CSS V4 - UI 框架
├── Radix UI - 组件库
├── Zustand - 状态管理
├── TanStack Query - 数据获取
├── React Router 7 - 路由管理
├── i18next - 国际化
└── Supabase - 后端服务
```

### 迁移后技术栈
```
Next.js 15 (App Router) + TypeScript
├── Tailwind CSS V4 - UI 框架 (保持)
├── Radix UI - 组件库 (保持)
├── Zustand - 状态管理 (保持)
├── TanStack Query - 数据获取 (保持)
├── Next.js Router - 路由管理 (替换)
├── next-intl - 国际化 (替换)
└── Supabase - 后端服务 (保持)
```

---

## 🔄 迁移策略

### 阶段 1: 项目结构迁移 (1 周)
- [ ] 创建新的 Next.js 项目结构
- [ ] 迁移 `src/` 目录到 `app/` 目录 (App Router)
- [ ] 配置 TypeScript 和 ESLint
- [ ] 迁移 Tailwind CSS 配置

### 阶段 2: 路由系统迁移 (1 周)
- [ ] 将 React Router 路由转换为 App Router
- [ ] 迁移页面组件到 `page.tsx` 文件
- [ ] 处理动态路由和嵌套路由
- [ ] 配置布局组件 (`layout.tsx`)

### 阶段 3: 国际化迁移 (3 天)
- [ ] 从 i18next 迁移到 next-intl
- [ ] 更新语言配置和翻译文件
- [ ] 适配 App Router 的国际化模式

### 阶段 4: 构建和部署配置 (2 天)
- [ ] 配置 Next.js 构建优化
- [ ] 设置 Vercel 部署
- [ ] 配置环境变量
- [ ] 测试生产构建

### 阶段 5: 功能验证和优化 (3 天)
- [ ] 功能回归测试
- [ ] 性能对比分析
- [ ] SEO 优化验证
- [ ] 用户体验测试

---

## 📁 项目结构对比

### 当前结构 (Vite + React Router)
```
apps/web/
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── hooks/
│   └── styles/
├── public/
└── index.html
```

### 迁移后结构 (Next.js App Router)
```
apps/web/
├── app/
│   ├── (routes)/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── globals.css
├── public/
└── next.config.js
```

---

## ⚠️ 风险评估

### 高风险项
- **国际化迁移复杂度** - i18next → next-intl 需要重写逻辑
- **路由结构变化** - App Router 与 React Router 差异较大

### 中风险项
- **构建配置差异** - Vite → Next.js 构建系统差异
- **第三方库兼容性** - 部分库可能需要适配 SSR

### 低风险项
- **UI 组件库** - Radix UI 完全兼容
- **状态管理** - Zustand 无需修改
- **后端服务** - Supabase 客户端保持不变

---

## ⏱ 时间规划

| 阶段 | 任务 | 预估时间 | 负责人 |
|------|------|----------|--------|
| 1 | 项目结构迁移 | 7 天 | @frontend-developer |
| 2 | 路由系统迁移 | 7 天 | @frontend-developer |
| 3 | 国际化迁移 | 3 天 | @frontend-developer |
| 4 | 构建部署配置 | 2 天 | @frontend-developer |
| 5 | 功能验证优化 | 3 天 | @code-reviewer |

**总预估时间:** 22 天 (约 4-5 周)

---

## 🎯 成功标准

### 功能指标
- [ ] 所有现有功能正常运行
- [ ] 页面加载速度提升 > 20%
- [ ] SEO 评分提升 (Lighthouse)
- [ ] 构建时间保持或减少

### 开发体验指标
- [ ] 热重载速度提升
- [ ] 部署流程简化
- [ ] 开发环境启动时间 < 5秒
- [ ] TypeScript 类型检查正常

---

## 📝 迁移检查清单

### 开发环境
- [ ] Node.js 18+ 版本
- [ ] Next.js 15 安装配置
- [ ] TypeScript 配置迁移
- [ ] ESLint 配置适配

### 核心功能
- [ ] 页面路由正常
- [ ] 组件渲染正确
- [ ] 状态管理工作
- [ ] API 调用正常
- [ ] 国际化功能
- [ ] 样式系统正常

### 性能和SEO
- [ ] 页面首屏加载时间
- [ ] 图片优化效果
- [ ] 代码分割正常
- [ ] Meta 标签正确
- [ ] Sitemap 生成

---

## 💡 迁移后优势

### 开发效率提升
- **零配置开发** - 无需复杂的 Webpack/Vite 配置
- **内置优化** - 自动代码分割、图片优化
- **API Routes** - 可以在同一项目中处理后端逻辑
- **完善的开发工具** - 更好的调试体验

### 产品性能提升
- **SEO 友好** - 服务端渲染提升搜索引擎可见性
- **更快的首屏加载** - 静态生成和服务端渲染
- **更好的用户体验** - 预加载和优化策略

### 部署和维护
- **简化部署** - Vercel 零配置部署
- **更好的缓存策略** - 内置 CDN 和缓存优化
- **监控和分析** - 内置性能监控