
-- This migration simplifies the logic for checking if a note or folder is public.
-- It temporarily removes the dependency on the parent folder's and user's public status for debugging purposes.

CREATE OR REPLACE FUNCTION public.is_folder_public(p_folder_id uuid)
RETURNS boolean AS $$
DECLARE
    v_is_public boolean;
BEGIN
    -- Only check the folder's own is_public flag.
    SELECT is_public INTO v_is_public
    FROM public.folders
    WHERE id = p_folder_id;

    RETURN COALESCE(v_is_public, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_note_public(p_note_id uuid)
RETURNS boolean AS $$
DECLARE
    v_is_public boolean;
BEGIN
    -- Only check the note's own is_public flag.
    SELECT is_public INTO v_is_public
    FROM public.notes
    WHERE id = p_note_id;

    RETURN COALESCE(v_is_public, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
