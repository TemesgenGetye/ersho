-- Create storage bucket for user images
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'user-images');

CREATE POLICY "Allow authenticated users to upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-images' 
  AND auth.role() = 'authenticated'
);
