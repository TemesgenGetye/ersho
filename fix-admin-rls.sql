-- Fix RLS policies to allow admin operations
-- This script should be run in the Supabase SQL editor

-- First, let's check if we have an admin user in the profiles table
-- If not, we'll create one

-- Create admin profile if it doesn't exist
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@ershoevents.com',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  email = 'admin@ershoevents.com',
  full_name = 'Admin User';

-- Update RLS policies to allow admin operations
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all images" ON user_images;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

-- Create new policies that work with the admin user
CREATE POLICY "Admin can manage all images"
  ON user_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = '00000000-0000-0000-0000-000000000000'::uuid
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = '00000000-0000-0000-0000-000000000000'::uuid
      AND profiles.role = 'admin'
    )
  );

-- Also allow reading all images for admin
CREATE POLICY "Admin can read all images"
  ON user_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = '00000000-0000-0000-0000-000000000000'::uuid
      AND profiles.role = 'admin'
    )
  );

-- Allow admin to read all profiles
CREATE POLICY "Admin can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = '00000000-0000-0000-0000-000000000000'::uuid
      AND p.role = 'admin'
    )
  );
