
-- Add visibility columns
ALTER TABLE public.profiles ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.notes ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.folders ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Add slug columns for shareable links
ALTER TABLE public.notes ADD COLUMN slug TEXT;
ALTER TABLE public.folders ADD COLUMN slug TEXT;

-- Add unique constraints for slugs per user, allowing nulls
CREATE UNIQUE INDEX notes_user_id_slug_key ON public.notes (user_id, slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX folders_user_id_slug_key ON public.folders (user_id, slug) WHERE slug IS NOT NULL;

-- Enable RLS on profiles table, which was not previously enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a folder and its entire path to the root is public
CREATE OR REPLACE FUNCTION public.is_folder_public(p_folder_id uuid)
RETURNS boolean AS $$
DECLARE
    is_path_public boolean;
    v_user_id uuid;
BEGIN
    SELECT user_id INTO v_user_id FROM public.folders WHERE id = p_folder_id;

    IF v_user_id IS NULL THEN
      RETURN false;
    END IF;

    IF NOT (SELECT is_public FROM public.profiles WHERE id = v_user_id) THEN
        RETURN false;
    END IF;

    WITH RECURSIVE folder_path AS (
        SELECT id, parent_id, is_public
        FROM public.folders
        WHERE id = p_folder_id
        UNION ALL
        SELECT f.id, f.parent_id, f.is_public
        FROM public.folders f
        JOIN folder_path fp ON f.id = fp.parent_id
    )
    SELECT bool_and(is_public) -- check if all folders in path are public
    FROM folder_path
    INTO is_path_public;

    RETURN COALESCE(is_path_public, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function to check if a note is public
CREATE OR REPLACE FUNCTION public.is_note_public(p_note_id uuid)
RETURNS boolean AS $$
DECLARE
    v_is_public boolean;
    v_folder_id uuid;
    v_user_id uuid;
BEGIN
    SELECT is_public, folder_id, user_id INTO v_is_public, v_folder_id, v_user_id
    FROM public.notes
    WHERE id = p_note_id;

    IF NOT v_is_public THEN
        RETURN false;
    END IF;
    
    IF v_user_id IS NULL THEN
      RETURN false;
    END IF;

    IF NOT (SELECT is_public FROM public.profiles WHERE id = v_user_id) THEN
        RETURN false;
    END IF;

    IF v_folder_id IS NOT NULL AND NOT public.is_folder_public(v_folder_id) THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT
TO anon, authenticated
USING (is_public = true);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS Policies for notes and folders for public access
-- Existing policies already grant owners full access. These new policies add public access.
CREATE POLICY "Public notes are viewable by everyone" ON public.notes
FOR SELECT
TO anon, authenticated
USING (public.is_note_public(id));

CREATE POLICY "Public folders are viewable by everyone" ON public.folders
FOR SELECT
TO anon, authenticated
USING (public.is_folder_public(id));
