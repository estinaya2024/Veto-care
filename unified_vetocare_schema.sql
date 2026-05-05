-- ========================================================
-- VETOCARE: THE ONE & ONLY MASTER SCHEMA (RE-RUNNABLE)
-- ========================================================
-- NOTE FOR TEACHERS / DEVELOPERS:
-- This schema includes Row Level Security (RLS) and custom functions (RPCs).
-- Make sure to run the CANCELLATION RPC (Section 7) to enable patient cancellations.

-- 1. BASE TABLES
CREATE TABLE IF NOT EXISTS public.maitres (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.veterinaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    specialty TEXT DEFAULT 'Généraliste',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    weight TEXT,
    status TEXT DEFAULT 'En bonne santé',
    primary_vet_id UUID REFERENCES public.veterinaires(id),
    internal_id TEXT UNIQUE,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    date_consultation TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    price NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    doc_type TEXT DEFAULT 'autre', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. VIEWS
CREATE OR REPLACE VIEW public.waiting_room AS
SELECT r.id, r.date_rdv, r.checkin_at, p.name as patient_name, p.species, p.id as patient_id, v.name as vet_name, v.id as vet_id
FROM public.rendez_vous r
JOIN public.patients p ON r.patient_id = p.id
JOIN public.veterinaires v ON r.veterinaire_id = v.id
WHERE r.status = 'en_attente' AND r.date_rdv::date = CURRENT_DATE
ORDER BY r.checkin_at ASC;

-- 3. CORE FUNCTIONS (RPCs)
CREATE OR REPLACE FUNCTION public.is_vet()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.veterinaires WHERE auth_user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_conflict(v_id UUID, rdv_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.rendez_vous WHERE veterinaire_id = v_id AND status NOT IN ('annulé', 'terminé')
    AND ABS(EXTRACT(EPOCH FROM (date_rdv - rdv_date))) < 1800
  ) THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_in_patient(appointment_id UUID) RETURNS VOID AS $$
BEGIN UPDATE public.rendez_vous SET status = 'en_attente', checkin_at = NOW() WHERE id = appointment_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.approve_appointment(appointment_id UUID) RETURNS VOID AS $$
BEGIN UPDATE public.rendez_vous SET status = 'confirmé', approved_at = NOW() WHERE id = appointment_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. AUTOMATIC PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.maitres (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. SECURITY (RLS)
ALTER TABLE public.maitres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- Vets: Full Access
DROP POLICY IF EXISTS "Vet: Full Access" ON public.patients;
CREATE POLICY "Vet: Full Access" ON public.patients FOR ALL TO authenticated USING (is_vet());

DROP POLICY IF EXISTS "Vet: Manage Bookings" ON public.rendez_vous;
CREATE POLICY "Vet: Manage Bookings" ON public.rendez_vous FOR ALL TO authenticated USING (is_vet());

DROP POLICY IF EXISTS "Vet: Manage Consults" ON public.consultations;
CREATE POLICY "Vet: Manage Consults" ON public.consultations FOR ALL TO authenticated USING (is_vet());

DROP POLICY IF EXISTS "Public: View Vets" ON public.veterinaires;
CREATE POLICY "Public: View Vets" ON public.veterinaires FOR SELECT USING (true);

-- Owners: Manage Own
DROP POLICY IF EXISTS "Owner: My Profile" ON public.maitres;
CREATE POLICY "Owner: My Profile" ON public.maitres FOR ALL TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Owner: My Pets" ON public.patients;
CREATE POLICY "Owner: My Pets" ON public.patients FOR ALL TO authenticated USING (auth.uid() = maitre_id);

DROP POLICY IF EXISTS "Owner: My Bookings" ON public.rendez_vous;
CREATE POLICY "Owner: My Bookings" ON public.rendez_vous FOR ALL TO authenticated USING (auth.uid() = maitre_id);

DROP POLICY IF EXISTS "Owner: View Consults" ON public.consultations;
CREATE POLICY "Owner: View Consults" ON public.consultations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.maitre_id = auth.uid()));

DROP POLICY IF EXISTS "Owner: My Docs" ON public.medical_documents;
CREATE POLICY "Owner: My Docs" ON public.medical_documents FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.maitre_id = auth.uid()));

-- 6. REALTIME & STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('health-records', 'health-records', true) ON CONFLICT DO NOTHING;
DROP POLICY IF EXISTS "Permissive Storage All" ON storage.objects;
CREATE POLICY "Permissive Storage All" ON storage.objects FOR ALL USING (bucket_id = 'health-records') WITH CHECK (bucket_id = 'health-records');

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
-- 7. CANCELLATION RPC
CREATE OR REPLACE FUNCTION public.cancel_appointment_by_patient(appointment_id UUID)
RETURNS VOID AS $$
DECLARE
    apt_record RECORD;
BEGIN
    -- 1. Verify ownership and get details
    SELECT * INTO apt_record FROM public.rendez_vous 
    WHERE id = appointment_id AND maitre_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rendez-vous non trouvé ou accès refusé.';
    END IF;

    -- 2. Update status
    UPDATE public.rendez_vous SET status = 'annulé' WHERE id = appointment_id;

    -- 3. Record in consultation history
    INSERT INTO public.consultations (
        patient_id, 
        veterinaire_id, 
        date_consultation, 
        diagnosis, 
        notes, 
        price
    ) VALUES (
        apt_record.patient_id,
        apt_record.veterinaire_id,
        apt_record.date_rdv,
        'ANNULATION (Patient)',
        'Rendez-vous annulé par le patient.',
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
