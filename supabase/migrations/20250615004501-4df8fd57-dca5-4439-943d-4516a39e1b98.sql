
-- Create a table to hold global application settings like the default note
CREATE TABLE public.app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    default_readme_title TEXT NOT NULL DEFAULT 'Welcome to Zet!',
    default_readme_content TEXT NOT NULL DEFAULT E'This is your first note. You can edit it, delete it, or create new notes.\n\nHere are some things you can do:\n\n*   Create notes and folders.\n*   Use Markdown for formatting.\n*   Add tags to your notes.\n*   Search for notes by title, content, or tags.\n*   Export your notes.\n\nHappy Zetteling!',
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- Ensures that only one row can exist in this table
    CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Insert the single settings row if it doesn't exist
INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on the new table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read the settings
CREATE POLICY "Allow authenticated users to read app settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (true);

-- Function to check if a user is an admin based on username
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = user_id
    AND public.profiles.username = '1337encrypted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy to allow only admins to update the settings
CREATE POLICY "Allow admin to update app settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update the trigger function to create the default note for new users from settings
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
  -- Insert into profiles table
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.created_at);

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
