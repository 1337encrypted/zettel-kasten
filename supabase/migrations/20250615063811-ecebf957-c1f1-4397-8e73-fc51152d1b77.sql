
-- Update the default title for the welcome note created for new users.
ALTER TABLE public.app_settings
  ALTER COLUMN default_readme_title SET DEFAULT 'README';

-- Update the existing setting to 'README' so all future users get the correct title.
UPDATE public.app_settings
  SET default_readme_title = 'README'
  WHERE id = 1;
