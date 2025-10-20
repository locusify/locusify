-- Enable Row Level Security (RLS) for vlogs table
ALTER TABLE public.vlogs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own vlogs
CREATE POLICY "Users can view own vlogs"
ON public.vlogs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own vlogs
CREATE POLICY "Users can insert own vlogs"
ON public.vlogs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own vlogs
CREATE POLICY "Users can update own vlogs"
ON public.vlogs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own vlogs
CREATE POLICY "Users can delete own vlogs"
ON public.vlogs
FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Allow public read access for completed vlogs (for sharing feature)
-- Uncomment the policy below if you want to enable public sharing of vlogs
/*
CREATE POLICY "Public can view completed vlogs"
ON public.vlogs
FOR SELECT
USING (status = 'completed');
*/

-- Add comments
COMMENT ON POLICY "Users can view own vlogs" ON public.vlogs IS 'Allow users to view only their own vlogs';
COMMENT ON POLICY "Users can insert own vlogs" ON public.vlogs IS 'Allow users to create new vlogs for themselves';
COMMENT ON POLICY "Users can update own vlogs" ON public.vlogs IS 'Allow users to update their own vlog metadata';
COMMENT ON POLICY "Users can delete own vlogs" ON public.vlogs IS 'Allow users to delete their own vlogs';
