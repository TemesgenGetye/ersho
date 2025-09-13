-- Final fix for admin profile creation
-- Run this in Supabase SQL Editor

-- 1. Temporarily disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Create admin profile directly
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@ershoevents.com',
  'Admin',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 3. Re-enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create a policy that allows the admin profile to be managed
CREATE POLICY "Allow admin profile management"
  ON profiles
  FOR ALL
  TO authenticated
  USING (id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid);

-- 5. Create policies that allow admin operations based on the fixed admin profile
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

CREATE POLICY "Admin can manage user_images"
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

-- 6. Allow public read access to approved images
CREATE POLICY "Public can read approved images"
  ON user_images
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- 7. Allow users to insert their own images
CREATE POLICY "Users can insert own images"
  ON user_images
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 8. Allow reading events
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);
