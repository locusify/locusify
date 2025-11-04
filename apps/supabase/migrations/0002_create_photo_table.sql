-- 创建 photo 表(照片表)
-- 存储用户上传的照片及核心元数据,遵循最小必要原则
CREATE TABLE IF NOT EXISTS photo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 存储信息(必需)
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'photos',
  file_name TEXT NOT NULL,

  -- 核心地理位置信息(轨迹播放必需)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  -- 拍摄时间(轨迹播放排序必需)
  taken_at TIMESTAMPTZ,

  -- 扩展元数据(可选,使用 JSONB 存储未来可能需要的其他 EXIF 数据)
  -- 例如: {"camera_model": "iPhone 15", "iso": 100, "orientation": 1}
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引以优化查询性能
-- 原则：最小化索引，只为高频查询和 RLS 策略创建

-- 1. 用户ID索引（RLS策略每次查询都会过滤 user_id）
CREATE INDEX idx_photo_user_id ON photo(user_id);


-- 添加表注释
COMMENT ON TABLE photo IS '照片表:存储用户上传的照片及核心元数据(最小必要原则)';

-- 添加列注释
COMMENT ON COLUMN photo.id IS '照片唯一标识符';
COMMENT ON COLUMN photo.user_id IS '用户ID';
COMMENT ON COLUMN photo.storage_path IS '存储路径 bucket/filename.extension';
COMMENT ON COLUMN photo.storage_bucket IS '存储桶名称';
COMMENT ON COLUMN photo.file_name IS '文件名 filename.extension';
COMMENT ON COLUMN photo.latitude IS '纬度';
COMMENT ON COLUMN photo.longitude IS '经度';
COMMENT ON COLUMN photo.taken_at IS '拍摄时间';
COMMENT ON COLUMN photo.metadata IS '扩展元数据(JSONB格式,存储其他EXIF数据)';
COMMENT ON COLUMN photo.created_at IS '创建时间';
