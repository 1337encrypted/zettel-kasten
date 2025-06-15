
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  readme_title TEXT;
  readme_content TEXT;
BEGIN
  -- Insert into profiles table, letting created_at use its default value
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');

  -- Get the default README content from app_settings
  SELECT default_readme_title, default_readme_content
  INTO readme_title, readme_content
  FROM public.app_settings
  WHERE id = 1;
  
  -- Create the welcome note for the new user
  IF readme_title IS NOT NULL AND readme_content IS NOT NULL THEN
    INSERT INTO public.notes (user_id, title, content, tags)
    VALUES (new.id, readme_title, readme_content, ARRAY['welcome']);
  END IF;

  RETURN new;
end;
$function$;
