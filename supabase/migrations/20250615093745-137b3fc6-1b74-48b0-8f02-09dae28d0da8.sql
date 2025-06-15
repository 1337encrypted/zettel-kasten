
CREATE OR REPLACE FUNCTION get_public_notes_for_user(p_user_id uuid)
RETURNS SETOF notes
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM public.notes
  WHERE user_id = p_user_id AND public.is_note_public(id);
$$;

CREATE OR REPLACE FUNCTION get_public_folders_for_user(p_user_id uuid)
RETURNS SETOF folders
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM public.folders
  WHERE user_id = p_user_id AND public.is_folder_public(id);
$$;
