-- ========================================================
-- VETOCARE: ULTIMATE COMPLETE MASTER SCHEMA
-- ========================================================

-- 1. CLEANUP (Drop everything to ensure a perfect state)
DROP TABLE IF EXISTS public.medical_documents CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.rendez_vous CASCADE;
DROP TABLE IF EXISTS public.indisponibilites_vet CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.maitres CASCADE;
DROP TABLE IF EXISTS public.veterinaires CASCADE;

-- 2. CREATE TABLES
CREATE TABLE public.maitres (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.veterinaires (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT DEFAULT 'Généraliste',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    weight TEXT,
    status TEXT DEFAULT 'En bonne santé',
    is_archived BOOLEAN DEFAULT false,
    last_visit TIMESTAMPTZ,
    next_vax TIMESTAMPTZ,
    primary_vet_id UUID REFERENCES public.veterinaires(id),
    clinic_notes TEXT,
    internal_id TEXT UNIQUE,
    allergies TEXT,
    chronic_conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rendez_vous (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maitre_id UUID REFERENCES public.maitres(id) ON DELETE CASCADE NOT NULL,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    date_rdv TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'planifié', 
    health_record_url TEXT,
    medical_notes TEXT,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    checkin_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.indisponibilites_vet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    motif TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    date_consultation TIMESTAMPTZ DEFAULT NOW(),
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]',
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    doc_type TEXT DEFAULT 'autre', 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SECURITY (RLS)
ALTER TABLE public.maitres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indisponibilites_vet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Vets" ON public.veterinaires FOR SELECT USING (true);

-- Vet Access
CREATE POLICY "Vet: Full Access" ON public.patients FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.veterinaires WHERE id = auth.uid()));
CREATE POLICY "Vet: Full Access Apts" ON public.rendez_vous FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.veterinaires WHERE id = auth.uid()));
CREATE POLICY "Vet: Full Access Consults" ON public.consultations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.veterinaires WHERE id = auth.uid()));
CREATE POLICY "Vet: Full Access Docs" ON public.medical_documents FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.veterinaires WHERE id = auth.uid()));
CREATE POLICY "Vet: View Owners" ON public.maitres FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.veterinaires WHERE id = auth.uid()));

-- Owner Access
CREATE POLICY "Owner: Manage Profile" ON public.maitres FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Owner: Manage Pets" ON public.patients FOR ALL TO authenticated USING (auth.uid() = maitre_id) WITH CHECK (auth.uid() = maitre_id);
CREATE POLICY "Owner: Book Apts" ON public.rendez_vous FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner: View Apts" ON public.rendez_vous FOR SELECT TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owner: View Docs" ON public.medical_documents FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = medical_documents.patient_id AND maitre_id = auth.uid()));
CREATE POLICY "Owner: Add Docs" ON public.medical_documents FOR INSERT WITH CHECK (true);

-- 4. STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('health-records', 'health-records', true) ON CONFLICT (id) DO UPDATE SET public = true;
DROP POLICY IF EXISTS "Universal Storage Access" ON storage.objects;
CREATE POLICY "Universal Storage Access" ON storage.objects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. REGISTER YOUR VET ACCOUNT
INSERT INTO public.veterinaires (id, name, specialty, description)
VALUES ('eb8bc3d3-3241-40fd-aa37-f5df08e348ed', 'Dr. Clinique Veto', 'Vétérinaire Principal', 'Expert en soins')
ON CONFLICT (id) DO UPDATE SET specialty = 'Vétérinaire Principal';

-- 6. AUTO-REGISTER EXISTING USERS
-- This ensures anyone already logged in gets a profile so they can add pets
INSERT INTO public.maitres (id, full_name)
SELECT id, COALESCE(email, 'Utilisateur Veto') FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 7. CACHE REFRESH
NOTIFY pgrst, 'reload schema';
