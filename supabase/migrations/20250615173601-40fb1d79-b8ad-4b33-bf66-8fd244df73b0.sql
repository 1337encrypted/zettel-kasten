
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  final_username TEXT;
  base_username TEXT;
  readme_title TEXT;
  readme_content TEXT;
BEGIN
  -- Use provided username or generate from email/name for OAuth signups
  base_username := COALESCE(
    new.raw_user_meta_data->>'username',
    -- For Google, 'name' is available in raw_user_meta_data
    new.raw_user_meta_data->>'name', 
    split_part(new.email, '@', 1)
  );

  -- Sanitize username: remove special characters, replace spaces with underscores, and convert to lowercase.
  base_username := lower(regexp_replace(base_username, '\s+', '_', 'g'));
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');

  final_username := base_username;
  
  -- Ensure username is unique by appending random characters if it already exists
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || '_' || substr(gen_random_uuid()::text, 1, 4);
  END LOOP;

  -- Insert into profiles table
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, final_username);

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
$function$
