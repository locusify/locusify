# Social Presence API Specification / 社交在场功能 API 规格

> 本文档供后端同学参考实现。前端基于此规格对接。

## 1. 概述

为 Locusify 新增"社交在场"功能：用户授权位置后自动上报坐标与登录时间，并可发现附近的其他用户，在地图上展示他们的头像、状态与最后在线时间。

### 通用约定

- 所有端点挂载在 `/api/v1/presence/` 下
- 使用现有 Bearer token 认证（`Authorization: Bearer <access_token>`）
- 统一响应信封：

```json
{
  "success": true,
  "data": {},
  "error": {
    "code": "ERROR_CODE",
    "message": { "en": "English message", "zh": "中文消息" },
    "details": {}
  }
}
```

---

## 2. 数据库 Schema

### 2.1 `user_locations` — 用户位置表

每个用户仅保留一条记录（upsert）。

```sql
CREATE TABLE user_locations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude      double precision NOT NULL,
  longitude     double precision NOT NULL,
  accuracy      double precision,          -- GPS 精度，单位：米
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT user_locations_user_id_key UNIQUE (user_id)
);

-- 空间索引（推荐 PostGIS，如不可用则使用 B-tree 索引 + 应用层过滤）
-- 方案 A: PostGIS
CREATE INDEX idx_user_locations_geo
  ON user_locations
  USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- 方案 B: B-tree（无 PostGIS 时）
CREATE INDEX idx_user_locations_lat ON user_locations (latitude);
CREATE INDEX idx_user_locations_lng ON user_locations (longitude);

-- 自动更新 updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_locations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
```

### 2.2 `user_presence_settings` — 在场设置表

```sql
CREATE TABLE user_presence_settings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visibility    text NOT NULL DEFAULT 'visible'
                CHECK (visibility IN ('visible', 'invisible', 'friends_only')),
  status_text   text CHECK (char_length(status_text) <= 100),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT user_presence_settings_user_id_key UNIQUE (user_id)
);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_presence_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

ALTER TABLE user_presence_settings ENABLE ROW LEVEL SECURITY;
```

---

## 3. API 端点

### 3.1 `POST /api/v1/presence/location` — 上报用户位置

用户打开应用 / 点击"定位我"时调用。

#### Request

```json
{
  "latitude": 35.6762,
  "longitude": 139.6503,
  "accuracy": 12.5
}
```

| 字段 | 类型 | 必填 | 校验 |
|---|---|---|---|
| `latitude` | `number` | ✅ | -90 ~ 90 |
| `longitude` | `number` | ✅ | -180 ~ 180 |
| `accuracy` | `number` | ❌ | >= 0，单位：米 |

#### Response — 200

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "latitude": 35.6762,
    "longitude": 139.6503,
    "accuracy": 12.5,
    "last_seen_at": "2026-03-14T10:30:00Z"
  }
}
```

#### 后端逻辑

1. 从 JWT 获取 `user_id`
2. Upsert `user_locations`（以 `user_id` 为键），设 `last_seen_at = now()`
3. 即使用户设为 `invisible`，仍存储位置（用于自身功能），但在附近查询中排除

#### 错误码

| code | HTTP | message.en |
|---|---|---|
| `UNAUTHORIZED` | 401 | Session expired |
| `VALIDATION_ERROR` | 422 | Invalid coordinates |

#### 限流

每用户每分钟 1 次（超出返回 429）。

---

### 3.2 `GET /api/v1/presence/nearby` — 查询附近用户

#### Query Parameters

| 参数 | 类型 | 必填 | 默认值 | 校验 |
|---|---|---|---|---|
| `latitude` | `number` | ✅ | — | -90 ~ 90 |
| `longitude` | `number` | ✅ | — | -180 ~ 180 |
| `radius` | `number` | ❌ | 50 | 1 ~ 500（km） |
| `limit` | `number` | ❌ | 50 | 1 ~ 100 |

#### Response — 200

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "display_name": "Alice",
        "avatar_url": "https://avatars.example.com/alice.jpg",
        "latitude": 35.6800,
        "longitude": 139.6550,
        "distance_km": 0.42,
        "last_seen_at": "2026-03-14T10:25:00Z",
        "status_text": "Exploring Tokyo!",
        "online_status": "online"
      }
    ],
    "total": 1,
    "radius_km": 50,
    "center": {
      "latitude": 35.6762,
      "longitude": 139.6503
    }
  }
}
```

