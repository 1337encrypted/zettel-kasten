
-- Drop the existing unique constraint if it exists
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_user_id_slug_key;

-- Create a unique index for notes within folders (folder_id is not null)
-- This allows same slug in different folders for the same user
CREATE UNIQUE INDEX IF NOT EXISTS notes_user_id_folder_id_slug_unique_idx ON public.notes (user_id, folder_id, slug) WHERE folder_id IS NOT NULL;

-- Create a unique index for notes at the root (folder_id is null)
-- This ensures slugs are unique at the root level for the same user
CREATE UNIQUE INDEX IF NOT EXISTS notes_user_id_slug_root_unique_idx ON public.notes (user_id, slug) WHERE folder_id IS NULL;
