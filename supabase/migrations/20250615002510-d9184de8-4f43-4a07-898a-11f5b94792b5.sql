
-- Create a public bucket for avatars with file size and type restrictions
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif']);

-- Add policy for public access to view avatar images
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Add policy for authenticated users to upload their avatars into a folder named with their user ID
CREATE POLICY "Authenticated users can upload avatars." ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add policy for authenticated users to update their own avatars
CREATE POLICY "Authenticated users can update their own avatars." ON storage.objects
  FOR UPDATE TO authenticated USING ((storage.foldername(name))[1] = auth.uid()::text);

-- Add policy for authenticated users to delete their own avatars
CREATE POLICY "Authenticated users can delete their own avatars." ON storage.objects
  FOR DELETE TO authenticated USING ((storage.foldername(name))[1] = auth.uid()::text);
