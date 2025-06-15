
-- This function is being updated to correctly check if a note is in a public folder path,
-- ensuring private notes within public folders aren't accidentally exposed.
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

    IF v_is_public IS NOT TRUE THEN
        RETURN false;
    END IF;
    
    IF v_user_id IS NULL THEN
      RETURN false;
    END IF;

    -- Check if the profile of the note's owner is public
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id AND is_public = true) THEN
        RETURN false;
    END IF;

    -- If the note is in a folder, check if the folder path is public
    IF v_folder_id IS NOT NULL THEN
      IF NOT public.is_folder_public(v_folder_id) THEN
        RETURN false;
      END IF;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- A new type to distinguish between users and notes in search results.
CREATE TYPE public.search_result_type AS ENUM ('user', 'note');

-- This new function will power the global search on the homepage.
CREATE OR REPLACE FUNCTION public.search_public_content(p_search_term text)
RETURNS TABLE (
    result_type public.search_result_type,
    result_id uuid,
    username text,
    user_avatar_url text,
    user_updated_at timestamptz,
    note_title text,
    note_slug text,
    note_updated_at timestamptz,
    note_tags text[],
    note_author_id uuid,
    note_author_username text,
    note_author_avatar_url text,
    note_author_updated_at timestamptz
)
AS $$
BEGIN
    RETURN QUERY
    -- Search for users by username
    SELECT
        'user'::public.search_result_type as result_type,
        p.id as result_id,
        p.username,
        p.avatar_url as user_avatar_url,
        p.updated_at as user_updated_at,
        NULL::text,
        NULL::text,
        NULL::timestamptz,
        NULL::text[],
        NULL::uuid,
        NULL::text,
        NULL::text,
        NULL::timestamptz
    FROM public.profiles p
    WHERE p.is_public = true AND p.username ILIKE '%' || p_search_term || '%'

    UNION ALL

    -- Search for public notes by title or tags
    SELECT
        'note'::public.search_result_type as result_type,
        n.id as result_id,
        NULL::text,
        NULL::text,
        NULL::timestamptz,
        n.title as note_title,
        n.slug as note_slug,
        n.updated_at as note_updated_at,
        n.tags as note_tags,
        p.id as note_author_id,
        p.username as note_author_username,
        p.avatar_url as note_author_avatar_url,
        p.updated_at as note_author_updated_at
    FROM public.notes n
    JOIN public.profiles p ON n.user_id = p.id
    WHERE
        public.is_note_public(n.id) AND
        (
            n.title ILIKE '%' || p_search_term || '%' OR
            EXISTS (
                SELECT 1
                FROM unnest(n.tags) AS tag
                WHERE tag ILIKE '%' || p_search_term || '%'
            )
        );
END;
$$ LANGUAGE plpgsql STABLE;
