-- Fix admin profile with existing user images
-- Run this in Supabase SQL Editor

-- Step 1: Check current admin profile and its images
SELECT 'Current admin profile:' as status, * FROM profiles WHERE email = 'admin@ershoevents.com';
SELECT 'Images referencing admin:' as status, COUNT(*) as count FROM user_images WHERE user_id = (SELECT id FROM profiles WHERE email = 'admin@ershoevents.com');

-- Step 2: Create new admin profile with correct ID
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

-- Step 3: Update all user_images that reference the old admin ID to use the new admin ID
UPDATE user_images 
SET user_id = '00000000-0000-0000-0000-000000000000'::uuid
WHERE user_id = (SELECT id FROM profiles WHERE email = 'admin@ershoevents.com' AND id != '00000000-0000-0000-0000-000000000000'::uuid);

-- Step 4: Update all events that reference the old admin ID to use the new admin ID
UPDATE events 
SET created_by = '00000000-0000-0000-0000-000000000000'::uuid
WHERE created_by = (SELECT id FROM profiles WHERE email = 'admin@ershoevents.com' AND id != '00000000-0000-0000-0000-000000000000'::uuid);

-- Step 5: Delete the old admin profile (now safe since no references exist)
DELETE FROM profiles 
WHERE email = 'admin@ershoevents.com' 
AND id != '00000000-0000-0000-0000-000000000000'::uuid;

-- Step 6: Verify the new admin profile
SELECT 'New admin profile:' as status, * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Step 7: Test event creation
INSERT INTO events (title, description, date, location, created_by)
VALUES (
  'Test Admin Event',
  'Testing admin profile functionality',
  '2024-12-31',
  'Test Location',
  '00000000-0000-0000-0000-000000000000'::uuid
);

-- Step 8: Verify event was created
SELECT 'Event created successfully:' as status, * FROM events WHERE created_by = '00000000-0000-0000-0000-000000000000'::uuid;

-- Step 9: Clean up test event
DELETE FROM events WHERE title = 'Test Admin Event';
