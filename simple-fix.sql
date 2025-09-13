-- Simple fix for admin operations
-- Run this in Supabase SQL Editor

-- Create admin profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@ershoevents.com',
  'Admin',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin';

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can read approved images" ON user_images;
DROP POLICY IF EXISTS "Users can read own images" ON user_images;
DROP POLICY IF EXISTS "Users can insert own images" ON user_images;
DROP POLICY IF EXISTS "Admins can manage all images" ON user_images;

-- Create simple permissive policies
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_images" ON user_images FOR ALL USING (true) WITH CHECK (true);
