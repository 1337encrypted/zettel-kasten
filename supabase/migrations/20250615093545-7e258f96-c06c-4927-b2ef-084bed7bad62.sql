
-- Clean up old RLS SELECT policies for notes
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON public.notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Public notes are viewable by everyone" ON public.notes;
DROP POLICY IF EXISTS "Notes are viewable by everyone if public." ON public.notes;
DROP POLICY IF EXISTS "Users can view their own notes." ON public.notes;

-- Clean up old RLS SELECT policies for folders
DROP POLICY IF EXISTS "Folders are viewable by everyone." ON public.folders;
DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;
DROP POLICY IF EXISTS "Public folders are viewable by everyone" ON public.folders;
DROP POLICY IF EXISTS "Folders are viewable by everyone if public." ON public.folders;
DROP POLICY IF EXISTS "Users can view their own folders." ON public.folders;

-- Re-create the correct SELECT policies for notes
CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public notes are viewable by everyone"
  ON public.notes FOR SELECT
  TO anon, authenticated
  USING (public.is_note_public(id));

-- Re-create the correct SELECT policies for folders
CREATE POLICY "Users can view their own folders"
  ON public.folders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public folders are viewable by everyone"
  ON public.folders FOR SELECT
  TO anon, authenticated
  USING (public.is_folder_public(id));
