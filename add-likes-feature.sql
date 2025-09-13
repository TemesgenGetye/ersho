-- Add likes feature for images
-- Run this in Supabase SQL Editor

-- 1. Create likes table
CREATE TABLE IF NOT EXISTS image_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES user_images(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(image_id, user_id) -- Prevent duplicate likes from same user
);

-- 2. Enable RLS on likes table
ALTER TABLE image_likes ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for likes table
-- Allow users to like/unlike images
CREATE POLICY "Users can manage their own likes"
  ON image_likes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow public to read likes count
CREATE POLICY "Public can read likes"
  ON image_likes
  FOR SELECT
  TO public
  USING (true);

-- Allow admin to manage all likes
CREATE POLICY "Admin can manage all likes"
  ON image_likes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. Create a function to get like count for an image
CREATE OR REPLACE FUNCTION get_image_like_count(image_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM image_likes
    WHERE image_id = image_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a function to check if user has liked an image
CREATE OR REPLACE FUNCTION user_has_liked_image(image_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS(
      SELECT 1
      FROM image_likes
      WHERE image_id = image_uuid AND user_id = user_uuid
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Test the functions
SELECT 'Likes table created successfully' as status;
