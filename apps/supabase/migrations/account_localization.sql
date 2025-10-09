-- ============================================================================
-- Table: account_localization
-- Description: 用户本地化配置表
-- ============================================================================

CREATE TABLE account_localization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  locale VARCHAR(10) NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Foreign key constraint
  CONSTRAINT fk_account_localization_user_id
    FOREIGN KEY (user_id)
    REFERENCES account(id)
    ON DELETE CASCADE,

  -- Unique constraint: one record per user per language
  CONSTRAINT uq_account_localization_user_id_locale
    UNIQUE (user_id, locale)
);

-- Index for foreign key optimization
CREATE INDEX idx_account_localization_user_id ON account_localization(user_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE account_localization IS '用户本地化配置表';
COMMENT ON COLUMN account_localization.id IS '记录ID';
COMMENT ON COLUMN account_localization.user_id IS '关联用户ID（级联删除）';
COMMENT ON COLUMN account_localization.locale IS '语言代码（ISO 639-1）';
COMMENT ON COLUMN account_localization.display_name IS '本地化显示名称';
COMMENT ON COLUMN account_localization.created_at IS '创建时间';
COMMENT ON COLUMN account_localization.updated_at IS '更新时间';