#### `online_status` 推导规则（服务端计算）

| `last_seen_at` 距今 | `online_status` |
|---|---|
| < 5 分钟 | `"online"` |
| 5 分钟 ~ 1 小时 | `"recently_active"` |
| 1 小时 ~ 24 小时 | `"away"` |
| > 24 小时 | `"offline"` |

#### 后端逻辑

1. 排除请求者自己（`user_id != current_user_id`）
2. 排除 `visibility = 'invisible'` 的用户（JOIN `user_presence_settings`）
3. 排除 `last_seen_at` 超过 30 天的用户（过期数据清理）
4. 空间查询：
   - **PostGIS**: `ST_DWithin(geography, ST_MakePoint(lng, lat)::geography, radius_meters)` + `ORDER BY ST_Distance`
   - **无 PostGIS**: 先用 bounding box 过滤（`latitude BETWEEN lat-delta AND lat+delta`），再应用层 Haversine 计算
5. 计算 `distance_km` 并包含在响应中
6. 按距离升序排列，限制返回数量

#### 错误码

| code | HTTP | message.en |
|---|---|---|
| `UNAUTHORIZED` | 401 | Session expired |
| `VALIDATION_ERROR` | 422 | Invalid query parameters |

#### 限流

每用户每分钟 10 次。

---

### 3.3 `GET /api/v1/presence/settings` — 获取在场设置

#### Response — 200

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "visibility": "visible",
    "status_text": "Exploring Tokyo!",
    "updated_at": "2026-03-14T10:30:00Z"
  }
}
```

若用户无设置记录，返回默认值：

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "visibility": "visible",
    "status_text": null,
    "updated_at": null
  }
}
```

---

### 3.4 `PATCH /api/v1/presence/settings` — 更新在场设置

#### Request

```json
{
  "visibility": "visible",
  "status_text": "Exploring Tokyo!"
}
```

| 字段 | 类型 | 必填 | 校验 |
|---|---|---|---|
| `visibility` | `string` | ❌ | `"visible"` / `"invisible"` / `"friends_only"` |
| `status_text` | `string \| null` | ❌ | 最大 100 字符，传 `null` 清除 |

#### Response — 200

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "visibility": "visible",
    "status_text": "Exploring Tokyo!",
    "updated_at": "2026-03-14T10:30:00Z"
  }
}
```

#### 后端逻辑

Upsert `user_presence_settings`（以 `user_id` 为键），仅更新请求中提供的字段。

#### 错误码

| code | HTTP | message.en |
|---|---|---|
| `UNAUTHORIZED` | 401 | Session expired |
| `VALIDATION_ERROR` | 422 | Invalid visibility value or status_text too long |

---

## 4. 注意事项

### 隐私与安全

- `invisible` 用户不会出现在任何人的附近查询结果中（服务端强制执行）
- `friends_only` 暂时等效 `invisible`（未来实现好友系统后启用）
- 位置精度建议保留到小数点后 4 位（约 11 米精度），不宜过于精确
- 建议添加 RLS 策略：用户只能读写自己的 `user_locations` 和 `user_presence_settings`

### 性能与扩展

- 初期用户量小，bounding box + Haversine 足够；用户量增长后建议迁移到 PostGIS `ST_DWithin`
- 建议定期清理 `last_seen_at` 超过 90 天的 `user_locations` 记录
- 附近查询结果可考虑 Redis 缓存（TTL 1~5 分钟），按区域网格分桶

### 数据清理

- 用户删除账户时，级联删除 `user_locations` 和 `user_presence_settings`（已通过 `ON DELETE CASCADE` 实现）
