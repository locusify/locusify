-- ============================================================================
-- Table: account
-- Description: 用户账号主表
-- ============================================================================

CREATE TABLE account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  auth_method VARCHAR(20) NOT NULL DEFAULT 'email',
  default_locale VARCHAR(10) NOT NULL DEFAULT 'en',
  default_timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  last_login_at TIMESTAMPTZ,
  logout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for email lookup
CREATE INDEX idx_account_email ON account(email);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE account IS '用户账号主表';
COMMENT ON COLUMN account.id IS '用户唯一标识';
COMMENT ON COLUMN account.email IS '电子邮箱（OAuth用户可为空）';
COMMENT ON COLUMN account.password_hash IS '密码哈希（仅邮箱注册用户）';
COMMENT ON COLUMN account.email_verified IS '邮箱是否验证';
COMMENT ON COLUMN account.auth_method IS '注册时的认证方式（email/google/github/apple）';
COMMENT ON COLUMN account.default_locale IS '默认语言（ISO 639-1）';
COMMENT ON COLUMN account.default_timezone IS '默认时区';
COMMENT ON COLUMN account.last_login_at IS '最后登录时间';
COMMENT ON COLUMN account.logout_at IS '注销时间';
COMMENT ON COLUMN account.created_at IS '创建时间';
COMMENT ON COLUMN account.updated_at IS '更新时间';
