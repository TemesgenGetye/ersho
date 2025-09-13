-- Check admin profile and test event creation
-- Run this in Supabase SQL Editor

-- Step 1: Check if admin profile exists with correct ID
SELECT 'Admin profile check:' as status, * FROM profiles WHERE email = 'admin@ershoevents.com';

-- Step 2: If the profile exists but has wrong ID, update it
UPDATE profiles 
SET id = '00000000-0000-0000-0000-000000000000'::uuid,
    role = 'admin'
WHERE email = 'admin@ershoevents.com';

-- Step 3: Verify the update
SELECT 'Updated admin profile:' as status, * FROM profiles WHERE email = 'admin@ershoevents.com';

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
SELECT 'Event created successfully:' as status, * FROM events WHERE created_by = '00000000-0000-0000-0000-000000000000'::uuid;

-- Step 6: Clean up test event
DELETE FROM events WHERE title = 'Test Admin Event';
