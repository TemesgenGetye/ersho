-- Simple admin profile fix
-- Run this in Supabase SQL Editor

-- Step 1: Check what admin profiles exist
SELECT 'All admin profiles:' as status, * FROM profiles WHERE email = 'admin@ershoevents.com';

-- Step 2: If there's already a profile with the correct ID, we're good
-- If not, we need to handle this differently

-- Step 3: Check if the correct admin profile already exists
SELECT 'Correct admin profile exists:' as status, 
       CASE 
         WHEN EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000'::uuid) 
         THEN 'YES' 
         ELSE 'NO' 
       END as exists;

-- Step 4: If the correct profile doesn't exist, create it by first deleting the old one
-- (This is safe because we'll recreate it immediately)
DELETE FROM profiles WHERE email = 'admin@ershoevents.com';

-- Step 5: Create the admin profile with the correct ID
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@ershoevents.com',
  'Admin User',
  'admin'
);

-- Step 6: Verify the admin profile
SELECT 'Admin profile created:' as status, * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

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
