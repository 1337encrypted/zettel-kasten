
-- Add a policy to allow admins to insert into the documentation table.
-- This is needed for the "upsert" operation to work correctly if the
-- initial documentation row does not exist.
CREATE POLICY "Allow admin to insert documentation"
ON public.documentation FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));
