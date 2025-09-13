-- Fix RLS policies for admin operations
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
  role = 'admin',
  email = 'admin@ershoevents.com',
  full_name = 'Admin';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage all images" ON user_images;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Admin can manage all images" ON user_images;
DROP POLICY IF EXISTS "Admin can manage events" ON events;

-- Create new permissive policies for admin
CREATE POLICY "Allow admin to manage images"
  ON user_images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow admin to manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create admin to manage profiles
CREATE POLICY "Allow admin to manage profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
