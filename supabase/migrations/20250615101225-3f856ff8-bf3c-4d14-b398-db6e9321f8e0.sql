
-- This migration restores the comprehensive visibility logic for notes and folders.
-- It ensures that an item's public status is dependent on its parent's visibility and the user's public profile status.

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
