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

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
    medication TEXT NOT NULL,
    dosage TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.indisponibilites_vet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veterinaire_id UUID REFERENCES public.veterinaires(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    motif TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);