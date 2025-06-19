
-- Create a storage bucket for voice assistant audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-responses', 'voice-responses', true);

-- Set up RLS policies for the voice-responses bucket
CREATE POLICY "Users can upload their own voice responses"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-responses' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own voice responses"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-responses' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice responses"
ON storage.objects FOR DELETE
USING (bucket_id = 'voice-responses' AND auth.uid()::text = (storage.foldername(name))[1]);
