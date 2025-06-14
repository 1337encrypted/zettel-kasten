
-- Enable RLS for profiles, notes, and folders tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Grant public read access to profiles
CREATE POLICY "Profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

-- Grant public read access to notes
CREATE POLICY "Notes are viewable by everyone."
  ON public.notes FOR SELECT
  USING (true);

-- Grant public read access to folders
CREATE POLICY "Folders are viewable by everyone."
  ON public.folders FOR SELECT
  USING (true);

-- Grant authenticated users permissions to manage their own profiles
CREATE POLICY "User can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant authenticated users permissions to manage their own notes
CREATE POLICY "User can insert their own notes."
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update their own notes."
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can delete their own notes."
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- Grant authenticated users permissions to manage their own folders
CREATE POLICY "User can insert their own folders."
  ON public.folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update their own folders."
  ON public.folders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can delete their own folders."
  ON public.folders FOR DELETE
  USING (auth.uid() = user_id);
