-- ========================================================
-- VETOCARE: FINAL UNIFIED DATABASE SCHEMA (RELIABLE)
-- ========================================================

-- 1. BASE TABLES
CREATE TABLE IF NOT EXISTS public.maitres (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.veterinaires (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT DEFAULT 'Généraliste',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    primary_vet_id UUID REFERENCES public.veterinaires(id),
    clinic_notes TEXT,
    internal_id TEXT UNIQUE,
    allergies TEXT,
    chronic_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.rendez_vous (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    date_rdv TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'planifié', 
    health_record_url TEXT,
    medical_notes TEXT,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    checkin_at TIMESTAMPTZ,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.indisponibilites_vet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    motif TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    doc_type TEXT DEFAULT 'autre', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. VIEWS
CREATE OR REPLACE VIEW public.waiting_room AS
SELECT r.id, r.date_rdv, r.checkin_at, p.name as patient_name, p.species, p.id as patient_id, v.name as vet_name, v.id as vet_id
FROM public.rendez_vous r
JOIN public.patients p ON r.patient_id = p.id
JOIN public.veterinaires v ON r.veterinaire_id = v.id
WHERE r.status = 'en_attente' AND r.date_rdv::date = CURRENT_DATE
ORDER BY r.checkin_at ASC;

-- 3. CORE FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_vet()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.veterinaires WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC OPERATIONS
CREATE OR REPLACE FUNCTION public.check_conflict(v_id UUID, rdv_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.rendez_vous WHERE veterinaire_id = v_id AND status NOT IN ('annulé', 'terminé')
    AND ABS(EXTRACT(EPOCH FROM (date_rdv - rdv_date))) < 1800
  ) OR EXISTS (
    SELECT 1 FROM public.indisponibilites_vet WHERE veterinaire_id = v_id AND (rdv_date >= start_time AND rdv_date < end_time)
  ) THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.book_appointment(
  p_maitre_id UUID, p_patient_id UUID, p_veterinaire_id UUID, p_date_rdv TIMESTAMP WITH TIME ZONE, p_health_record_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_conflict BOOLEAN;
  v_id UUID;
BEGIN
  v_conflict := public.check_conflict(p_veterinaire_id, p_date_rdv);
  IF v_conflict THEN RETURN '{"success": false, "message": "Conflit"}'; END IF;
  INSERT INTO public.rendez_vous (maitre_id, patient_id, veterinaire_id, date_rdv, status, health_record_url)
  VALUES (p_maitre_id, p_patient_id, p_veterinaire_id, p_date_rdv, 'planifié', p_health_record_url) RETURNING id INTO v_id;
  RETURN '{"success": true}';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_in_patient(appointment_id UUID) RETURNS VOID AS $$
BEGIN UPDATE public.rendez_vous SET status = 'en_attente', checkin_at = NOW() WHERE id = appointment_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.approve_appointment(appointment_id UUID) RETURNS VOID AS $$
BEGIN UPDATE public.rendez_vous SET status = 'confirmé', approved_at = NOW() WHERE id = appointment_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SECURITY (RLS)
ALTER TABLE public.maitres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indisponibilites_vet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- Vet Policies
DROP POLICY IF EXISTS "Vet: Full Access" ON public.patients;
CREATE POLICY "Vet: Full Access" ON public.patients FOR ALL TO authenticated USING (is_vet());

DROP POLICY IF EXISTS "Vet: Full Agenda Access" ON public.rendez_vous;
CREATE POLICY "Vet: Full Agenda Access" ON public.rendez_vous FOR ALL TO authenticated USING (is_vet());

DROP POLICY IF EXISTS "Vet: Manage Docs" ON public.medical_documents;
CREATE POLICY "Vet: Manage Docs" ON public.medical_documents FOR ALL TO authenticated USING (is_vet());

-- Owner Policies
DROP POLICY IF EXISTS "Owner: My Pets" ON public.patients;
CREATE POLICY "Owner: My Pets" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = maitre_id);

DROP POLICY IF EXISTS "Owner: Book" ON public.rendez_vous;
CREATE POLICY "Owner: Book" ON public.rendez_vous FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);

DROP POLICY IF EXISTS "Owner: My Docs" ON public.medical_documents;
CREATE POLICY "Owner: My Docs" ON public.medical_documents FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = medical_documents.patient_id AND maitre_id = auth.uid()));

DROP POLICY IF EXISTS "Owner: Add Docs" ON public.medical_documents;
CREATE POLICY "Owner: Add Docs" ON public.medical_documents 
FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND maitre_id = auth.uid()));

-- Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('health-records', 'health-records', false) ON CONFLICT (id) DO NOTHING;
