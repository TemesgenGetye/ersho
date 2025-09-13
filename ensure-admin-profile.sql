-- Ensure admin profile exists
-- Run this in Supabase SQL Editor

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
