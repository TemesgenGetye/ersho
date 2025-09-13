-- Manual admin setup - bypass all RLS
-- Run this in Supabase SQL Editor

-- Step 1: Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_images DISABLE ROW LEVEL SECURITY;

-- Step 2: Create admin profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@ershoevents.com',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = 'admin@ershoevents.com',
  full_name = 'Admin User',
  role = 'admin';

-- Step 3: Verify admin profile exists
SELECT 'Admin profile created:' as status, * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Step 4: Test event creation
INSERT INTO events (title, description, date, location, created_by)
VALUES (
  'Test Admin Event',
  'Testing admin profile functionality',
  '2024-12-31',
  'Test Location',
  '00000000-0000-0000-0000-000000000000'::uuid
);

-- Step 5: Verify event was created
SELECT 'Event created:' as status, * FROM events WHERE created_by = '00000000-0000-0000-0000-000000000000'::uuid;

-- Step 6: Clean up test event
DELETE FROM events WHERE title = 'Test Admin Event';

-- Step 7: Keep RLS disabled for now (we'll re-enable later with proper policies)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;
