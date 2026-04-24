-- ========================================================
-- VETOCARE: MASTER CLINICAL SYSTEM SETUP (CONSOLIDATED)
-- ========================================================

-- 1. EXTEND TABLES FOR PROFESSIONAL WORKFLOW
ALTER TABLE public.rendez_vous 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS checkin_at TIMESTAMPTZ;

-- Reset default status for manual approval workflow
ALTER TABLE public.rendez_vous ALTER COLUMN status SET DEFAULT 'planifié';

ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS primary_vet_id UUID REFERENCES public.veterinaires(id),
ADD COLUMN IF NOT EXISTS clinic_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;

-- 2. CREATE MEDICAL DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    doc_type TEXT DEFAULT 'autre', -- 'imaging', 'lab', 'prescription', 'other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- 3. CREATE WAITING ROOM VIEW
CREATE OR REPLACE VIEW public.waiting_room AS
SELECT 
    r.id, 
    r.date_rdv, 
    r.checkin_at, 
    p.name as patient_name, 
    p.species, 
    p.id as patient_id, 
    v.name as vet_name, 
    v.id as vet_id
FROM public.rendez_vous r
JOIN public.patients p ON r.patient_id = p.id
JOIN public.veterinaires v ON r.veterinaire_id = v.id
WHERE r.status = 'en_attente' 
AND r.date_rdv::date = CURRENT_DATE
ORDER BY r.checkin_at ASC;

-- 4. SECURITY & RPC FUNCTIONS
-- Generic Vet detection
CREATE OR REPLACE FUNCTION public.is_vet()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.veterinaires WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Booking with manual approval
CREATE OR REPLACE FUNCTION public.book_appointment(
  p_maitre_id UUID, 
  p_patient_id UUID, 
  p_veterinaire_id UUID, 
  p_date_rdv TIMESTAMP WITH TIME ZONE,
  p_health_record_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_conflict BOOLEAN;
  v_id UUID;
BEGIN
  v_conflict := public.check_conflict(p_veterinaire_id, p_date_rdv);
  IF v_conflict THEN
    RETURN '{"success": false, "message": "Conflit"}';
  END IF;

  INSERT INTO public.rendez_vous (maitre_id, patient_id, veterinaire_id, date_rdv, status, health_record_url)
  VALUES (p_maitre_id, p_patient_id, p_veterinaire_id, p_date_rdv, 'planifié', p_health_record_url)
  RETURNING id INTO v_id;
  
  RETURN '{"success": true}';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approval/Check-in Logic
CREATE OR REPLACE FUNCTION public.check_in_patient(appointment_id UUID) 
RETURNS VOID AS $$
BEGIN
    UPDATE public.rendez_vous SET status = 'en_attente', checkin_at = NOW() WHERE id = appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.approve_appointment(appointment_id UUID) 
RETURNS VOID AS $$
BEGIN
    UPDATE public.rendez_vous SET status = 'confirmé', approved_at = NOW() WHERE id = appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES FOR DOCUMENTS
DROP POLICY IF EXISTS "Vets: Manage all documents" ON public.medical_documents;
CREATE POLICY "Vets: Manage all documents" ON public.medical_documents FOR ALL TO authenticated USING (is_vet());

DROP POLICY IF EXISTS "Owners: View own pet documents" ON public.medical_documents;
CREATE POLICY "Owners: View own pet documents" ON public.medical_documents FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = medical_documents.patient_id AND maitre_id = auth.uid()));
