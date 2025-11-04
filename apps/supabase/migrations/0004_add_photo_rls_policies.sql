-- ============================================================================
-- Photo Table RLS Policies (Final Version)
-- ============================================================================
-- This file consolidates all RLS policies for the photo table
-- Key principle: user_id is automatically set by database, clients don't provide it
-- ============================================================================

-- Step 1: Enable Row Level Security
ALTER TABLE photo ENABLE ROW LEVEL SECURITY;

-- Step 2: Set user_id to auto-populate with current authenticated user
ALTER TABLE photo
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Step 3: Drop any existing policies (clean slate)
DROP POLICY IF EXISTS "Users can only view their own photos" ON photo;
DROP POLICY IF EXISTS "Users can insert their own photos" ON photo;
DROP POLICY IF EXISTS "Users can update their own photos" ON photo;
DROP POLICY IF EXISTS "Users can delete their own photos" ON photo;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photo;

-- ============================================================================
-- Policy 1: SELECT - Users can only view their own photos
-- ============================================================================
CREATE POLICY "Users can view their own photos"
  ON photo
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can view their own photos" ON photo IS
  '用户只能查看自己上传的照片（严格隔离，不允许访问其他用户的照片）';

-- ============================================================================
-- Policy 2: INSERT - Authenticated users can insert photos
-- ============================================================================
-- IMPORTANT: Clients should NOT provide user_id
-- Database automatically sets user_id = auth.uid() via DEFAULT value
CREATE POLICY "Authenticated users can insert photos"
  ON photo
  FOR INSERT
  WITH CHECK (
    -- Only require user to be authenticated
    -- Database will automatically set user_id = auth.uid()
    auth.uid() IS NOT NULL
  );

COMMENT ON POLICY "Authenticated users can insert photos" ON photo IS
  '已认证用户可以插入照片。user_id 由数据库自动填充为当前用户 ID (auth.uid())，客户端无需提供此字段';

-- ============================================================================
-- Policy 3: UPDATE - Users can update their own photos
-- ============================================================================
CREATE POLICY "Users can update their own photos"
  ON photo
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can update their own photos" ON photo IS
  '用户只能更新自己的照片';

-- ============================================================================
-- Policy 4: DELETE - Users can delete their own photos
-- ============================================================================
CREATE POLICY "Users can delete their own photos"
  ON photo
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can delete their own photos" ON photo IS
  '用户只能删除自己的照片';

-- ============================================================================
-- Summary
-- ============================================================================
-- SELECT: Users can only view their own photos (auth.uid() = user_id)
-- INSERT: Any authenticated user can insert (user_id auto-set by database)
-- UPDATE: Users can only update their own photos
-- DELETE: Users can only delete their own photos
-- ============================================================================
