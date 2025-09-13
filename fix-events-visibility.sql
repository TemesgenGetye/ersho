-- Fix events visibility for public users
-- Run this in Supabase SQL Editor

-- 1. First, let's check current RLS status
SELECT 'Current RLS status:' as info, schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('events', 'user_images', 'profiles');

-- 2. Disable RLS on events table temporarily to allow public access
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 3. Re-enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing restrictive policies on events
DROP POLICY IF EXISTS "Admin can manage events" ON events;
DROP POLICY IF EXISTS "Allow admin to manage events" ON events;
DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Public can read events" ON events;

-- 5. Create a policy that allows public read access to events
CREATE POLICY "Public can read events"
  ON events
  FOR SELECT
  TO public
  USING (true);

-- 6. Create a policy that allows authenticated users to read events
CREATE POLICY "Authenticated users can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- 7. Create a policy that allows admin to manage events
CREATE POLICY "Admin can manage events"
  ON events
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

-- 8. Verify the policies
SELECT 'Events policies:' as info, schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'events';

-- 9. Test by selecting all events
SELECT 'All events count:' as info, COUNT(*) FROM events;
SELECT 'Sample events:' as info, id, title, date FROM events LIMIT 3;
