
-- Enable Row Level Security on profiles and set policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (is_public = true);
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable Row Level Security on notes and set policies
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notes are viewable by everyone if public." ON public.notes;
DROP POLICY IF EXISTS "Users can view their own notes." ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes." ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes." ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes." ON public.notes;

CREATE POLICY "Notes are viewable by everyone if public."
  ON public.notes FOR SELECT
  USING (public.is_note_public(id));
CREATE POLICY "Users can view their own notes."
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes."
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes."
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes."
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Row Level Security on folders and set policies
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Folders are viewable by everyone if public." ON public.folders;
DROP POLICY IF EXISTS "Users can view their own folders." ON public.folders;
DROP POLICY IF EXISTS "Users can insert their own folders." ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders." ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders." ON public.folders;

CREATE POLICY "Folders are viewable by everyone if public."
  ON public.folders FOR SELECT
  USING (public.is_folder_public(id));
CREATE POLICY "Users can view their own folders."
  ON public.folders FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own folders."
  ON public.folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own folders."
  ON public.folders FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own folders."
  ON public.folders FOR DELETE
  USING (auth.uid() = user_id);
