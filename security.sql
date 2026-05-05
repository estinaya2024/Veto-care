-- 5. SECURITY (RLS)
ALTER TABLE public.maitres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indisponibilites_vet ENABLE ROW LEVEL SECURITY;

-- Vets: Full Access
CREATE POLICY "Vet: Full Access" ON public.patients FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Vet: Manage Bookings" ON public.rendez_vous FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Vet: Manage Consults" ON public.consultations FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Vet: Manage Prescriptions" ON public.prescriptions FOR ALL TO authenticated USING (is_vet());
CREATE POLICY "Vet: Manage Unavail" ON public.indisponibilites_vet FOR ALL TO authenticated USING (is_vet());

-- Public: View Vets
CREATE POLICY "Public: View Vets" ON public.veterinaires FOR SELECT USING (true);
CREATE POLICY "Public: View Unavail" ON public.indisponibilites_vet FOR SELECT USING (true);

-- Owners: Manage Own
CREATE POLICY "Owner: My Profile" ON public.maitres FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Owner: My Pets" ON public.patients FOR ALL TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owner: My Bookings" ON public.rendez_vous FOR ALL TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owner: View Consults" ON public.consultations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.maitre_id = auth.uid()));
CREATE POLICY "Owner: View Prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.consultations c JOIN public.patients p ON c.patient_id = p.id WHERE c.id = consultation_id AND p.maitre_id = auth.uid()));
CREATE POLICY "Owner: My Docs" ON public.medical_documents FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.maitre_id = auth.uid()));