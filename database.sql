-- VetoCare - Master Database Schema & Security
-- Optimized for "Total Synchronization" and Production Hosting

-- ==========================================
-- 1. PROFILES & ROLES
-- ==========================================

-- Table: Maîtres (Owners)
CREATE TABLE IF NOT EXISTS public.maitres (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Vétérinaires (Doctors) - Unified with Auth ID
CREATE TABLE IF NOT EXISTS public.veterinaires (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT DEFAULT 'Généraliste',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROLE TRIGGER: Handles automatic profile creation upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- CLINIC OVERRIDE: a_karou@estin.dz is always the doctor
  IF new.email = 'a_karou@estin.dz' THEN
    user_role := 'vet';
  ELSE
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'owner');
  END IF;
  
  IF user_role = 'owner' THEN
    INSERT INTO public.maitres (id, full_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)));
  ELSIF user_role = 'vet' THEN
    INSERT INTO public.veterinaires (id, name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Dr. ' || SPLIT_PART(new.email, '@', 1)));
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 2. CLINICAL DATA
-- ==========================================

-- Table: Patients (Pets)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    weight TEXT,
    status TEXT DEFAULT 'En bonne santé',
    last_visit TIMESTAMP WITH TIME ZONE,
    next_vax TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Rendez-vous (Agenda)
CREATE TABLE IF NOT EXISTS public.rendez_vous (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    date_rdv TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'confirmé', -- Now confirms by default after logic stabilization
    health_record_url TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Indisponibilités (Blocked Slots)
CREATE TABLE IF NOT EXISTS public.indisponibilites_vet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    motif TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. RLS POLICIES (SECURITY)
-- ==========================================

ALTER TABLE public.maitres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indisponibilites_vet ENABLE ROW LEVEL SECURITY;

-- GLOBAL DOCTOR ROLE CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_vet()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'a_karou@estin.dz';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PATIENTS POLICIES
CREATE POLICY "Vet: Full Access" ON public.patients FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Owner: Only Mine" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owner: Insert Mine" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);

-- AGENDA POLICIES
CREATE POLICY "Vet: Full Agenda Access" ON public.rendez_vous FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Owner: My Appointments" ON public.rendez_vous FOR SELECT TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owner: Create My Appointment" ON public.rendez_vous FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);

-- UNVAILABILITY POLICIES
CREATE POLICY "Vet: Manage Blocked Slots" ON public.indisponibilites_vet FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Everyone: See Blocked Slots" ON public.indisponibilites_vet FOR SELECT TO authenticated USING (true);

-- PROFILE POLICIES
CREATE POLICY "User: Select Own Profile" ON public.maitres FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Everyone: See Doc Info" ON public.veterinaires FOR SELECT TO authenticated USING (true);

-- ==========================================
-- 4. STORAGE SECURITY (Health Records)
-- ==========================================

-- Enable storage RLS triggers for the 'health-records' bucket (Must be created manually in UI first)
-- INSERT: Vets can upload
-- SELECT: Vets can see all, Owners can see theirs (auth.uid() subfolder check)

-- ==========================================
-- 5. PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_rdv_date ON public.rendez_vous(date_rdv);
CREATE INDEX IF NOT EXISTS idx_indispo_range ON public.indisponibilites_vet(start_time, end_time);
