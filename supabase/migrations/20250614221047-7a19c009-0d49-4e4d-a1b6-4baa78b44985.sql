
-- Backfill `created_at` for existing profiles from the auth.users table.
-- This ensures all existing users have an account creation date.
UPDATE public.profiles p
SET created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id AND p.created_at IS NULL;

-- Now that historical data is filled, we can make the column required
-- and set a default for any new rows, ensuring data integrity.
ALTER TABLE public.profiles
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now();

-- Update the trigger function for new signups to correctly populate
-- the `created_at` field from the auth event.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, username, created_at)
  values (new.id, new.raw_user_meta_data->>'username', new.created_at);
  return new;
end;
$function$;
