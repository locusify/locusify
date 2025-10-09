-- ============================================================================
-- Table: account_oauth
-- Description: OAuth 账号绑定表
-- ============================================================================

CREATE TABLE account_oauth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Foreign key constraint
  CONSTRAINT fk_account_oauth_user_id
    FOREIGN KEY (user_id)
    REFERENCES account(id)
    ON DELETE CASCADE,

  -- Unique constraint: prevent duplicate OAuth bindings
  CONSTRAINT uq_account_oauth_provider_provider_id
    UNIQUE (provider, provider_id)
);

-- Index for foreign key optimization
CREATE INDEX idx_account_oauth_user_id ON account_oauth(user_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE account_oauth IS 'OAuth 账号绑定表';
COMMENT ON COLUMN account_oauth.id IS '主键';
COMMENT ON COLUMN account_oauth.user_id IS '关联用户ID（级联删除）';
COMMENT ON COLUMN account_oauth.provider IS 'OAuth提供商（google/github/apple）';
COMMENT ON COLUMN account_oauth.provider_id IS '提供商账号ID';
COMMENT ON COLUMN account_oauth.created_at IS '绑定时间';
COMMENT ON COLUMN account_oauth.updated_at IS '更新时间';
