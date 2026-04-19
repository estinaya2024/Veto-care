-- ==========================================
-- 6. ADVANCED CLINICAL DATA
-- ==========================================

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

-- RLS POLICIES FOR NEW TABLES
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Vets can do anything
CREATE POLICY "Vet: Full Consultations Access" ON public.consultations FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Vet: Full Prescriptions Access" ON public.prescriptions FOR ALL TO authenticated USING (is_vet());

-- Owners can only see theirs
CREATE POLICY "Owner: My Pets Consultations" ON public.consultations FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = consultation.patient_id AND maitre_id = auth.uid()));

CREATE POLICY "Owner: My Pets Prescriptions" ON public.prescriptions FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = prescriptions.patient_id AND maitre_id = auth.uid()));

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_consult_patient ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescript_patient ON public.prescriptions(patient_id);
