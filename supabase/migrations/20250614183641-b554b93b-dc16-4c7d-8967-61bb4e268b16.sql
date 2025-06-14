
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('note-images', 'note-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

CREATE POLICY "Allow users to upload to their own folder."
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'note-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update their own images."
ON storage.objects FOR UPDATE TO authenticated USING (
    bucket_id = 'note-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own images."
ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'note-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
