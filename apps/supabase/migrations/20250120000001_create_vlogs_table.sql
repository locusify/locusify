-- Create vlogs table to store user vlog metadata
-- This table tracks video vlogs stored in the 'vlogs' storage bucket
-- and associates them with users

CREATE TABLE IF NOT EXISTS public.vlogs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to auth.users (user who created the vlog)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Vlog metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Storage information
  storage_path TEXT NOT NULL UNIQUE,  -- Path in 'vlogs' bucket: {user_id}/{vlog_id}.mp4
  thumbnail_url TEXT,                  -- Optional thumbnail URL

  -- Video metadata
  duration_seconds INTEGER,            -- Video duration in seconds
  file_size_bytes BIGINT,             -- File size in bytes
  video_format VARCHAR(50) DEFAULT 'mp4', -- Video format (mp4, webm, etc.)
  resolution VARCHAR(50),              -- Video resolution (1920x1080, 1280x720, etc.)

  -- Status tracking
  status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_vlogs_user_id ON public.vlogs(user_id);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_vlogs_created_at ON public.vlogs(created_at DESC);

-- Create index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_vlogs_status ON public.vlogs(status);

-- Add comment to table
COMMENT ON TABLE public.vlogs IS 'Stores metadata for user-generated travel vlogs';

-- Add comments to columns
COMMENT ON COLUMN public.vlogs.id IS 'Unique identifier for the vlog';
COMMENT ON COLUMN public.vlogs.user_id IS 'Reference to the user who created the vlog';
COMMENT ON COLUMN public.vlogs.title IS 'User-friendly title for the vlog';
COMMENT ON COLUMN public.vlogs.description IS 'Optional description of the vlog content';
COMMENT ON COLUMN public.vlogs.storage_path IS 'Path to video file in Supabase Storage vlogs bucket';
COMMENT ON COLUMN public.vlogs.thumbnail_url IS 'URL to video thumbnail/preview image';
COMMENT ON COLUMN public.vlogs.duration_seconds IS 'Total video duration in seconds';
COMMENT ON COLUMN public.vlogs.file_size_bytes IS 'Video file size in bytes';
COMMENT ON COLUMN public.vlogs.video_format IS 'Video file format (mp4, webm, etc.)';
COMMENT ON COLUMN public.vlogs.resolution IS 'Video resolution (e.g., 1920x1080)';
COMMENT ON COLUMN public.vlogs.status IS 'Processing status: processing, completed, or failed';
COMMENT ON COLUMN public.vlogs.created_at IS 'Timestamp when the vlog record was created';
COMMENT ON COLUMN public.vlogs.updated_at IS 'Timestamp when the vlog record was last updated';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_vlogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call update function
CREATE TRIGGER trigger_update_vlogs_updated_at
  BEFORE UPDATE ON public.vlogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vlogs_updated_at();
