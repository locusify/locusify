-- 启用 journey 表的行级安全 (Row Level Security)
ALTER TABLE journey ENABLE ROW LEVEL SECURITY;

-- journey 表的 RLS 策略
-- 策略1：用户可以查看自己的所有旅程,或其他人公开且已发布的旅程
CREATE POLICY "Users can view their own journeys"
  ON journey
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (visibility = 'public' AND status = 'published')
  );

-- 策略2：用户可以插入自己的旅程
CREATE POLICY "Users can insert their own journeys"
  ON journey
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 策略3：用户可以更新自己的旅程(不能更新已删除的旅程)
CREATE POLICY "Users can update their own journeys"
  ON journey
  FOR UPDATE
  USING (auth.uid() = user_id AND status != 'deleted')
  WITH CHECK (auth.uid() = user_id);

-- 策略4：用户可以删除自己的旅程(软删除,通过更新status为deleted实现)
-- 注意：实际删除操作应通过UPDATE status='deleted'来实现
CREATE POLICY "Users can delete their own journeys"
  ON journey
  FOR DELETE
  USING (auth.uid() = user_id AND status = 'deleted');

-- 添加策略注释
COMMENT ON POLICY "Users can view their own journeys" ON journey IS '用户可以查看自己的所有旅程,或其他人公开且已发布的旅程';
COMMENT ON POLICY "Users can insert their own journeys" ON journey IS '用户只能为自己创建旅程';
COMMENT ON POLICY "Users can update their own journeys" ON journey IS '用户只能更新自己的旅程(不能更新已删除的旅程)';
COMMENT ON POLICY "Users can delete their own journeys" ON journey IS '用户只能物理删除已软删除(status=deleted)的旅程';
