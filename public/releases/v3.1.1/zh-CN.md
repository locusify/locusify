# v3.1.1

> 2026-03-14

## Features

### Social Presence
- 地图上实时显示附近探索者标记，支持聚合
- 悬浮卡片展示用户状态、距离和最后在线时间
- Presence 可见性设置（可见 / 隐身 / 仅好友）
- 支持自定义状态文本

### Video Recording
- 视频录制导出支持 WebM 转 MP4，带进度条 UI
- 修复视频录制画面比例问题（Chrome Region Capture API）

### Feedback Dialog
- 新增用户反馈对话框，支持星级评分
- 反馈 UI 完整支持中英文国际化

## Bug Fixes

- 修复 authStore 与 presenceStore 之间的循环依赖
- 将地理定位 effect 与 presence 上报分离，确保登录后正确触发
- 移除地理定位 accuracy 字段上多余的空值合并操作
- 移除前端 presence settings 中后端不存在的 `updated_at` 字段
