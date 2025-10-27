-- 创建 photo 表(照片表)
-- 存储用户上传的照片及核心元数据,遵循最小必要原则
CREATE TABLE IF NOT EXISTS photo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES journey(id) ON DELETE CASCADE,
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

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX idx_photo_journey_id ON photo(journey_id);
CREATE INDEX idx_photo_user_id ON photo(user_id);
CREATE INDEX idx_photo_taken_at ON photo(taken_at);
CREATE INDEX idx_photo_location ON photo(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 为 photo 表添加触发器
CREATE TRIGGER update_photo_updated_at
  BEFORE UPDATE ON photo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建更新 journey 照片计数的触发器函数
CREATE OR REPLACE FUNCTION update_journey_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE journey
    SET photo_count = photo_count + 1
    WHERE id = NEW.journey_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE journey
    SET photo_count = photo_count - 1
    WHERE id = OLD.journey_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 为 photo 表添加照片计数触发器
CREATE TRIGGER update_journey_photo_count_on_insert
  AFTER INSERT ON photo
  FOR EACH ROW
  EXECUTE FUNCTION update_journey_photo_count();

CREATE TRIGGER update_journey_photo_count_on_delete
  AFTER DELETE ON photo
  FOR EACH ROW
  EXECUTE FUNCTION update_journey_photo_count();

-- 添加表注释
COMMENT ON TABLE photo IS '照片表:存储用户上传的照片及核心元数据(最小必要原则)';

-- 添加列注释
COMMENT ON COLUMN photo.id IS '照片唯一标识符';
COMMENT ON COLUMN photo.journey_id IS '所属旅程ID';
COMMENT ON COLUMN photo.user_id IS '用户ID';
COMMENT ON COLUMN photo.storage_path IS '存储路径 bucket/filename.extension';
COMMENT ON COLUMN photo.storage_bucket IS '存储桶名称';
COMMENT ON COLUMN photo.file_name IS '文件名 filename.extension';
COMMENT ON COLUMN photo.latitude IS '纬度';
COMMENT ON COLUMN photo.longitude IS '经度';
COMMENT ON COLUMN photo.taken_at IS '拍摄时间';
COMMENT ON COLUMN photo.metadata IS '扩展元数据(JSONB格式,存储其他EXIF数据)';
COMMENT ON COLUMN photo.created_at IS '创建时间';
COMMENT ON COLUMN photo.updated_at IS '更新时间';
