-- VetoCare - Master Database Schema & Security (FINAL)
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

-- Table: Vétérinaires (Doctors)
ALTER TABLE IF EXISTS public.veterinaires DROP CONSTRAINT IF EXISTS veterinaires_id_fkey;
CREATE TABLE IF NOT EXISTS public.veterinaires (
    id UUID PRIMARY KEY, -- Removed strict auth.users reference to allow seeding
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
    status TEXT DEFAULT 'confirmé',
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

-- Table: Consultations (Detailed Clinical History)
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    date_consultation TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Prescriptions (Digital Prescriptions)
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]', -- List of {name, dosage, duration, instructions}
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
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
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- GLOBAL DOCTOR ROLE CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_vet()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'a_karou@estin.dz';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CONFLICT CHECK FUNCTION (RPC)
-- Allows frontend to check for double-booking without reading other user's private data
CREATE OR REPLACE FUNCTION public.check_conflict(v_id UUID, rdv_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.rendez_vous 
    WHERE veterinaire_id = v_id AND status NOT IN ('annulé', 'terminé')
    AND ABS(EXTRACT(EPOCH FROM (date_rdv - rdv_date))) < 1800 -- Exactly 30 mins
  ) OR EXISTS (
    SELECT 1 FROM public.indisponibilites_vet 
    WHERE veterinaire_id = v_id 
    AND (rdv_date >= start_time AND rdv_date < end_time)
  ) THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- BOOK APPOINTMENT FUNCTION (RPC)
-- Bypasses "permission denied for table users" Foreign Key PostgreSQL bugs by running as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.book_appointment(p_maitre_id UUID, p_patient_id UUID, p_veterinaire_id UUID, p_date_rdv TIMESTAMP WITH TIME ZONE)
RETURNS JSON AS $$
DECLARE
  v_conflict BOOLEAN;
  v_id UUID;
BEGIN
  v_conflict := public.check_conflict(p_veterinaire_id, p_date_rdv);
  IF v_conflict THEN
    RETURN '{"success": false, "message": "Conflit"}';
  END IF;

  INSERT INTO public.rendez_vous (maitre_id, patient_id, veterinaire_id, date_rdv, status)
  VALUES (p_maitre_id, p_patient_id, p_veterinaire_id, p_date_rdv, 'confirmé')
  RETURNING id INTO v_id;
  
  RETURN '{"success": true}';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PATIENTS POLICIES
DROP POLICY IF EXISTS "Vet: Full Access" ON public.patients;
CREATE POLICY "Vet: Full Access" ON public.patients FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Owner: Only Mine" ON public.patients;
CREATE POLICY "Owner: Only Mine" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = maitre_id);
DROP POLICY IF EXISTS "Owner: Insert Mine" ON public.patients;
CREATE POLICY "Owner: Insert Mine" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);
DROP POLICY IF EXISTS "Owner: Update Mine" ON public.patients;
CREATE POLICY "Owner: Update Mine" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = maitre_id);
DROP POLICY IF EXISTS "Owner: Delete Mine" ON public.patients;
CREATE POLICY "Owner: Delete Mine" ON public.patients FOR DELETE TO authenticated USING (auth.uid() = maitre_id);

-- AGENDA POLICIES
DROP POLICY IF EXISTS "Vet: Full Agenda Access" ON public.rendez_vous;
CREATE POLICY "Vet: Full Agenda Access" ON public.rendez_vous FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Anyone: See Reserved Dates" ON public.rendez_vous;
CREATE POLICY "Anyone: See Reserved Dates" ON public.rendez_vous FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Owner: Create My Appointment" ON public.rendez_vous;
CREATE POLICY "Owner: Create My Appointment" ON public.rendez_vous FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);

-- UNVAILABILITY POLICIES
DROP POLICY IF EXISTS "Vet: Manage Blocked Slots" ON public.indisponibilites_vet;
CREATE POLICY "Vet: Manage Blocked Slots" ON public.indisponibilites_vet FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Everyone: See Blocked Slots" ON public.indisponibilites_vet;
CREATE POLICY "Everyone: See Blocked Slots" ON public.indisponibilites_vet FOR SELECT TO authenticated USING (true);

-- PROFILE POLICIES
DROP POLICY IF EXISTS "User: Select Own Profile" ON public.maitres;
CREATE POLICY "User: Select Own Profile" ON public.maitres FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "User: Update Own Profile" ON public.maitres;
CREATE POLICY "User: Update Own Profile" ON public.maitres FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Everyone: See Doc Info" ON public.veterinaires;
CREATE POLICY "Everyone: See Doc Info" ON public.veterinaires FOR SELECT TO authenticated USING (true);

-- CONSULTATIONS POLICIES
DROP POLICY IF EXISTS "Vet: Full Consultations Access" ON public.consultations;
CREATE POLICY "Vet: Full Consultations Access" ON public.consultations FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Owner: My Pets Consultations" ON public.consultations;
CREATE POLICY "Owner: My Pets Consultations" ON public.consultations FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = consultations.patient_id AND maitre_id = auth.uid()));

-- PRESCRIPTIONS POLICIES
DROP POLICY IF EXISTS "Vet: Full Prescriptions Access" ON public.prescriptions;
CREATE POLICY "Vet: Full Prescriptions Access" ON public.prescriptions FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Owner: My Pets Prescriptions" ON public.prescriptions;
CREATE POLICY "Owner: My Pets Prescriptions" ON public.prescriptions FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = prescriptions.patient_id AND maitre_id = auth.uid()));

-- ==========================================
-- 4. PERFORMANCE INDEXING
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_rdv_date ON public.rendez_vous(date_rdv);
CREATE INDEX IF NOT EXISTS idx_indispo_range ON public.indisponibilites_vet(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_consult_patient ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescript_patient ON public.prescriptions(patient_id);

-- ==========================================
-- 5. STORAGE & ASSETS
-- ==========================================

-- Create Bucket: 'health-records'
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-records', 'health-records', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'health-records'
DROP POLICY IF EXISTS "Maitres: Upload own records" ON storage.objects;
CREATE POLICY "Maitres: Upload own records" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'health-records' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Maitres: See own records" ON storage.objects;
CREATE POLICY "Maitres: See own records" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'health-records' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Vets: See all records" ON storage.objects;
CREATE POLICY "Vets: See all records" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'health-records' AND public.is_vet());

-- ==========================================
-- 6. SEED DATA (For Evaluation)
-- ==========================================
INSERT INTO public.veterinaires (id, name, specialty, description, image_url)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Dr. Ayaka', 'Chirurgie & NAC', 'Spécialiste passionnée par les petits mammifères.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop'),
  ('11111111-1111-1111-1111-111111111111', 'Dr. Karim', 'Médecine Interne', 'Expert en diagnostics complexes et soins intensifs.', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;
