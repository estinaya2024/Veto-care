-- VetoCare - Workflow Logic & Lifecycle Upgrade
-- Run this in your Supabase SQL Editor

-- 1. Link Consultations to Appointments
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.rendez_vous(id) ON DELETE SET NULL;

-- 2. Add Archiving to Patients
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- 3. Add 'en_attente' (Salle d'attente) status to Appointments if not exists
-- (Assuming status is text, but good to ensure logic)

-- 4. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_consult_appointment ON public.consultations(appointment_id);
