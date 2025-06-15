
-- Drop the faulty unique index that prevents multiple users from having a welcome note.
DROP INDEX IF EXISTS public.notes_title_folder_id_uniq_idx;

-- Create a unique index for notes within a folder, scoped to a user.
-- This ensures a user cannot have two notes with the same title in the same folder.
CREATE UNIQUE INDEX IF NOT EXISTS notes_user_id_folder_id_title_key ON public.notes (user_id, folder_id, title) WHERE folder_id IS NOT NULL;

-- Create a unique index for notes at the root (not in any folder), scoped to a user.
-- This ensures a user cannot have two notes with the same title at the root level.
CREATE UNIQUE INDEX IF NOT EXISTS notes_user_id_title_key_when_folder_null ON public.notes (user_id, title) WHERE folder_id IS NULL;
