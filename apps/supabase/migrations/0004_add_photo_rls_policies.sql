-- 启用 photo 表的行级安全 (Row Level Security)
ALTER TABLE photo ENABLE ROW LEVEL SECURITY;

-- photo 表的 RLS 策略
-- 策略1：用户可以查看自己的照片
CREATE POLICY "Users can view their own photos"
  ON photo
  FOR SELECT
  USING (auth.uid() = user_id);

-- 策略2：用户可以插入自己的照片
CREATE POLICY "Users can insert their own photos"
  ON photo
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 策略3：用户可以更新自己的照片
CREATE POLICY "Users can update their own photos"
  ON photo
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 策略4：用户可以删除自己的照片
CREATE POLICY "Users can delete their own photos"
  ON photo
  FOR DELETE
  USING (auth.uid() = user_id);

-- 添加策略注释
COMMENT ON POLICY "Users can view their own photos" ON photo IS '用户只能查看自己上传的照片';
COMMENT ON POLICY "Users can insert their own photos" ON photo IS '用户只能上传自己的照片';
COMMENT ON POLICY "Users can update their own photos" ON photo IS '用户只能更新自己的照片';
COMMENT ON POLICY "Users can delete their own photos" ON photo IS '用户只能删除自己的照片';
