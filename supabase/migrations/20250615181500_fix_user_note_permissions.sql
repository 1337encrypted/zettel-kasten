
-- This migration ensures that users have the correct permissions to edit and delete their own notes.

-- Drop existing update and delete policies to avoid conflicts.
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Allow users to update their own notes.
-- The WITH CHECK clause prevents users from changing a note's owner.
CREATE POLICY "Users can update their own notes"
ON public.notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own notes.
CREATE POLICY "Users can delete their own notes"
ON public.notes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
