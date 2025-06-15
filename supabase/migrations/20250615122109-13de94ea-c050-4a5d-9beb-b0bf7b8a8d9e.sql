
-- First, we'll update the function that determines if a note is public.
-- It will now only depend on the note's own 'is_public' flag and the profile's public status,
-- not the folder's status. This prevents a circular dependency.
CREATE OR REPLACE FUNCTION public.is_note_public(p_note_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
    v_is_public boolean;
    v_user_id uuid;
BEGIN
    SELECT is_public, user_id INTO v_is_public, v_user_id
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

    RETURN true;
END;
$$;

-- This helper function will set a folder and its entire ancestry to public.
CREATE OR REPLACE FUNCTION public.set_folder_path_public(p_folder_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    WITH RECURSIVE folder_path AS (
        SELECT id, parent_id
        FROM public.folders
        WHERE id = p_folder_id
        UNION ALL
        SELECT f.id, f.parent_id
        FROM public.folders f
        JOIN folder_path fp ON f.id = fp.parent_id
    )
    UPDATE public.folders
    SET is_public = true
    WHERE id IN (SELECT id FROM folder_path);
END;
$$;

-- This helper function checks if a folder or any of its subfolders contain a public note.
CREATE OR REPLACE FUNCTION public.folder_has_public_content(p_folder_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
    has_content boolean;
BEGIN
    WITH RECURSIVE folder_hierarchy AS (
        SELECT id FROM public.folders WHERE id = p_folder_id
        UNION ALL
        SELECT f.id FROM public.folders f JOIN folder_hierarchy fh ON f.parent_id = fh.id
    )
    SELECT EXISTS (
        SELECT 1 FROM public.notes n
        WHERE n.folder_id IN (SELECT id FROM folder_hierarchy) AND n.is_public = true
    ) INTO has_content;
    RETURN has_content;
END;
$$;

-- This function is called when a note is made private or deleted.
-- It checks the folder, and if it no longer has public content, marks it private and checks the parent.
CREATE OR REPLACE FUNCTION public.demote_folder_path_if_private(p_folder_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    current_folder_id uuid := p_folder_id;
    v_parent_id uuid;
    v_has_public_content boolean;
BEGIN
    LOOP
        EXIT WHEN current_folder_id IS NULL;

        v_has_public_content := public.folder_has_public_content(current_folder_id);

        IF NOT v_has_public_content THEN
            UPDATE public.folders SET is_public = false WHERE id = current_folder_id;
        ELSE
            -- If this folder still has public content, its parents must remain public.
            EXIT;
        END IF;

        SELECT parent_id INTO v_parent_id FROM public.folders WHERE id = current_folder_id;
        current_folder_id := v_parent_id;
    END LOOP;
END;
$$;

-- The trigger function that orchestrates the above logic whenever a note changes.
CREATE OR REPLACE FUNCTION public.sync_folder_visibility()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Note created or made public
    IF (TG_OP = 'INSERT' AND NEW.is_public) OR (TG_OP = 'UPDATE' AND NEW.is_public AND (NOT OLD.is_public OR OLD.is_public IS NULL)) THEN
        IF NEW.folder_id IS NOT NULL THEN
            PERFORM public.set_folder_path_public(NEW.folder_id);
        END IF;
    END IF;

    -- Note made private or deleted
    IF (TG_OP = 'UPDATE' AND NOT NEW.is_public AND OLD.is_public) OR (TG_OP = 'DELETE' AND OLD.is_public) THEN
        IF OLD.folder_id IS NOT NULL THEN
            PERFORM public.demote_folder_path_if_private(OLD.folder_id);
        END IF;
    END IF;

    -- Note moved between folders
    IF TG_OP = 'UPDATE' AND NEW.folder_id IS DISTINCT FROM OLD.folder_id THEN
        -- Handle new folder location
        IF NEW.is_public AND NEW.folder_id IS NOT NULL THEN
            PERFORM public.set_folder_path_public(NEW.folder_id);
        END IF;
        -- Handle old folder location
        IF OLD.is_public AND OLD.folder_id IS NOT NULL THEN
            PERFORM public.demote_folder_path_if_private(OLD.folder_id);
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

-- Drop existing trigger if it exists to avoid errors.
DROP TRIGGER IF EXISTS note_publicity_trigger ON public.notes;

-- Create the new trigger to run the function after any change to the notes table.
CREATE TRIGGER note_publicity_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.sync_folder_visibility();
