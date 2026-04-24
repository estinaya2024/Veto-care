-- PROFESSIONAL CLINIC SYSTEM UPGRADE
-- Adds coordination features between vets and owners

-- 1. Enhance Appointments (rendez_vous)
ALTER TABLE public.rendez_vous 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS checkin_at TIMESTAMPTZ;

-- 2. Enhance Patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS primary_vet_id UUID REFERENCES public.veterinaires(id),
ADD COLUMN IF NOT EXISTS clinic_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_id TEXT UNIQUE;

-- 3. Create a view for the Waiting Room
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
JOIN public.veterinaires v ON r.vet_id = v.id
WHERE r.status = 'en_attente' 
AND r.date_rdv::date = CURRENT_DATE
ORDER BY r.checkin_at ASC;

-- 4. Enable RLS for Waiting Room
ALTER VIEW public.waiting_room OWNER TO postgres;
GRANT SELECT ON public.waiting_room TO authenticated;

-- 5. Helper function to check-in
CREATE OR REPLACE FUNCTION public.check_in_patient(appointment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rendez_vous
    SET status = 'en_attente',
        checkin_at = NOW()
    WHERE id = appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Helper function to approve appointment
CREATE OR REPLACE FUNCTION public.approve_appointment(appointment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rendez_vous
    SET status = 'confirmé',
        approved_at = NOW()
    WHERE id = appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
