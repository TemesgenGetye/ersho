-- Test if admin profile exists and can be accessed
-- Run this in Supabase SQL Editor

-- Check if admin profile exists
SELECT * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Check if we can insert into events table
INSERT INTO events (title, description, date, location, created_by)
VALUES (
  'Test Event',
  'This is a test event to verify admin profile works',
  '2024-12-31',
  'Test Location',
  '00000000-0000-0000-0000-000000000000'::uuid
);

-- Check if the event was created
SELECT * FROM events WHERE created_by = '00000000-0000-0000-0000-000000000000'::uuid;

-- Clean up test event
DELETE FROM events WHERE title = 'Test Event';
