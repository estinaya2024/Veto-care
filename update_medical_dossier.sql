-- VetoCare - Medical Dossier Update
-- This script adds support for persistent medical documents (PDFs, Images) for patients.

-- 1. Create medical_documents table
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    doc_type TEXT DEFAULT 'other', -- 'imaging', 'lab_result', 'vaccination', 'report', 'other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Vets can see all medical documents
DROP POLICY IF EXISTS "Vet: Full Access Docs" ON public.medical_documents;
CREATE POLICY "Vet: Full Access Docs" ON public.medical_documents 
FOR ALL TO authenticated USING (public.is_vet());

-- Owners can see documents for their pets
DROP POLICY IF EXISTS "Owner: See My Pets Docs" ON public.medical_documents;
CREATE POLICY "Owner: See My Pets Docs" ON public.medical_documents 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = medical_documents.patient_id AND maitre_id = auth.uid()));

-- Owners can upload documents for their pets
DROP POLICY IF EXISTS "Owner: Upload My Pets Docs" ON public.medical_documents;
CREATE POLICY "Owner: Upload My Pets Docs" ON public.medical_documents 
FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND maitre_id = auth.uid()));

-- 4. Update patients table with clinical info
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;
