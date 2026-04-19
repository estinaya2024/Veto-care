-- ============================================================
-- VetoCare Master Production Database Schema
-- Version: 2.0 (Clinical Vision & Logic Alignment)
-- Description: One-stop SQL for total clinic synchronization.
-- ============================================================

-- 1. CLEANUP (Optional - Use with caution)
-- DROP TABLE IF EXISTS prescriptions CASCADE;
-- DROP TABLE IF EXISTS consultations CASCADE;
-- DROP TABLE IF EXISTS indisponibilites_vet CASCADE;
-- DROP TABLE IF EXISTS rendez_vous CASCADE;
-- DROP TABLE IF EXISTS patients CASCADE;
-- DROP TABLE IF EXISTS maitres CASCADE;
-- DROP TABLE IF EXISTS veterinaires CASCADE;

-- ==========================================
-- 2. PROFILES & ROLES
-- ==========================================

-- Table: Maîtres (Owners)
CREATE TABLE IF NOT EXISTS public.maitres (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    emergency_phone TEXT,
    avatar_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure column exists for older installations
ALTER TABLE public.maitres ADD COLUMN IF NOT EXISTS email TEXT;

-- Table: Vétérinaires (Doctors)
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
    INSERT INTO public.maitres (id, full_name, email)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)), new.email);
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
-- 3. CLINICAL DATA
-- ==========================================

-- Table: Patients (Pets)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    weight TEXT,
    status TEXT DEFAULT 'En bonne santé',
    is_archived BOOLEAN DEFAULT FALSE,
    last_visit TIMESTAMP WITH TIME ZONE,
    next_vax TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure column exists if table was created in an older version
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Table: Rendez-vous (Agenda)
CREATE TABLE IF NOT EXISTS public.rendez_vous (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    date_rdv TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'confirmé', -- confirmed, en_attente, terminé, annulé
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
    appointment_id UUID REFERENCES public.rendez_vous(id) ON DELETE SET NULL,
    date_consultation TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure column exists if table was created in an older version
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.rendez_vous(id) ON DELETE SET NULL;

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
-- 4. SMART LOGIC (RPCs)
-- ==========================================

-- CONFLICT CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.check_conflict(v_id UUID, rdv_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.rendez_vous 
    WHERE veterinaire_id = v_id AND status NOT IN ('annulé', 'terminé')
    AND ABS(EXTRACT(EPOCH FROM (date_rdv - rdv_date))) < 1740
  ) OR EXISTS (
    SELECT 1 FROM public.indisponibilites_vet 
    WHERE veterinaire_id = v_id AND rdv_date >= start_time AND rdv_date < end_time
  ) THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- BOOK APPOINTMENT FUNCTION
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

-- ==========================================
-- 5. RLS POLICIES (SECURITY)
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
  -- Re-verified clinical email
  RETURN (auth.jwt() ->> 'email') = 'a_karou@estin.dz';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES (MAITRES)
DROP POLICY IF EXISTS "Everyone: See Profiles" ON public.maitres;
CREATE POLICY "Everyone: See Profiles" ON public.maitres FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Owner: Update My Profile" ON public.maitres;
CREATE POLICY "Owner: Update My Profile" ON public.maitres FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Owner: Insert My Profile" ON public.maitres;
CREATE POLICY "Owner: Insert My Profile" ON public.maitres FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- VETERINAIRES
DROP POLICY IF EXISTS "Everyone: See Vets" ON public.veterinaires;
CREATE POLICY "Everyone: See Vets" ON public.veterinaires FOR SELECT TO authenticated USING (true);

-- PATIENTS
DROP POLICY IF EXISTS "Vet: Full Access" ON public.patients;
CREATE POLICY "Vet: Full Access" ON public.patients FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Owner: Only Mine" ON public.patients;
CREATE POLICY "Owner: Only Mine" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = maitre_id);
DROP POLICY IF EXISTS "Owner: Insert Mine" ON public.patients;
CREATE POLICY "Owner: Insert Mine" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);
DROP POLICY IF EXISTS "Owner: Update Mine" ON public.patients;
CREATE POLICY "Owner: Update Mine" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = maitre_id);

-- AGENDA
DROP POLICY IF EXISTS "Vet: Full Agenda Access" ON public.rendez_vous;
CREATE POLICY "Vet: Full Agenda Access" ON public.rendez_vous FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Everyone: See All Appointments" ON public.rendez_vous;
CREATE POLICY "Everyone: See All Appointments" ON public.rendez_vous FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Owner: My Appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Owner: Create My Appointment" ON public.rendez_vous;
CREATE POLICY "Owner: Create My Appointment" ON public.rendez_vous FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);
DROP POLICY IF EXISTS "Owner: Update My Appointment Status" ON public.rendez_vous;
CREATE POLICY "Owner: Update My Appointment Status" ON public.rendez_vous FOR UPDATE TO authenticated USING (auth.uid() = maitre_id);

-- UNVAILABILITY
DROP POLICY IF EXISTS "Vet: Manage Blocked Slots" ON public.indisponibilites_vet;
CREATE POLICY "Vet: Manage Blocked Slots" ON public.indisponibilites_vet FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Everyone: See Blocked Slots" ON public.indisponibilites_vet;
CREATE POLICY "Everyone: See Blocked Slots" ON public.indisponibilites_vet FOR SELECT TO authenticated USING (true);

-- CONSULTATIONS
DROP POLICY IF EXISTS "Vet: Full Consultations Access" ON public.consultations;
CREATE POLICY "Vet: Full Consultations Access" ON public.consultations FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Owner: My Pets Consultations" ON public.consultations;
CREATE POLICY "Owner: My Pets Consultations" ON public.consultations FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = consultations.patient_id AND maitre_id = auth.uid()));

-- PRESCRIPTIONS
DROP POLICY IF EXISTS "Vet: Full Prescriptions Access" ON public.prescriptions;
CREATE POLICY "Vet: Full Prescriptions Access" ON public.prescriptions FOR ALL TO authenticated USING (is_vet());
DROP POLICY IF EXISTS "Owner: My Pets Prescriptions" ON public.prescriptions;
CREATE POLICY "Owner: My Pets Prescriptions" ON public.prescriptions FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = prescriptions.patient_id AND maitre_id = auth.uid()));

-- ==========================================
-- 6. INDEXING & OPTIMIZATION
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_rdv_date ON public.rendez_vous(date_rdv);
CREATE INDEX IF NOT EXISTS idx_indispo_range ON public.indisponibilites_vet(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_consult_patient ON public.consultations(patient_id);
-- Constraint Fix: Decouple from maitres (allows vets to have pets)
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_maitre_id_fkey;
ALTER TABLE public.patients ADD CONSTRAINT patients_maitre_id_fkey FOREIGN KEY (maitre_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_consult_apt ON public.consultations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescript_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_owner ON public.patients(maitre_id);

-- ==========================================
-- 7. DATA REPAIR & BACKFILL
-- ==========================================
-- Run this once to fix users created before the trigger was active

DO $$
BEGIN
    -- Repair missing Owner profiles
    INSERT INTO public.maitres (id, full_name, email)
    SELECT id, COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)), email
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.maitres) 
      AND id NOT IN (SELECT id FROM public.veterinaires)
      AND email != 'a_karou@estin.dz';

    -- Repair missing Vet profile (Dr. Karou)
    INSERT INTO public.veterinaires (id, name)
    SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'Dr. Karou')
    FROM auth.users
    WHERE email = 'a_karou@estin.dz' 
      AND id NOT IN (SELECT id FROM public.veterinaires);
END $$;
