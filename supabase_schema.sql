-- VetoCare - Supabase Master Schema
-- This file contains all the necessary SQL to set up the database structure,
-- security policies (RLS), and custom functions for the VetoCare application.

-- ==========================================
-- 1. TABLES
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
CREATE TABLE IF NOT EXISTS public.veterinaires (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT DEFAULT 'Généraliste',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Patients (Pets)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    weight TEXT,
    status TEXT DEFAULT 'En bonne santé',
    is_archived BOOLEAN DEFAULT false,
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

-- Table: Consultations (Clinical History)
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

-- Table: Prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. CUSTOM FUNCTIONS & TRIGGERS
-- ==========================================

-- Function: Auto-create profile on signup
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Check for appointment conflicts
CREATE OR REPLACE FUNCTION public.check_conflict(v_id UUID, rdv_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.rendez_vous 
    WHERE veterinaire_id = v_id AND status != 'annulé'
    AND ABS(EXTRACT(EPOCH FROM (date_rdv - rdv_date))) < 1740 -- 29 min buffer
  ) OR EXISTS (
    SELECT 1 FROM public.indisponibilites_vet 
    WHERE veterinaire_id = v_id AND rdv_date >= start_time AND rdv_date < end_time
  ) THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Securely book appointment
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

-- Function: Check if user is the vet
CREATE OR REPLACE FUNCTION public.is_vet()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'a_karou@estin.dz';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. SECURITY (RLS)
-- ==========================================

ALTER TABLE public.maitres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indisponibilites_vet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Patients Policies
CREATE POLICY "Vet Access" ON public.patients FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Owner Access" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owner Insert" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);
CREATE POLICY "Owner Update" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = maitre_id);

-- Agenda Policies
CREATE POLICY "Vet Agenda" ON public.rendez_vous FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Owner Agenda" ON public.rendez_vous FOR SELECT TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owner Book" ON public.rendez_vous FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);

-- Unavailability Policies
CREATE POLICY "Vet Unavailability" ON public.indisponibilites_vet FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Public Unavailability" ON public.indisponibilites_vet FOR SELECT TO authenticated USING (true);

-- ==========================================
-- 4. STORAGE
-- ==========================================

-- Note: Buckets should be created manually in Supabase UI, but policies can be added here.
-- Bucket: 'health-records'
