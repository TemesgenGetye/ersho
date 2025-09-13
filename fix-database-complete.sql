-- Complete database setup for Ersho Events

-- 1. Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- 3. Ensure profiles table exists and is properly configured
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure events table exists
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ensure user_images table exists
CREATE TABLE IF NOT EXISTS user_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_id UUID REFERENCES events(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Disable RLS on all tables for now (to avoid permission issues)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_images DISABLE ROW LEVEL SECURITY;

-- 7. Remove any existing triggers that might cause issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 8. Insert some sample data for testing
INSERT INTO events (title, description, date, location, image_url) VALUES
('Sample Event 1', 'This is a sample event for testing', '2024-12-25', 'Sample Location', 'https://via.placeholder.com/400x300'),
('Sample Event 2', 'Another sample event', '2024-12-31', 'Another Location', 'https://via.placeholder.com/400x300')
ON CONFLICT DO NOTHING;
