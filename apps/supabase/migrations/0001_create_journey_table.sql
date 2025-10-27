-- 创建 journey 表（旅程表）
-- 存储用户的旅行记录，每次旅行对应一条记录
CREATE TABLE IF NOT EXISTS journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 用户ID，关联 auth.users 表
  name TEXT NOT NULL, -- 旅程名称，例如 "巴黎之旅"、"云南自驾游"
  description TEXT, -- 旅程描述（可选）
  start_date TIMESTAMPTZ, -- 旅程开始日期
  end_date TIMESTAMPTZ, -- 旅程结束日期
  photo_count INTEGER DEFAULT 0, -- 该旅程包含的照片数量
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'deleted', 'published')), -- 旅程状态：草稿|已删除|已发布
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')), -- 权限：公开|私密
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 创建时间
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- 更新时间
);

-- 创建索引以优化查询性能
CREATE INDEX idx_journey_user_id ON journey(user_id);
CREATE INDEX idx_journey_created_at ON journey(created_at DESC);

-- 创建更新 updated_at 的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 journey 表添加触发器
CREATE TRIGGER update_journey_updated_at
  BEFORE UPDATE ON journey
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE journey IS '旅程表：存储用户的旅行记录';

-- 添加列注释
COMMENT ON COLUMN journey.id IS '旅程唯一标识符';
COMMENT ON COLUMN journey.user_id IS '用户ID，关联auth.users表';
COMMENT ON COLUMN journey.name IS '旅程名称';
COMMENT ON COLUMN journey.description IS '旅程描述';
COMMENT ON COLUMN journey.start_date IS '旅程开始日期';
COMMENT ON COLUMN journey.end_date IS '旅程结束日期';
COMMENT ON COLUMN journey.photo_count IS '照片数量统计';
COMMENT ON COLUMN journey.status IS '旅程状态：draft(草稿)|deleted(已删除)|published(已发布)';
COMMENT ON COLUMN journey.visibility IS '权限：public(公开)|private(私密)';
COMMENT ON COLUMN journey.created_at IS '创建时间';
COMMENT ON COLUMN journey.updated_at IS '更新时间';