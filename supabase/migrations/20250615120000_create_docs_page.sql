
-- Create a table to hold the documentation content
CREATE TABLE public.documentation (
    id INT PRIMARY KEY DEFAULT 1,
    content TEXT NOT NULL DEFAULT 'Welcome to Zet! This is the documentation page. Admins can edit this content.',
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- Ensures that only one row can exist in this table
    CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Insert the single settings row if it doesn't exist
INSERT INTO public.documentation (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on the new table
ALTER TABLE public.documentation ENABLE ROW LEVEL SECURITY;

-- Allow any user to read the documentation
CREATE POLICY "Allow all users to read documentation"
ON public.documentation FOR SELECT
USING (true);

-- Allow admins to update the documentation
-- This uses the is_admin function from a previous migration.
CREATE POLICY "Allow admin to update documentation"
ON public.documentation FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

