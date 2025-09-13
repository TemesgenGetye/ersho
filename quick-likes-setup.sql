-- Quick setup for likes feature
-- Run this in Supabase SQL Editor

-- 1. Create image_likes table
CREATE TABLE IF NOT EXISTS image_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES user_images(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(image_id, user_id)
);

-- 2. Enable RLS
ALTER TABLE image_likes ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can manage their own likes"
  ON image_likes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can read likes"
  ON image_likes
  FOR SELECT
  TO public
  USING (true);

-- 4. Test the table
SELECT 'Likes table created successfully' as status;
