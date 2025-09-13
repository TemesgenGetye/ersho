-- Simple fix to make events publicly visible
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on events table to allow public access
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 2. Verify events are accessible
SELECT 'Events count:' as info, COUNT(*) FROM events;
SELECT 'Sample events:' as info, id, title, date, location FROM events LIMIT 5;

-- 3. Test that events can be read without authentication
-- This should work now that RLS is disabled
