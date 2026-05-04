-- ========================================================
-- VETOCARE: ADD YOURSELF AS A DOCTOR
-- ========================================================

-- Step 1: Ensure the Unique Constraint exists
ALTER TABLE public.veterinaires DROP CONSTRAINT IF EXISTS veterinaires_auth_user_id_key;
ALTER TABLE public.veterinaires ADD CONSTRAINT veterinaires_auth_user_id_key UNIQUE (auth_user_id);

-- Step 2: Replace 'YOUR_ID' below and run
-- To find your ID: Supabase -> Auth -> Users
INSERT INTO public.veterinaires (id, auth_user_id, name, specialty)
VALUES (
    gen_random_uuid(), 
    'YOUR_ID_HERE', -- <--- PASTE YOUR USER ID HERE
    'Dr. Name', 
    'Généraliste'
)
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name;
