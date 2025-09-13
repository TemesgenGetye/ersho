-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow public access to view images
CREATE POLICY "Allow public access to view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Create policy to allow users to delete their own images
CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);
